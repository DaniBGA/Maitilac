/**
 * Esquema de la base de datos (docs/PLAN DE REFACTORIZACION.md, sección 4.3).
 * Sólo lo que el gestor edita, más locales y datos de contacto. Los textos fijos
 * (historia, proceso, cifras, Instagram) viven en content/, versionados en git.
 *
 *   pnpm db:generar   → genera la migración SQL a partir de este archivo
 *   pnpm db:migrar    → la aplica
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const creado = () => timestamp("creado_en", { withTimezone: true }).notNull().defaultNow();
const actualizado = () =>
  timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/** Inventario único de fotos: es el "Banco de fotos" del gestor (registro §24). */
export const fotos = pgTable("fotos", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Ruta del archivo: "img/gouda-1.jpg" (public/) o "fotos/<uuid>.jpg" (subida desde el gestor).
   *  Las versiones AVIF/WebP las genera el optimizador de Next al pedirlas (components/sitio/Foto.tsx). */
  archivo: text("archivo").notNull().unique(),
  alt: text("alt"),
  creadoEn: creado(),
});

export const productos = pgTable("productos", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull().default(""),
  descripcion: text("descripcion").notNull().default(""),
  /** null = "Consultar". */
  precio: numeric("precio", { precision: 10, scale: 2 }),
  /** Texto antes del precio, ej. "Desde". */
  precioPrefijo: text("precio_prefijo"),
  unidad: text("unidad").notNull().default(""),
  verPrecio: boolean("ver_precio").notNull().default(true),
  badge: text("badge").notNull().default(""),
  destacado: boolean("destacado").notNull().default(false),
  presentaciones: text("presentaciones")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  maridajeComida: text("maridaje_comida")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  maridajeBebida: text("maridaje_bebida")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  /** Se conserva tal cual: "ORO 2019, ORO 2023 Y ORO 2025". */
  premiosTexto: text("premios_texto").notNull().default(""),
  activo: boolean("activo").notNull().default(true),
  orden: integer("orden").notNull(),
  /** Borrado lógico: reemplaza la lista "maitilac_borrados" del gestor viejo. */
  eliminadoEn: timestamp("eliminado_en", { withTimezone: true }),
  creadoEn: creado(),
  actualizadoEn: actualizado(),
});

export const productoFotos = pgTable(
  "producto_fotos",
  {
    productoId: uuid("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    fotoId: uuid("foto_id")
      .notNull()
      .references(() => fotos.id, { onDelete: "restrict" }),
    orden: integer("orden").notNull(),
  },
  (t) => [primaryKey({ columns: [t.productoId, t.fotoId] })],
);

/** Quesos que incluye un combo o picada, por id (plan, P4). */
export const comboQuesos = pgTable(
  "combo_quesos",
  {
    comboId: uuid("combo_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    quesoId: uuid("queso_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    orden: integer("orden").notNull(),
  },
  (t) => [primaryKey({ columns: [t.comboId, t.quesoId] })],
);

/** Filtros "Buscá por ocasión". */
export const ocasiones = pgTable("ocasiones", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Clave del sitio viejo ("picadita", "parrilla"…); los filtros nuevos generan una. */
  clave: text("clave").notNull().unique(),
  label: text("label").notNull(),
  ver: boolean("ver").notNull().default(true),
  orden: integer("orden").notNull(),
});

export const ocasionProductos = pgTable(
  "ocasion_productos",
  {
    ocasionId: uuid("ocasion_id")
      .notNull()
      .references(() => ocasiones.id, { onDelete: "cascade" }),
    productoId: uuid("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ocasionId, t.productoId] })],
);

/** Los tres carteles de la portada. */
export const anuncios = pgTable(
  "anuncios",
  {
    clave: text("clave").primaryKey(),
    ver: boolean("ver").notNull().default(true),
    texto: text("texto").notNull().default(""),
    color: text("color").notNull().default("marron"),
  },
  (t) => [
    check("anuncios_clave", sql`${t.clave} in ('barra','badge1','badge2')`),
    check("anuncios_color", sql`${t.color} in ('marron','naranja','verde')`),
  ],
);

export const premios = pgTable("premios", {
  id: uuid("id").primaryKey().defaultRandom(),
  anio: text("anio").notNull().default(""),
  titulo: text("titulo").notNull().default(""),
  evento: text("evento").notNull().default(""),
  detalle: text("detalle").notNull().default(""),
  fotoId: uuid("foto_id").references(() => fotos.id, { onDelete: "set null" }),
  ver: boolean("ver").notNull().default(true),
  orden: integer("orden").notNull(),
});

export const equipo = pgTable("equipo", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull().default(""),
  rol: text("rol").notNull().default(""),
  area: text("area").notNull().default(""),
  fotoId: uuid("foto_id").references(() => fotos.id, { onDelete: "set null" }),
  ver: boolean("ver").notNull().default(true),
  orden: integer("orden").notNull(),
});

export const locales = pgTable("locales", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  direccion: text("direccion").notNull(),
  /** Lo que se muestra, tal cual ("8:30 a 21:00 hs"). */
  horarioSemana: text("horario_semana").notNull().default(""),
  horarioDomingo: text("horario_domingo").notNull().default(""),
  /** Lo que calcula "Abierto ahora" ("08:30"). Domingo en null = cerrado. */
  abre: text("abre").notNull(),
  cierra: text("cierra").notNull(),
  domAbre: text("dom_abre"),
  domCierra: text("dom_cierra"),
  /** Foto del resumen del Inicio. */
  fotoId: uuid("foto_id").references(() => fotos.id, { onDelete: "set null" }),
  /** Foto de la página Locales. */
  fotoDetalleId: uuid("foto_detalle_id").references(() => fotos.id, { onDelete: "set null" }),
  /** Encuadre de esa foto (object-position), ej. "center 40%". */
  encuadreDetalle: text("encuadre_detalle").notNull().default("center"),
  comoLlegar: text("como_llegar").notNull().default(""),
  mapaUrl: text("mapa_url").notNull().default(""),
  orden: integer("orden").notNull(),
});

/** Datos de contacto (una sola fila). */
export const config = pgTable(
  "config",
  {
    id: integer("id").primaryKey().default(1),
    whatsapp: text("whatsapp").notNull(),
    whatsappMayorista: text("whatsapp_mayorista").notNull(),
    telefono: text("telefono").notNull(),
    email: text("email").notNull(),
    instagram: text("instagram").notNull(),
    facebook: text("facebook").notNull(),
  },
  (t) => [check("config_una_fila", sql`${t.id} = 1`)],
);

/**
 * Bloque "Producto del mes" del catálogo (una sola fila). Tiene su propio texto
 * y foto: en el sitio viejo no coinciden con la descripción ni la primera foto
 * del producto. Nombre, precio y unidad salen del producto.
 */
export const productoDelMes = pgTable(
  "producto_del_mes",
  {
    id: integer("id").primaryKey().default(1),
    productoId: uuid("producto_id").references(() => productos.id, { onDelete: "set null" }),
    texto: text("texto").notNull().default(""),
    fotoId: uuid("foto_id").references(() => fotos.id, { onDelete: "set null" }),
  },
  (t) => [check("producto_del_mes_una_fila", sql`${t.id} = 1`)],
);

// ---------- Login del gestor (Better Auth) ----------
export * from "./esquema-auth";
