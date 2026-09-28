import { describe, expect, test } from "vitest";
import productos from "@/db/importar/data/productos.json";
import { indiceCircular, ruta, slug } from "@/lib/util";

describe("slug", () => {
  test.each([
    ["Gouda", "gouda"],
    ["Combo 3 Quesos", "combo-3-quesos"],
    ["Barra Tybo", "barra-tybo"],
    ["Maipú", "maipu"],
    ["  Flor de Picada! ", "flor-de-picada"],
    ["Ñandú & Cía.", "nandu-cia"],
  ])("%s → %s", (nombre, esperado) => expect(slug(nombre)).toBe(esperado));

  test("los productos de fábrica tienen slugs distintos", () => {
    const slugs = productos.map((p) => slug(p.nombre));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

test("indiceCircular da la vuelta en los dos sentidos", () => {
  expect(indiceCircular(-1, 5)).toBe(4);
  expect(indiceCircular(5, 5)).toBe(0);
  expect(indiceCircular(7, 5)).toBe(2);
  expect(indiceCircular(3, 0)).toBe(0);
});

test("ruta: las rutas relativas del sitio viejo van desde la raíz", () => {
  expect(ruta("img/gouda-1.jpg")).toBe("/img/gouda-1.jpg");
  expect(ruta("/fondo-hero.jpg")).toBe("/fondo-hero.jpg");
  expect(ruta("https://ejemplo.com/a.jpg")).toBe("https://ejemplo.com/a.jpg");
  expect(ruta("")).toBe("");
});
