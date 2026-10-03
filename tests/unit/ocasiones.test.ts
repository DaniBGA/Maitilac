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

test("con los datos de fábrica, cada filtro tiene los mismos quesos que en el sitio viejo", () => {
  // Contadores del catálogo viejo (captura de textos de referencia, antes de que el cliente
  // les cambiara los nombres el 03/10/2026). Se comparan por clave, que no cambió.
  const delSitioViejo: Record<string, number> = {
    picadita: 3,
    parrilla: 1,
    pizza: 2,
    postre: 2,
    regalar: 2,
    sandwich: 2,
    rallar: 2,
  };
  const visibles = productos.filter((p) => p.activo !== false);
  const contadores = Object.fromEntries(
    ocasiones.map((o) => [o.key, productosDeOcasion(o, visibles).length]),
  );
  expect(contadores).toEqual(delSitioViejo);
});

test("los filtros tienen los nombres y el orden que pidió el cliente", () => {
  expect(ocasiones.map((o) => o.label)).toEqual([
    "PARRILLA",
    "PICADA",
    "PIZZA",
    "POSTRE",
    "SANDWICH",
    "RALLAR",
    "REGALOS",
  ]);
});
