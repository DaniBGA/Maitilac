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
  const n = Number(valor);
  // Enteros como en el sitio viejo ("$4500"); con centavos, "$4500,50".
  const monto = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
  return `${prefijo ? prefijo + " " : ""}$${monto}`;
}

/**
 * Lee el precio tal como se escribe en el gestor. Acepta "$4500", "4500",
 * "$4.500" (con punto de miles), "Desde $8500" y "Consultar" (o vacío).
 */
export function leerPrecioEscrito(texto: string): { prefijo: string | null; valor: string | null } {
  const t = texto.trim().replace(/\s+/g, " ").replace(/\$ /g, "$");
  if (t === "" || /^consultar$/i.test(t)) return { prefijo: null, valor: null };
  const m = t.match(/^(?:(.+?)\s+)?\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/);
  if (!m) throw new Error('Escribí el precio como "$4500", "Desde $8500" o "Consultar".');
  const entero = m[2].replace(/\./g, "");
  return { prefijo: m[1] ? m[1] : null, valor: m[3] ? `${entero}.${m[3]}` : entero };
}
