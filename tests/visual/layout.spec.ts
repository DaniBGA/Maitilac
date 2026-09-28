import { expect, test } from "@playwright/test";
import { MAIN_VISIBLE, RUTAS, prepararPagina } from "./preparar";

const inicio = RUTAS[0];
const nosotros = RUTAS[1];

test.describe("layout", () => {
  test("header", async ({ page }) => {
    await prepararPagina(page, inicio);
    await expect(page.locator("header")).toHaveScreenshot("header.png");
  });

  test("menú móvil abierto", async ({ page }, info) => {
    test.skip(info.project.name !== "celular", "El menú hamburguesa es sólo de celular");
    await prepararPagina(page, inicio);
    await page.locator("#burger").click();
    await expect(page).toHaveScreenshot("menu-movil.png");
  });

  test("footer oscuro", async ({ page }) => {
    await prepararPagina(page, inicio);
    await expect(page.locator(`${MAIN_VISIBLE} > footer`)).toHaveScreenshot("footer-oscuro.png");
  });

  test("footer claro (Nosotros)", async ({ page }) => {
    await prepararPagina(page, nosotros);
    await expect(page.locator(`${MAIN_VISIBLE} > footer`)).toHaveScreenshot("footer-claro.png");
  });
});
