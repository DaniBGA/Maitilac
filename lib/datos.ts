/**
 * Acceso a los datos del sitio.
 *
 * - Lo que edita el gestor sale de PostgreSQL, con caché por etiqueta: cada
 *   función guarda su resultado ('use cache') hasta que el gestor guarde un
 *   cambio en esa entidad y la invalide (updateTag, Etapa 5).
 * - Los textos fijos (historia, proceso, Instagram) salen de content/.
 *
 * Las funciones devuelven la misma forma que las constantes del sitio viejo, así
 * los componentes no dependen de cómo se guardan los datos.
 */
import { and, asc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import colores from "@/content/colores.json";
import fotosHistoria from "@/content/fotos-historia.json";
import fotosHoy from "@/content/fotos-hoy.json";
import historia from "@/content/historia.json";
import insta from "@/content/insta.json";
import pasos from "@/content/pasos.json";
import * as s from "@/db/schema";
import { db } from "./db";
import { precioTexto } from "./precio";
import type {
  Anuncios,
  Color,
  Config,
  FotoInsta,
  Hito,
  Local,
  Ocasion,
  Paso,
  Persona,
  Premio,
  Producto,
  ProductoDelMes,
} from "./tipos";
import { slug } from "./util";

/** Caché hasta que el gestor invalide alguna de estas etiquetas. */
function cachear(...etiquetas: string[]) {
  cacheLife("max");
  cacheTag(...etiquetas);
}

// ---------- Textos fijos (content/) ----------

/** Color de un anuncio; si no existe, marrón (como `col()` del sitio viejo). */
export const getColor = (clave: string): Color => (colores as Record<string, Color>)[clave] ?? colores.marron;
export const getHistoria = (): Hito[] => historia;
export const getFotosHistoria = (): string[] => fotosHistoria;
export const getFotosHoy = (): string[] => fotosHoy;
export const getPasos = (): Paso[] => pasos;
export const getInsta = (): FotoInsta[] => insta;

// ---------- Base de datos ----------

export async function getConfig(): Promise<Config> {
  "use cache";
  cachear("config");
  const [c] = await db.select().from(s.config).limit(1);
  return c;
}

export async function getAnuncios(): Promise<Anuncios> {
  "use cache";
  cachear("anuncios");
  const filas = await db.select().from(s.anuncios);
  const vacio = { ver: false, texto: "", color: "marron" };
  const por = (clave: string) => filas.find((f) => f.clave === clave) ?? vacio;
  return { barra: por("barra"), badge1: por("badge1"), badge2: por("badge2") };
}

/** Productos visibles en el sitio (activos y no borrados), en el orden del gestor. */
export async function getProductosVisibles(): Promise<Producto[]> {
  "use cache";
  cachear("productos");
  const filas = await db
    .select()
    .from(s.productos)
    .where(and(eq(s.productos.activo, true), isNull(s.productos.eliminadoEn)))
    .orderBy(asc(s.productos.orden));
  const fotos = await db
    .select({ productoId: s.productoFotos.productoId, archivo: s.fotos.archivo })
    .from(s.productoFotos)
    .innerJoin(s.fotos, eq(s.fotos.id, s.productoFotos.fotoId))
    .orderBy(asc(s.productoFotos.orden));
  const quesos = await db
    .select({ comboId: s.comboQuesos.comboId, nombre: s.productos.nombre })
    .from(s.comboQuesos)
    .innerJoin(s.productos, eq(s.productos.id, s.comboQuesos.quesoId))
    .orderBy(asc(s.comboQuesos.orden));

  return filas.map((p) => ({
    nombre: p.nombre,
    destacado: p.destacado,
    tipo: p.tipo,
    activo: p.activo,
    desc: p.descripcion,
    precio: precioTexto(p.precio, p.precioPrefijo),
    unidad: p.unidad,
    verPrecio: p.verPrecio,
    badge: p.badge,
    photos: fotos.filter((f) => f.productoId === p.id).map((f) => f.archivo),
    comida: p.maridajeComida,
    bebida: p.maridajeBebida,
    presentaciones: p.presentaciones,
    quesos: quesos.filter((q) => q.comboId === p.id).map((q) => q.nombre),
    premios: p.premiosTexto,
  }));
}

export async function getProductosDestacados(): Promise<Producto[]> {
  return (await getProductosVisibles()).filter((p) => p.destacado);
}

/** Producto visible por su slug (URL /catalogo/<slug>). */
export async function getProductoPorSlug(s: string): Promise<Producto | undefined> {
  return (await getProductosVisibles()).find((p) => slug(p.nombre) === s);
}

/** Filtros "Buscá por ocasión", con los nombres de sus productos (como `match` del sitio viejo). */
export async function getOcasiones(): Promise<Ocasion[]> {
  "use cache";
  cachear("ocasiones", "productos");
  const filas = await db.select().from(s.ocasiones).orderBy(asc(s.ocasiones.orden));
  const rel = await db
    .select({ ocasionId: s.ocasionProductos.ocasionId, nombre: s.productos.nombre })
    .from(s.ocasionProductos)
    .innerJoin(s.productos, eq(s.productos.id, s.ocasionProductos.productoId));
  return filas.map((o) => ({
    key: o.clave,
    label: o.label,
    ver: o.ver,
    match: rel.filter((r) => r.ocasionId === o.id).map((r) => r.nombre),
  }));
}

/** Bloque "Producto del mes": su texto y foto, más nombre, precio y unidad del producto. */
export async function getProductoDelMes(): Promise<ProductoDelMes | null> {
  "use cache";
  cachear("producto-del-mes", "productos");
  const [f] = await db
    .select({
      texto: s.productoDelMes.texto,
      foto: s.fotos.archivo,
      nombre: s.productos.nombre,
      precio: s.productos.precio,
      precioPrefijo: s.productos.precioPrefijo,
      unidad: s.productos.unidad,
      verPrecio: s.productos.verPrecio,
    })
    .from(s.productoDelMes)
    .innerJoin(s.productos, eq(s.productos.id, s.productoDelMes.productoId))
    .leftJoin(s.fotos, eq(s.fotos.id, s.productoDelMes.fotoId))
    .limit(1);
  if (!f) return null;
  return {
    nombre: f.nombre,
    slug: slug(f.nombre),
    texto: f.texto,
    foto: f.foto ?? "",
    precio: precioTexto(f.precio, f.precioPrefijo),
    unidad: f.unidad,
    verPrecio: f.verPrecio,
  };
}

export async function getLocales(): Promise<Local[]> {
  "use cache";
  cachear("locales");
  // Las dos fotos de cada local por join (antes se leía el banco de fotos entero).
  const fotoInicio = alias(s.fotos, "foto_inicio");
  const fotoLocales = alias(s.fotos, "foto_locales");
  const filas = await db
    .select({
      local: s.locales,
      foto: fotoInicio.archivo,
      fotoDetalle: fotoLocales.archivo,
      fotoDetalleAlt: fotoLocales.alt,
    })
    .from(s.locales)
    .leftJoin(fotoInicio, eq(fotoInicio.id, s.locales.fotoId))
    .leftJoin(fotoLocales, eq(fotoLocales.id, s.locales.fotoDetalleId))
    .orderBy(asc(s.locales.orden));
  return filas.map(({ local: l, foto, fotoDetalle, fotoDetalleAlt }) => ({
    nombre: l.nombre,
    direccion: l.direccion,
    semana: l.horarioSemana,
    domingo: l.horarioDomingo,
    foto: foto ?? "",
    abre: l.abre,
    cierra: l.cierra,
    domAbre: l.domAbre,
    domCierra: l.domCierra,
    fotoDetalle: fotoDetalle ?? "",
    fotoDetalleAlt: fotoDetalleAlt ?? "",
    encuadreDetalle: l.encuadreDetalle,
    comoLlegar: l.comoLlegar,
    mapaUrl: l.mapaUrl,
  }));
}

export async function getEquipoVisible(): Promise<Persona[]> {
  "use cache";
  cachear("equipo");
  const filas = await db
    .select({
      nombre: s.equipo.nombre,
      rol: s.equipo.rol,
      area: s.equipo.area,
      foto: s.fotos.archivo,
      ver: s.equipo.ver,
    })
    .from(s.equipo)
    .leftJoin(s.fotos, eq(s.fotos.id, s.equipo.fotoId))
    .where(eq(s.equipo.ver, true))
    .orderBy(asc(s.equipo.orden));
  return filas.map((m) => ({ ...m, foto: m.foto ?? "" }));
}

export async function getPremiosVisibles(): Promise<Premio[]> {
  "use cache";
  cachear("premios");
  const filas = await db
    .select({
      anio: s.premios.anio,
      titulo: s.premios.titulo,
      evento: s.premios.evento,
      detalle: s.premios.detalle,
      foto: s.fotos.archivo,
      ver: s.premios.ver,
    })
    .from(s.premios)
    .leftJoin(s.fotos, eq(s.fotos.id, s.premios.fotoId))
    .where(eq(s.premios.ver, true))
    .orderBy(asc(s.premios.orden));
  return filas.map((p) => ({ ...p, foto: p.foto ?? "" }));
}
