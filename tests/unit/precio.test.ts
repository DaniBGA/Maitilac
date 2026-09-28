import { describe, expect, test } from "vitest";
import productos from "@/db/importar/data/productos.json";
import { leerPrecioEscrito, precioTexto, separarPrecio } from "@/lib/precio";

describe("separarPrecio y precioTexto (datos de fábrica)", () => {
  test("separa prefijo y valor", () => {
    expect(separarPrecio("$4500")).toEqual({ prefijo: null, valor: "4500" });
    expect(separarPrecio("Desde $8500")).toEqual({ prefijo: "Desde", valor: "8500" });
    expect(separarPrecio("Consultar")).toEqual({ prefijo: null, valor: null });
    expect(() => separarPrecio("4500 pesos")).toThrow();
  });

  test("muestra el precio como el sitio viejo", () => {
    expect(precioTexto("4500.00", null)).toBe("$4500");
    expect(precioTexto("8500.00", "Desde")).toBe("Desde $8500");
    expect(precioTexto("4500.50", null)).toBe("$4500,50");
    expect(precioTexto(null, null)).toBe("Consultar");
  });

  test("todos los precios de fábrica se reconstruyen idénticos", () => {
    for (const p of productos) {
      const { prefijo, valor } = separarPrecio(p.precio);
      expect(precioTexto(valor, prefijo)).toBe(p.precio);
    }
  });
});

describe("leerPrecioEscrito (lo que se escribe en el gestor)", () => {
  test.each([
    ["$4500", null, "4500"],
    ["4500", null, "4500"],
    ["$ 4500", null, "4500"],
    ["$4.500", null, "4500"],
    ["4.500", null, "4500"],
    ["$4999", null, "4999"],
    ["$4500,50", null, "4500.50"],
    ["$1.234.567", null, "1234567"],
    ["Desde $8500", "Desde", "8500"],
    ["Desde  $ 8.500", "Desde", "8500"],
  ])("%s", (texto, prefijo, valor) => {
    expect(leerPrecioEscrito(texto)).toEqual({ prefijo, valor });
  });

  test("Consultar o vacío = sin precio", () => {
    for (const t of ["Consultar", "consultar", "", "  "])
      expect(leerPrecioEscrito(t)).toEqual({ prefijo: null, valor: null });
  });

  test("lo que no es un precio da error", () => {
    for (const t of ["abc", "$", "$45,555", "4500 pesos"]) expect(() => leerPrecioEscrito(t)).toThrow();
  });

  test("lo que muestra el sitio se puede volver a escribir igual", () => {
    for (const t of ["$4500", "Desde $8500", "$4500,50"]) {
      const { prefijo, valor } = leerPrecioEscrito(t);
      expect(precioTexto(valor, prefijo)).toBe(t);
    }
  });
});
