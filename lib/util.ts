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

/**
 * ¿Se muestra el precio? Sólo si está activado y es un precio (no "Consultar").
 * Si no, no se muestra nada: ni el precio ni la palabra "Consultar" (pedido del cliente, 03/10/2026).
 */
export const precioVisible = (p: Pick<Producto, "verPrecio" | "precio">) =>
  p.verPrecio !== false && p.precio !== "Consultar";

/** Índice circular de foto, igual que el sitio viejo (tolera negativos). */
export const indiceCircular = (i: number, total: number) => (total ? ((i % total) + total) % total : 0);
// Nota: en el sitio viejo, un producto sin fotos tenía <img src="">. React no admite
// src vacío (avisa en consola), así que se omite el atributo: se ve igual.
