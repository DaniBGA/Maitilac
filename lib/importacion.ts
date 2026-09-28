/**
 * Carga de los datos de fábrica (los del sitio viejo, db/importar/data/*.json) en
 * la base. La usan el script `pnpm db:importar` y los botones "Restaurar" del gestor.
 */
import { inArray, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as s from "../db/schema";
import { precioTexto, separarPrecio } from "./precio";
import { slug } from "./util";

/** Base o transacción (las dos sirven). */
export type BD = Pick<PostgresJsDatabase<typeof s>, "insert" | "select" | "update" | "delete" | "execute">;

export type ProductoFabrica = {
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
export type OcasionFabrica = { key: string; label: string; ver: boolean; match: string[] };
export type PremioFabrica = {
  anio: string;
  titulo: string;
  evento: string;
  detalle: string;
  foto: string;
  ver: boolean;
};
export type PersonaFabrica = { nombre: string; rol: string; area: string; foto: string; ver: boolean };
export type LocalFabrica = {
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
export type ExtrasFabrica = {
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

/** Registra cada archivo una sola vez en el banco de fotos y devuelve sus ids. */
export async function asegurarFotos(bd: BD, rutas: string[], alts: Record<string, string> = {}) {
  const unicas = [...new Set(rutas.filter(Boolean))];
  if (unicas.length)
    await bd
      .insert(s.fotos)
      .values(unicas.map((archivo) => ({ archivo, alt: alts[archivo] ?? null })))
      .onConflictDoNothing({ target: s.fotos.archivo });
  const filas = unicas.length
    ? await bd
        .select({ id: s.fotos.id, archivo: s.fotos.archivo })
        .from(s.fotos)
        .where(inArray(s.fotos.archivo, unicas))
    : [];
  return Object.fromEntries(filas.map((f) => [f.archivo, f.id])) as Record<string, string>;
}

/** Productos con sus fotos y quesos. Valida que cada precio se reconstruya idéntico. */
export async function importarProductos(bd: BD, productos: ProductoFabrica[], avisos: string[] = []) {
  const fotoId = await asegurarFotos(
    bd,
    productos.flatMap((p) => p.photos),
  );
  const productoId: Record<string, string> = {};
  for (const [orden, p] of productos.entries()) {
    const { prefijo, valor } = separarPrecio(p.precio);
    if (precioTexto(valor, prefijo) !== p.precio && !(valor === null && p.precio === "Consultar"))
      throw new Error(`El precio de "${p.nombre}" no se reconstruye igual: "${p.precio}"`);
    const [fila] = await bd
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
      await bd.insert(s.productoFotos).values({ productoId: fila.id, fotoId: fotoId[foto], orden: k });
  }
  for (const p of productos)
    for (const [k, q] of (p.quesos ?? []).entries()) {
      if (!productoId[q]) {
        avisos.push(`"${p.nombre}" incluye "${q}", que no es un producto`);
        continue;
      }
      await bd
        .insert(s.comboQuesos)
        .values({ comboId: productoId[p.nombre], quesoId: productoId[q], orden: k });
    }
  return productoId;
}

export async function importarOcasiones(
  bd: BD,
  ocasiones: OcasionFabrica[],
  productoId: Record<string, string>,
  avisos: string[] = [],
) {
  for (const [orden, o] of ocasiones.entries()) {
    const [fila] = await bd
      .insert(s.ocasiones)
      .values({ clave: o.key, label: o.label, ver: o.ver !== false, orden })
      .returning({ id: s.ocasiones.id });
    for (const nombre of o.match) {
      if (!productoId[nombre]) {
        avisos.push(`El filtro "${o.label}" nombra a "${nombre}", que no es un producto`);
        continue;
      }
      await bd.insert(s.ocasionProductos).values({ ocasionId: fila.id, productoId: productoId[nombre] });
    }
  }
}

export async function importarPremios(bd: BD, premios: PremioFabrica[]) {
  const fotoId = await asegurarFotos(
    bd,
    premios.map((p) => p.foto),
  );
  for (const [orden, p] of premios.entries())
    await bd.insert(s.premios).values({
      anio: p.anio,
      titulo: p.titulo,
      evento: p.evento,
      detalle: p.detalle,
      fotoId: p.foto ? fotoId[p.foto] : null,
      ver: p.ver !== false,
      orden,
    });
}

export async function importarEquipo(bd: BD, equipo: PersonaFabrica[]) {
  const fotoId = await asegurarFotos(
    bd,
    equipo.map((p) => p.foto),
  );
  for (const [orden, m] of equipo.entries())
    await bd.insert(s.equipo).values({
      nombre: m.nombre,
      rol: m.rol,
      area: m.area,
      fotoId: m.foto ? fotoId[m.foto] : null,
      ver: m.ver !== false,
      orden,
    });
}

export async function importarLocales(bd: BD, locales: LocalFabrica[], extras: ExtrasFabrica) {
  const alts: Record<string, string> = {};
  for (const e of Object.values(extras.locales)) alts[e.fotoDetalle] = e.fotoDetalleAlt;
  const fotoId = await asegurarFotos(
    bd,
    [...locales.map((l) => l.foto), ...Object.values(extras.locales).map((e) => e.fotoDetalle)],
    alts,
  );
  for (const [orden, l] of locales.entries()) {
    const e = extras.locales[l.nombre];
    if (!e) throw new Error(`Faltan los datos de la página Locales para "${l.nombre}"`);
    await bd.insert(s.locales).values({
      nombre: l.nombre,
      direccion: l.direccion,
      horarioSemana: l.semana,
      horarioDomingo: l.domingo,
      abre: l.abre,
      cierra: l.cierra,
      domAbre: l.domAbre,
      domCierra: l.domCierra,
      fotoId: l.foto ? fotoId[l.foto] : null,
      fotoDetalleId: fotoId[e.fotoDetalle] ?? null,
      encuadreDetalle: e.encuadreDetalle,
      comoLlegar: e.comoLlegar,
      mapaUrl: e.mapaUrl,
      orden,
    });
  }
}

/** Producto del mes: controla que muestre el mismo precio y unidad que el producto. */
export async function importarProductoDelMes(
  bd: BD,
  productos: ProductoFabrica[],
  productoId: Record<string, string>,
  extras: ExtrasFabrica,
) {
  const pm = extras.productoDelMes;
  const pv = productos.find((p) => p.nombre === pm.producto);
  if (!pv) throw new Error(`El producto del mes "${pm.producto}" no existe`);
  if (pv.precio !== pm.precioMostrado || pv.unidad !== pm.unidadMostrada)
    throw new Error(
      `El producto del mes muestra "${pm.precioMostrado} / ${pm.unidadMostrada}" pero el producto tiene "${pv.precio} / ${pv.unidad}"`,
    );
  const fotoId = await asegurarFotos(bd, [pm.foto]);
  await bd.execute(sql`DELETE FROM producto_del_mes`);
  await bd
    .insert(s.productoDelMes)
    .values({ productoId: productoId[pm.producto], texto: pm.texto, fotoId: fotoId[pm.foto] });
}
