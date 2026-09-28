// Datos que maneja el gestor (misma forma que las listas del gestor viejo, más el id).
import type { Anuncios } from "../tipos";

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

export type DatosGestor = {
  anuncios: Anuncios;
  ocasiones: GOcasion[];
  premios: GPremio[];
  equipo: GPersona[];
  productos: GProducto[];
};

/** Lo que se edita en el panel lateral de un producto. */
export type ProductoEditado = Omit<GProducto, "id">;

/** Resultado de una acción: los datos actualizados, o un mensaje de error. */
export type Resultado = { ok: true; datos: DatosGestor; aviso?: string } | { ok: false; error: string };
