// Armado de enlaces de WhatsApp, con los mismos textos que el sitio viejo.

export type Pestana = "consulta" | "mayorista";

/** Mensaje del formulario de contacto: submit de #form-contacto, referencia/index.html:2269-2281. */
export function mensajeContacto(
  pestana: Pestana,
  d: { nombre: string; email: string; telefono: string; mensaje: string },
) {
  return (
    `Hola Maitilac! (${pestana === "mayorista" ? "Compra por mayor" : "Compra en el local"})\n\n` +
    `Nombre: ${d.nombre}\n` +
    `Email: ${d.email}\n` +
    (d.telefono ? `Teléfono: ${d.telefono}\n` : "") +
    `\n${d.mensaje}`
  );
}

export const enlaceWhatsApp = (numero: string, texto: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
