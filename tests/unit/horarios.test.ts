import { describe, expect, test } from "vitest";
import { buscarLocalComoSitioViejo, estaAbierto } from "@/lib/horarios";
import type { Local } from "@/lib/tipos";

const local = (cambios: Partial<Local>): Local => ({
  nombre: "Local",
  direccion: "",
  semana: "",
  domingo: "",
  foto: "",
  abre: "08:30",
  cierra: "21:00",
  domAbre: null,
  domCierra: null,
  fotoDetalle: "",
  fotoDetalleAlt: "",
  encuadreDetalle: "center",
  comoLlegar: "",
  mapaUrl: "",
  ...cambios,
});
const maipu = local({ nombre: "Local Maipú" });
const avellaneda = local({ nombre: "Local Avellaneda", domAbre: "09:30", domCierra: "13:30" });
// Jueves 01/10/2026 y domingo 04/10/2026, hora de Argentina
const hora = (dia: string, hhmm: string) => new Date(`2026-10-${dia}T${hhmm}:00-03:00`);

describe("estaAbierto", () => {
  test("lunes a sábado: abre incluido, cierra excluido", () => {
    expect(estaAbierto(maipu, hora("01", "08:29"))).toBe(false);
    expect(estaAbierto(maipu, hora("01", "08:30"))).toBe(true);
    expect(estaAbierto(maipu, hora("01", "20:59"))).toBe(true);
    expect(estaAbierto(maipu, hora("01", "21:00"))).toBe(false);
  });

  test("domingo: cerrado si no tiene horario", () => {
    expect(estaAbierto(maipu, hora("04", "11:00"))).toBe(false);
    expect(estaAbierto(avellaneda, hora("04", "11:00"))).toBe(true);
    expect(estaAbierto(avellaneda, hora("04", "13:30"))).toBe(false);
  });

  test("usa la hora de Argentina, no la del dispositivo", () => {
    // 14:00 UTC = 11:00 en Argentina (jueves)
    expect(estaAbierto(maipu, new Date("2026-10-01T14:00:00Z"))).toBe(true);
    // 00:30 UTC del viernes = 21:30 del jueves en Argentina
    expect(estaAbierto(maipu, new Date("2026-10-02T00:30:00Z"))).toBe(false);
  });
});

describe("buscarLocalComoSitioViejo", () => {
  test("busca por inclusión del nombre, como el sitio viejo", () => {
    expect(buscarLocalComoSitioViejo([maipu, avellaneda], "avellaneda")).toBe(avellaneda);
  });

  test('"maipu" sin tilde no encuentra "Local Maipú" (igual que el sitio viejo; backlog 11)', () => {
    expect(buscarLocalComoSitioViejo([maipu, avellaneda], "maipu")).toBeUndefined();
  });
});
