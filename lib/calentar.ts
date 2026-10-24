/**
 * Genera de antemano las versiones optimizadas de las fotos (AVIF y WebP de cada ancho
 * del srcset), para que ningún visitante tenga que esperarlas.
 *
 * El optimizador de Next las genera la primera vez que alguien las pide y después las
 * sirve de la caché (.next/cache/images) en milisegundos. Pero generar un AVIF tarda
 * entre 0,7 y 2 s por foto, y una página nueva pide varias juntas: la primera visita
 * después de un deploy o de subir una foto tardaba varios segundos en mostrar las fotos.
 *
 * Recorre el sitio como un navegador (las páginas del sitemap), junta las direcciones
 * /_next/image de cada src y srcset y las pide de a una, para no quitarle procesador al
 * sitio. Las que ya están en la caché responden enseguida.
 *
 * Lo usan scripts/calentar-imagenes.ts (después de cada deploy) y el gestor (después
 * de cambiar fotos). Sin dependencias de Next: corre también como herramienta suelta.
 */

/** Lo que piden los navegadores: AVIF los de hoy, WebP los que no lo soportan. */
const FORMATOS = ["image/avif,image/webp,*/*", "image/webp,*/*"];

export type Calentado = { paginas: number; fotos: number; generadas: number; errores: number };

let enCurso: Promise<Calentado> | null = null;
let otraVez = false;

/**
 * Calienta la caché de imágenes del sitio en `base` (ej. http://127.0.0.1:3000).
 * Si ya hay un recorrido en curso no arranca otro: deja anotado que hay que repetirlo
 * al terminar (así una foto subida en el medio también queda lista).
 */
export function calentarImagenes(base: string): Promise<Calentado> {
  if (enCurso) {
    otraVez = true;
    return enCurso;
  }
  enCurso = (async () => {
    let r: Calentado;
    do {
      otraVez = false;
      r = await recorrer(base);
    } while (otraVez);
    return r;
  })().finally(() => (enCurso = null));
  return enCurso;
}

async function recorrer(base: string): Promise<Calentado> {
  const r: Calentado = { paginas: 0, fotos: 0, generadas: 0, errores: 0 };
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  // El sitemap trae la dirección pública: sólo se usa la ruta.
  const rutas = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  const fotos = new Set<string>();
  for (const ruta of rutas) {
    const res = await fetch(`${base}${ruta}`);
    if (!res.ok) {
      r.errores++;
      continue;
    }
    r.paginas++;
    // Sólo los atributos del HTML: la misma dirección aparece también, escapada de otra
    // forma, en los datos de React que viajan con la página.
    for (const [, valor] of (await res.text()).matchAll(/\s(?:src|srcset)="([^"]*\/_next\/image[^"]*)"/gi)) {
      for (const candidata of valor.split(",")) fotos.add(candidata.trim().split(" ")[0].replaceAll("&amp;", "&"));
    }
  }
  r.fotos = fotos.size;

  for (const foto of fotos) {
    for (const accept of FORMATOS) {
      try {
        const res = await fetch(`${base}${foto}`, { headers: { accept } });
        await res.arrayBuffer();
        if (!res.ok) r.errores++;
        else if (res.headers.get("x-nextjs-cache") !== "HIT") r.generadas++;
      } catch {
        r.errores++;
      }
    }
  }
  return r;
}
