import { expect, test, type Page } from "@playwright/test";
import { ES_REFERENCIA, esperarImagenes, prepararPagina } from "./preparar";

// El gestor viejo se abría en /#gestor, sin contraseña. El nuevo, en /gestor con sesión.
const gestor = { vieja: "/#gestor", nueva: "/gestor" };
test.use({ storageState: ES_REFERENCIA ? undefined : "tests/visual/.sesion/gestor.json" });

/**
 * Lo que el gestor viejo no tenía se quita antes de comparar: el botón "Salir" y los
 * bloques nuevos (data-nuevo: Contacto y locales, Banco de fotos). Anotados en
 * "Diferencias visuales aprobadas" de docs/PASO A PASO.md.
 */
async function sinBotonSalir(page: Page) {
  if (!ES_REFERENCIA)
    await page.evaluate(() => {
      document.getElementById("g-salir")?.remove();
      document.querySelectorAll("[data-nuevo]").forEach((n) => n.remove());
    });
}

test.describe("gestor", () => {
  test("diseño", async ({ page }) => {
    await prepararPagina(page, gestor);
    await sinBotonSalir(page);
    await expect(page).toHaveScreenshot("gestor-diseno.png", {
      fullPage: true,
      mask: [page.locator("#page-gestor img, header img")],
    });
  });

  test("fotos", async ({ page }) => {
    await prepararPagina(page, gestor);
    await sinBotonSalir(page);
    await expect(page).toHaveScreenshot("gestor-fotos.png", {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("textos", async ({ page }) => {
    await prepararPagina(page, gestor);
    await sinBotonSalir(page);
    expect(await page.evaluate(() => document.body.innerText)).toMatchSnapshot("gestor-textos.txt");
  });

  test("panel de edición abierto", async ({ page }) => {
    await prepararPagina(page, gestor);
    await page.locator(".js-g-editar").first().click();
    await page.locator("#g-velo").waitFor({ state: "visible" });
    await page.mouse.move(0, 0);
    await esperarImagenes(page);
    await expect(page).toHaveScreenshot("gestor-panel.png", { threshold: 0.2, maxDiffPixelRatio: 0.01 });
  });
});
