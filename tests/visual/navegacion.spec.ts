import { expect, test } from "@playwright/test";
import { ES_REFERENCIA } from "./preparar";

// Comportamiento propio del sitio nuevo (no se compara contra referencia/).
test.describe("navegación", () => {
  test.skip(ES_REFERENCIA, "Sólo para el sitio nuevo");
  test.beforeEach(({}, info) => test.skip(info.project.name !== "escritorio", "No depende del ancho"));

  for (const [viejo, nuevo] of [
    ["nosotros", "/nosotros"],
    ["catalogo", "/catalogo"],
    ["locales", "/locales"],
    ["contacto", "/contacto"],
  ]) {
    test(`/#${viejo} redirige a ${nuevo}`, async ({ page }) => {
      await page.goto(`/#${viejo}`);
      await expect(page).toHaveURL(nuevo);
    });
  }

  test("/#home queda en el Inicio sin el #", async ({ page }) => {
    await page.goto("/#home");
    await expect(page).toHaveURL("/");
  });

  test("Ver Detalles en el Inicio abre el modal y atrás lo cierra", async ({ page }) => {
    await page.goto("/");
    await page.locator("#home-products .btn-detalles").first().click();
    await expect(page.locator("#modal")).toBeVisible();
    await expect(page).toHaveURL("/catalogo/gouda");
    await page.goBack();
    await expect(page.locator("#modal")).toHaveCount(0);
    await expect(page).toHaveURL("/");
  });

  test("entrar directo a /catalogo/gouda muestra el catálogo con el modal", async ({ page }) => {
    await page.goto("/catalogo/gouda");
    await expect(page.locator("#modal")).toBeVisible();
    await expect(page.locator("#catalogo-grid")).toBeVisible();
    await page.locator("#cerrar-modal").click();
    await expect(page).toHaveURL("/catalogo");
    await expect(page.locator("#modal")).toHaveCount(0);
  });

  test("el menú del header navega entre páginas", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav .navlink", { hasText: "Nosotros" }).click();
    await expect(page).toHaveURL("/nosotros");
    await expect(page.locator("nav .navlink.on")).toHaveText("Nosotros");
  });
});
