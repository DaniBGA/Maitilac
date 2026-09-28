/**
 * Paso 2.1 — Extrae los datos de fábrica del sitio viejo (referencia/index.html)
 * ejecutando su propio JavaScript, así no se copia nada a mano (regla 1: textos tal cual).
 *
 * Los textos fijos van a content/ y lo que edita el gestor, a db/importar/data/
 * (origen de `pnpm db:importar`). Los datos extra de Locales y del producto del
 * mes (db/importar/data/extras.json) se sacaron del HTML aparte.
 *
 *   pnpm datos:extraer
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CONSTANTES = [
  "CONFIG", "ANUNCIOS_BASE", "COLORES", "PRODUCTOS_BASE", "OCASIONES_BASE", "HISTORIA",
  "FOTOS_HISTORIA", "FOTOS_HOY", "LOCALES", "PASOS", "EQUIPO_BASE", "PREMIOS_BASE", "INSTA",
];

const nombreArchivo = (c: string) => c.replace(/_BASE$/, "").toLowerCase().replace(/_/g, "-");
const CONTENIDO_FIJO = ["colores", "historia", "fotos-historia", "fotos-hoy", "pasos", "insta"];
const carpeta = (nombre: string) => (CONTENIDO_FIJO.includes(nombre) ? "content" : "db/importar/data");

async function main() {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  // Sin datos guardados por el gestor: sólo los de fábrica.
  await pagina.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });
  await pagina.goto("file://" + resolve("referencia/index.html"));
  const datos = (await pagina.evaluate(`({ ${CONSTANTES.join(", ")} })`)) as Record<string, unknown>;
  await navegador.close();

  for (const c of CONSTANTES) {
    const nombre = nombreArchivo(c);
    mkdirSync(carpeta(nombre), { recursive: true });
    const archivo = `${carpeta(nombre)}/${nombre}.json`;
    writeFileSync(archivo, JSON.stringify(datos[c], null, 2) + "\n");
    const n = Array.isArray(datos[c]) ? (datos[c] as unknown[]).length : Object.keys(datos[c] as object).length;
    console.log(`${archivo.padEnd(36)} ${n}`);
  }
}

main();
