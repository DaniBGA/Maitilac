import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import ocasiones from "@/db/importar/data/ocasiones.json";
import productos from "@/db/importar/data/productos.json";
import { productosDeOcasion } from "@/lib/ocasiones";

test("cuenta sólo los productos de la lista que están marcados", () => {
  const lista = [{ nombre: "Gouda" }, { nombre: "Sardo" }, { nombre: "Cremoso" }];
  expect(productosDeOcasion({ match: ["Sardo", "Cremoso", "No existe"] }, lista)).toEqual([
    { nombre: "Sardo" },
    { nombre: "Cremoso" },
  ]);
  expect(productosDeOcasion({ match: [] }, lista)).toEqual([]);
});

test("con los datos de fábrica, los contadores son los del sitio viejo", () => {
  // Los números que muestra el catálogo viejo, de la captura de textos de referencia
  const referencia = readFileSync("tests/visual/__referencia__/catalogo-textos-escritorio.txt", "utf8");
  const visibles = productos.filter((p) => p.activo !== false);
  for (const o of ocasiones.filter((x) => x.ver !== false)) {
    const n = productosDeOcasion(o, visibles).length;
    expect(referencia).toContain(`${o.label} ${n}\n`);
  }
});
