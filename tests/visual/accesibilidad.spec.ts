import { expect, test, type Page } from "@playwright/test";
import { ES_REFERENCIA } from "./preparar";

// Teclado y movimiento reducido (Paso 6.3). Propio del sitio nuevo: no se compara contra referencia/.
test.describe("accesibilidad", () => {
  test.skip(ES_REFERENCIA, "Sólo para el sitio nuevo");

  const hidratada = (page: Page) => expect(page.locator("html[data-hidratado='si']")).toHaveCount(1);
  const dentroDelModal = (page: Page) =>
    page.evaluate(() => !!document.activeElement?.closest("#modal [role='dialog']"));

  test("modal: el foco entra, Tab no sale y al cerrar vuelve a Ver Detalles", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio", "No depende del ancho");
    await page.goto("/catalogo");
    await hidratada(page);
    const boton = page.locator("#catalogo-grid .btn-detalles").first();
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#modal [role='dialog']")).toBeVisible();
    await expect.poll(() => dentroDelModal(page)).toBe(true);
    for (let k = 0; k < 15; k++) {
      await page.keyboard.press("Tab");
      expect(await dentroDelModal(page)).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    expect(await dentroDelModal(page)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.locator("#modal")).toBeHidden();
    await expect(boton).toBeFocused();
  });

  test("modal: con las flechas del teclado cambia de foto sin perder el foco", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio", "No depende del ancho");
    await page.goto("/catalogo/gouda");
    await hidratada(page);
    const siguiente = page.locator("#modal .md-der");
    await siguiente.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#modal .md-img")).toHaveAttribute("src", /gouda-2/);
    await expect(page.locator("#modal .md-der")).toBeFocused();
  });

  test("menú del celular: Esc lo cierra y el foco vuelve al botón", async ({ page }, info) => {
    test.skip(info.project.name !== "celular", "Sólo existe en pantallas chicas");
    await page.goto("/");
    await hidratada(page);
    const burger = page.locator("#burger");
    await burger.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#nav")).toHaveClass(/open/);
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#nav")).not.toHaveClass(/open/);
    await expect(burger).toBeFocused();
  });

  test("filtros: aria-pressed indica el activo", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio", "No depende del ancho");
    await page.goto("/catalogo");
    await hidratada(page);
    const filtro = page.locator("#filtros .js-filtro").first();
    await expect(filtro).toHaveAttribute("aria-pressed", "false");
    await filtro.click();
    await expect(filtro).toHaveAttribute("aria-pressed", "true");
  });

  test("con movimiento reducido, los carruseles de Nosotros quedan quietos", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio", "No depende del ancho");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/nosotros");
    await hidratada(page);
    const posiciones = () =>
      page.evaluate(() =>
        ["#tl-carrusel", "#tl-carrusel-2", "#premios-carrusel"].map((s) => document.querySelector(s)!.scrollLeft),
      );
    const antes = await posiciones();
    await page.waitForTimeout(1000);
    expect(await posiciones()).toEqual(antes);
  });
});
