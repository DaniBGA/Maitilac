/**
 * Paso 3.3 — Importa los datos de fábrica (db/importar/data/*.json, extraídos del
 * sitio viejo) a PostgreSQL. Ver docs/PLAN DE REFACTORIZACION.md, sección 6.
 *
 *   pnpm db:importar            → sólo si la base está vacía
 *   pnpm db:importar --forzar   → borra todo y vuelve a importar (¡pisa lo editado en el gestor!)
 *
 * No toca los usuarios del gestor.
 */
import { existsSync, readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "../schema";
import {
  importarEquipo, importarLocales, importarOcasiones, importarPremios, importarProductoDelMes, importarProductos,
  type ExtrasFabrica, type LocalFabrica, type OcasionFabrica, type PersonaFabrica, type PremioFabrica,
  type ProductoFabrica,
} from "../../lib/importacion";

const leer = <T>(nombre: string): T => JSON.parse(readFileSync(`db/importar/data/${nombre}.json`, "utf8"));

async function main() {
  const forzar = process.argv.includes("--forzar");
  const conexion = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const db = drizzle(conexion, { schema: s });
  const avisos: string[] = [];

  const productos = leer<ProductoFabrica[]>("productos");
  const ocasiones = leer<OcasionFabrica[]>("ocasiones");
  const anuncios = leer<Record<string, { ver: boolean; texto: string; color: string }>>("anuncios");
  const premios = leer<PremioFabrica[]>("premios");
  const equipo = leer<PersonaFabrica[]>("equipo");
  const locales = leer<LocalFabrica[]>("locales");
  const config = leer<{ whatsapp: string; whatsappMayorista: string; telefono: string; email: string; instagram: string }>("config");
  const extras = leer<ExtrasFabrica>("extras");

  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.productos);
  if (n > 0 && !forzar) {
    console.error(`La base ya tiene ${n} productos. Para borrar todo y volver a importar: pnpm db:importar --forzar`);
    await conexion.end();
    process.exit(1);
  }

  // Todas las rutas de fotos tienen que existir en public/
  const rutas = [
    ...productos.flatMap((p) => p.photos), ...locales.map((l) => l.foto),
    ...Object.values(extras.locales).map((e) => e.fotoDetalle), ...premios.map((p) => p.foto),
    ...equipo.map((p) => p.foto), extras.productoDelMes.foto,
  ].filter(Boolean);
  for (const r of new Set(rutas)) if (!existsSync(`public/${r}`)) avisos.push(`Foto no encontrada en public/: ${r}`);

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE fotos, productos, producto_fotos, combo_quesos, ocasiones, ocasion_productos,
      anuncios, premios, equipo, locales, config, producto_del_mes CASCADE`);
    const productoId = await importarProductos(tx, productos, avisos);
    await importarOcasiones(tx, ocasiones, productoId, avisos);
    for (const [clave, a] of Object.entries(anuncios))
      await tx.insert(s.anuncios).values({ clave, ver: a.ver, texto: a.texto, color: a.color });
    await importarPremios(tx, premios);
    await importarEquipo(tx, equipo);
    await importarLocales(tx, locales, extras);
    await tx.insert(s.config).values({ ...config, facebook: extras.config.facebook });
    await importarProductoDelMes(tx, productos, productoId, extras);
  });

  console.log("Importación terminada:");
  for (const [nombre, tabla] of Object.entries({
    fotos: s.fotos, productos: s.productos, producto_fotos: s.productoFotos, combo_quesos: s.comboQuesos,
    ocasiones: s.ocasiones, ocasion_productos: s.ocasionProductos, anuncios: s.anuncios, premios: s.premios,
    equipo: s.equipo, locales: s.locales, config: s.config, producto_del_mes: s.productoDelMes,
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
