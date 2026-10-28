// Datos que maneja el gestor (misma forma que las listas del gestor viejo, más el id).
import type { Anuncios, Config } from "../tipos";

export type GProducto = {
  id: string;
  nombre: string;
  tipo: string;
  activo: boolean;
  destacado: boolean;
  desc: string;
  precio: string;
  verPrecio: boolean;
  unidad: string;
  badge: string;
  photos: string[];
  comida: string[];
  bebida: string[];
  presentaciones: string[];
  /** Nombres de los quesos que incluye (combos y picadas). */
  quesos: string[];
  premios: string;
};

export type GOcasion = { id: string; clave: string; label: string; ver: boolean; match: string[] };
export type GPremio = {
  id: string;
  anio: string;
  titulo: string;
  evento: string;
  detalle: string;
  foto: string;
  ver: boolean;
};
export type GPersona = { id: string; nombre: string; rol: string; area: string; foto: string; ver: boolean };

export type GLocal = {
  id: string;
  nombre: string;
  direccion: string;
  horarioSemana: string;
  horarioDomingo: string;
  abre: string;
  cierra: string;
  domAbre: string;
  domCierra: string;
  foto: string;
  fotoDetalle: string;
  comoLlegar: string;
  mapaUrl: string;
};

export type GProductoDelMes = { productoId: string; texto: string; foto: string };

/** Foto del banco: dónde se usa. */
export type GFoto = {
  id: string;
  archivo: string;
  /** Productos que la usan (nombres). */
  productos: string[];
  /** Otros usos (Premios, Equipo, Locales, Producto del mes). */
  otros: string[];
};

export type DatosGestor = {
  anuncios: Anuncios;
  ocasiones: GOcasion[];
  premios: GPremio[];
  equipo: GPersona[];
  productos: GProducto[];
  config: Config;
  locales: GLocal[];
  productoDelMes: GProductoDelMes;
  fotos: GFoto[];
};

/** Lo que se edita en el panel lateral de un producto. */
export type ProductoEditado = Omit<GProducto, "id">;

/** Resultado de una acción: los datos actualizados, o un mensaje de error. */
/**
 * Peso máximo de una foto subida desde el gestor. Lo controla el servidor (lib/gestor/fotos.ts)
 * y el gestor antes de mandarla. El límite de Next por envío (next.config.ts) deja margen sobre esto.
 */
export const FOTO_MAXIMO_MB = 15;
export const FOTO_PESADA = `La foto es demasiado pesada (máximo ${FOTO_MAXIMO_MB} MB).`;

export type Resultado =
  { ok: true; datos: DatosGestor; aviso?: string; id?: string } | { ok: false; error: string };
