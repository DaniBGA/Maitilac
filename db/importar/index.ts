/**
 * Paso 3.3 — Importa los datos de fábrica (db/importar/data/*.json, extraídos del
 * sitio viejo) a PostgreSQL. Ver docs/PLAN DE REFACTORIZACION.md, sección 6.
 *
 *   pnpm db:importar            → sólo si la base está vacía
 *   pnpm db:importar --forzar   → borra todo y vuelve a importar (¡pisa lo editado en el gestor!)
 */
import { existsSync, readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "../schema";
import { precioTexto, separarPrecio } from "../../lib/precio";
import { slug } from "../../lib/util";

type ProductoViejo = {
  nombre: string;
  destacado?: boolean;
  tipo: string;
  activo: boolean;
  desc: string;
  precio: string;
  unidad: string;
  verPrecio?: boolean;
  badge: string;
  photos: string[];
  comida: string[];
  bebida: string[];
  presentaciones: string[];
  quesos: string[];
  premios: string;
};
type LocalViejo = {
  nombre: string;
  direccion: string;
  semana: string;
  domingo: string;
  foto: string;
  abre: string;
  cierra: string;
  domAbre: string | null;
  domCierra: string | null;
};
type Extras = {
  config: { facebook: string };
  locales: Record<
    string,
    {
      fotoDetalle: string;
      fotoDetalleAlt: string;
      encuadreDetalle: string;
      comoLlegar: string;
      mapaUrl: string;
    }
  >;
  productoDelMes: {
    producto: string;
    texto: string;
    foto: string;
    precioMostrado: string;
    unidadMostrada: string;
  };
};

const leer = <T>(nombre: string): T => JSON.parse(readFileSync(`db/importar/data/${nombre}.json`, "utf8"));

async function main() {
  const forzar = process.argv.includes("--forzar");
  const conexion = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const db = drizzle(conexion, { schema: s });
  const avisos: string[] = [];

  const productosV = leer<ProductoViejo[]>("productos");
  const ocasionesV = leer<{ key: string; label: string; ver: boolean; match: string[] }[]>("ocasiones");
  const anunciosV = leer<Record<string, { ver: boolean; texto: string; color: string }>>("anuncios");
  const premiosV =
    leer<{ anio: string; titulo: string; evento: string; detalle: string; foto: string; ver: boolean }[]>(
      "premios",
    );
  const equipoV = leer<{ nombre: string; rol: string; area: string; foto: string; ver: boolean }[]>("equipo");
  const localesV = leer<LocalViejo[]>("locales");
  const configV = leer<{
    whatsapp: string;
    whatsappMayorista: string;
    telefono: string;
    email: string;
    instagram: string;
  }>("config");
  const extras = leer<Extras>("extras");

  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.productos);
  if (n > 0 && !forzar) {
    console.error(
      `La base ya tiene ${n} productos. Para borrar todo y volver a importar: pnpm db:importar --forzar`,
    );
    await conexion.end();
    process.exit(1);
  }

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE fotos, productos, producto_fotos, combo_quesos, ocasiones, ocasion_productos,
      anuncios, premios, equipo, locales, config, producto_del_mes CASCADE`);

    // ---------- Fotos: cada archivo una sola vez ----------
    const alts: Record<string, string> = {};
    for (const e of Object.values(extras.locales)) alts[e.fotoDetalle] = e.fotoDetalleAlt;
    const rutas = new Set<string>(
      [
        ...productosV.flatMap((p) => p.photos),
        ...localesV.map((l) => l.foto),
        ...Object.values(extras.locales).map((e) => e.fotoDetalle),
        ...premiosV.map((p) => p.foto),
        ...equipoV.map((p) => p.foto),
        extras.productoDelMes.foto,
      ].filter(Boolean),
    );
    const fotoId: Record<string, string> = {};
    for (const archivo of rutas) {
      if (!existsSync(`public/${archivo}`)) avisos.push(`Foto no encontrada en public/: ${archivo}`);
      const [f] = await tx
        .insert(s.fotos)
        .values({ archivo, alt: alts[archivo] ?? null })
        .returning({ id: s.fotos.id });
      fotoId[archivo] = f.id;
    }
    const idFoto = (r: string) => (r ? fotoId[r] : null);

    // ---------- Productos ----------
    const productoId: Record<string, string> = {};
    for (const [orden, p] of productosV.entries()) {
      const { prefijo, valor } = separarPrecio(p.precio);
      // El precio reconstruido tiene que ser idéntico al del sitio viejo
      if (precioTexto(valor, prefijo) !== p.precio && !(valor === null && p.precio === "Consultar"))
        throw new Error(`El precio de "${p.nombre}" no se reconstruye igual: "${p.precio}"`);
      const [fila] = await tx
        .insert(s.productos)
        .values({
          slug: slug(p.nombre),
          nombre: p.nombre,
          tipo: p.tipo ?? "",
          descripcion: p.desc ?? "",
          precio: valor,
          precioPrefijo: prefijo,
          unidad: p.unidad ?? "",
          verPrecio: p.verPrecio !== false,
          badge: p.badge ?? "",
          destacado: !!p.destacado,
          presentaciones: p.presentaciones ?? [],
          maridajeComida: p.comida ?? [],
          maridajeBebida: p.bebida ?? [],
          premiosTexto: p.premios ?? "",
          activo: p.activo !== false,
          orden,
        })
        .returning({ id: s.productos.id });
      productoId[p.nombre] = fila.id;
      for (const [k, foto] of p.photos.entries())
        await tx.insert(s.productoFotos).values({ productoId: fila.id, fotoId: fotoId[foto], orden: k });
    }
    for (const p of productosV)
      for (const [k, q] of (p.quesos ?? []).entries()) {
        if (!productoId[q]) {
          avisos.push(`"${p.nombre}" incluye "${q}", que no es un producto`);
          continue;
        }
        await tx
          .insert(s.comboQuesos)
          .values({ comboId: productoId[p.nombre], quesoId: productoId[q], orden: k });
      }

    // ---------- Ocasiones ----------
    for (const [orden, o] of ocasionesV.entries()) {
      const [fila] = await tx
        .insert(s.ocasiones)
        .values({ clave: o.key, label: o.label, ver: o.ver !== false, orden })
        .returning({ id: s.ocasiones.id });
      for (const nombre of o.match) {
        if (!productoId[nombre]) {
          avisos.push(`El filtro "${o.label}" nombra a "${nombre}", que no es un producto`);
          continue;
        }
        await tx.insert(s.ocasionProductos).values({ ocasionId: fila.id, productoId: productoId[nombre] });
      }
    }

    // ---------- Anuncios, premios, equipo ----------
    for (const [clave, a] of Object.entries(anunciosV))
      await tx.insert(s.anuncios).values({ clave, ver: a.ver, texto: a.texto, color: a.color });
    for (const [orden, p] of premiosV.entries())
      await tx
        .insert(s.premios)
        .values({
          anio: p.anio,
          titulo: p.titulo,
          evento: p.evento,
          detalle: p.detalle,
          fotoId: idFoto(p.foto),
          ver: p.ver !== false,
          orden,
        });
    for (const [orden, m] of equipoV.entries())
      await tx
        .insert(s.equipo)
        .values({
          nombre: m.nombre,
          rol: m.rol,
          area: m.area,
          fotoId: idFoto(m.foto),
          ver: m.ver !== false,
          orden,
        });

    // ---------- Locales ----------
    for (const [orden, l] of localesV.entries()) {
      const e = extras.locales[l.nombre];
      if (!e) throw new Error(`Faltan los datos de la página Locales para "${l.nombre}"`);
      await tx.insert(s.locales).values({
        nombre: l.nombre,
        direccion: l.direccion,
        horarioSemana: l.semana,
        horarioDomingo: l.domingo,
        abre: l.abre,
        cierra: l.cierra,
        domAbre: l.domAbre,
        domCierra: l.domCierra,
        fotoId: idFoto(l.foto),
        fotoDetalleId: idFoto(e.fotoDetalle),
        encuadreDetalle: e.encuadreDetalle,
        comoLlegar: e.comoLlegar,
        mapaUrl: e.mapaUrl,
        orden,
      });
    }

    // ---------- Config y producto del mes ----------
    await tx.insert(s.config).values({ ...configV, facebook: extras.config.facebook });
    const pm = extras.productoDelMes;
    const pv = productosV.find((p) => p.nombre === pm.producto);
    if (!pv) throw new Error(`El producto del mes "${pm.producto}" no existe`);
    if (pv.precio !== pm.precioMostrado || pv.unidad !== pm.unidadMostrada)
      throw new Error(
        `El producto del mes muestra "${pm.precioMostrado} / ${pm.unidadMostrada}" pero el producto tiene "${pv.precio} / ${pv.unidad}"`,
      );
    await tx
      .insert(s.productoDelMes)
      .values({ productoId: productoId[pm.producto], texto: pm.texto, fotoId: fotoId[pm.foto] });
  });

  // ---------- Informe ----------
  console.log("Importación terminada:");
  for (const [nombre, tabla] of Object.entries({
    fotos: s.fotos,
    productos: s.productos,
    producto_fotos: s.productoFotos,
    combo_quesos: s.comboQuesos,
    ocasiones: s.ocasiones,
    ocasion_productos: s.ocasionProductos,
    anuncios: s.anuncios,
    premios: s.premios,
    equipo: s.equipo,
    locales: s.locales,
    config: s.config,
    producto_del_mes: s.productoDelMes,
  })) {
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(tabla);
    console.log(`  ${nombre.padEnd(18)} ${n}`);
  }
  if (avisos.length) console.log("\nAvisos:\n  " + avisos.join("\n  "));
  else console.log("\nSin avisos: todas las fotos existen y todos los nombres se relacionaron.");
  await conexion.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
