import { expect, test } from "@playwright/test";
import { ES_REFERENCIA, MAIN_VISIBLE, RUTAS, prepararPagina } from "./preparar";

/**
 * Páginas completas. Dos capturas por página:
 *  - diseño: fotos enmascaradas, tolerancia estricta (config)
 *  - fotos: sin máscara, tolerancia de color más amplia (recompresión AVIF/WebP)
 */
for (const ruta of RUTAS) {
  test.describe(`página ${ruta.nombre}`, () => {
    test("diseño", async ({ page }) => {
      await prepararPagina(page, ruta);
      await expect(page).toHaveScreenshot(`${ruta.nombre}-diseno.png`, {
        fullPage: true,
        mask: [page.locator(`${MAIN_VISIBLE} img, ${MAIN_VISIBLE} video, header img`)],
      });
    });

    test("fotos", async ({ page }) => {
      await prepararPagina(page, ruta);
      await expect(page).toHaveScreenshot(`${ruta.nombre}-fotos.png`, {
        fullPage: true,
        // El cuadro que muestra un video depende de cuánto llegó a cargar: siempre enmascarado.
        mask: [page.locator(`${MAIN_VISIBLE} video`)],
        threshold: 0.2,
        maxDiffPixelRatio: 0.01,
      });
    });

    test("sin errores en consola", async ({ page }) => {
      test.skip(ES_REFERENCIA, "Sólo se controla el sitio nuevo");
      const errores: string[] = [];
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      page.on("pageerror", (e) => errores.push(e.message));
      await prepararPagina(page, ruta);
      expect(errores).toEqual([]);
    });

    test("textos", async ({ page }) => {
      await prepararPagina(page, ruta);
      const texto = await page.evaluate(() => document.body.innerText);
      expect(texto).toMatchSnapshot(`${ruta.nombre}-textos.txt`);
    });
  });
}
