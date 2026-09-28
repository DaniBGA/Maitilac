import { expect, test } from "@playwright/test";
import { MAIN_VISIBLE, RUTAS, capturarElemento, prepararPagina } from "./preparar";

const inicio = RUTAS[0];
const nosotros = RUTAS[1];

test.describe("layout", () => {
  test("header", async ({ page }) => {
    await prepararPagina(page, inicio);
    expect(await capturarElemento(page, "header")).toMatchSnapshot("header.png");
  });

  test("menú móvil abierto", async ({ page }, info) => {
    test.skip(info.project.name !== "celular", "El menú hamburguesa es sólo de celular");
    await prepararPagina(page, inicio);
    await page.locator("#burger").click();
    expect(await capturarElemento(page, "#nav")).toMatchSnapshot("menu-movil.png");
  });

  test("footer oscuro", async ({ page }) => {
    await prepararPagina(page, inicio);
    expect(await capturarElemento(page, `${MAIN_VISIBLE} > footer`)).toMatchSnapshot("footer-oscuro.png");
  });

  test("footer claro (Nosotros)", async ({ page }) => {
    await prepararPagina(page, nosotros);
    expect(await capturarElemento(page, `${MAIN_VISIBLE} > footer`)).toMatchSnapshot("footer-claro.png");
  });
});
