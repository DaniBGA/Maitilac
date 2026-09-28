import type { Local } from "./tipos";

const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};

/** Hora actual en Tandil (día de la semana y minutos desde las 00:00). */
function ahoraEnArgentina(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (t: string) => partes.find((p) => p.type === t)!.value;
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
  return { dia, min: Number(valor("hour")) * 60 + Number(valor("minute")) };
}

/**
 * ¿El local está abierto? Misma lógica que actualizarAbierto() del sitio viejo
 * (referencia/index.html:1934), pero con la hora de Argentina y no la del
 * dispositivo (plan, P11): para quien está en Argentina da exactamente igual.
 */
export function estaAbierto(l: Local, fecha = new Date()) {
  const { dia, min } = ahoraEnArgentina(fecha);
  if (dia === 0) return l.domAbre && l.domCierra ? min >= aMin(l.domAbre) && min < aMin(l.domCierra) : false;
  return min >= aMin(l.abre) && min < aMin(l.cierra);
}

/**
 * Busca el local como lo hacía actualizarAbierto() del sitio viejo: por inclusión
 * del nombre en minúsculas. Ojo: "maipu" (sin tilde) no coincide con "Local Maipú",
 * así que en la página Locales el cartel de Maipú queda vacío, igual que en el
 * sitio viejo (anotado en el backlog de la Etapa 7 de docs/PASO A PASO.md).
 */
export function buscarLocalComoSitioViejo(locales: Local[], clave: string) {
  const c = clave.toLowerCase();
  return (
    locales.find((x) => x.nombre.toLowerCase().includes(c)) ??
    locales.find((x) => c.includes(x.nombre.toLowerCase()))
  );
}
