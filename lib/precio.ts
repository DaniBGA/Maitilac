/**
 * Precio: en la base se guarda como número + prefijo (plan, 4.3); en el sitio se
 * muestra con el mismo formato que el sitio viejo ("$4500", "Desde $8500",
 * "Consultar"). El formato con separador de miles es la decisión abierta D3.
 */

/** "Desde $8500" → { prefijo: "Desde", valor: "8500" }; "Consultar" → valor null. */
export function separarPrecio(texto: string): { prefijo: string | null; valor: string | null } {
  const t = texto.trim();
  if (t === "" || t === "Consultar") return { prefijo: null, valor: null };
  const m = t.match(/^(?:(.+?) )?\$(\d+(?:\.\d+)?)$/);
  if (!m) throw new Error(`Precio con formato desconocido: "${texto}"`);
  return { prefijo: m[1] ?? null, valor: m[2] };
}

/** { prefijo: "Desde", valor: "8500.00" } → "Desde $8500". */
export function precioTexto(valor: string | null, prefijo: string | null): string {
  if (valor === null) return "Consultar";
  return `${prefijo ? prefijo + " " : ""}$${Number(valor)}`;
}
