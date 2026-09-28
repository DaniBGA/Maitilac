import type { Producto } from "./tipos";

/** Las rutas del sitio viejo son relativas ("img/…"); en Next van desde la raíz. */
export const ruta = (src: string) => (src && !src.startsWith("/") && !/^https?:/.test(src) ? "/" + src : src);

/** Nombre → slug para la URL del producto ("Combo 3 Quesos" → "combo-3-quesos"). */
export const slug = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** precioVisible() del sitio viejo: si está apagado, se muestra "Consultar" sin unidad. */
export const precioVisible = (p: Producto) => p.verPrecio !== false;

/** Índice circular de foto, igual que el sitio viejo (tolera negativos). */
export const indiceCircular = (i: number, total: number) => (total ? ((i % total) + total) % total : 0);
