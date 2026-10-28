import { expect, test, type Page } from "@playwright/test";
import { ES_REFERENCIA, RUTAS, capturarElemento, esperarImagenes, prepararPagina } from "./preparar";

const [, nosotros] = RUTAS;

test.describe("estados — Nosotros", () => {
  test("globo de un año del medio", async ({ page }, info) => {
    test.skip(info.project.name === "celular", "En celular el globo no aplica (no hay mouse)");
    await prepararPagina(page, nosotros);
    await page.locator(".tl-item").nth(4).hover();
    expect(await capturarElemento(page, ".timeline")).toMatchSnapshot("nosotros-globo-medio.png");
  });

  test("globo del último año (abre hacia arriba)", async ({ page }, info) => {
    test.skip(info.project.name === "celular", "En celular el globo no aplica (no hay mouse)");
    await prepararPagina(page, nosotros);
    await page.locator(".tl-item").last().hover();
    expect(await capturarElemento(page, ".timeline")).toMatchSnapshot("nosotros-globo-ultimo.png");
  });

  test("año seleccionado", async ({ page }) => {
    await prepararPagina(page, nosotros);
    await page.locator(".tl-item").nth(2).click();
    await page.mouse.move(0, 0);
    expect(await capturarElemento(page, ".tl-nav")).toMatchSnapshot("nosotros-anio-seleccionado.png");
  });

  test("hover en un paso de la cadena", async ({ page }, info) => {
    test.skip(info.project.name === "celular", "Sin mouse en celular");
    await prepararPagina(page, nosotros);
    await page.locator(".cd-paso").nth(2).hover();
    expect(await capturarElemento(page, ".cadena-wrap")).toMatchSnapshot("nosotros-cadena-hover.png");
  });
});

const catalogo = RUTAS[2];

/**
 * El modal se abre navegando (ruta interceptada) y su contenido va dentro de un
 * Suspense, que React revela con un temporizador corto: con el reloj pausado no
 * aparecería nunca. En el catálogo no hay nada animado que cambie la captura.
 * En el sitio viejo el modal no dependía de temporizadores, así que da igual.
 */
async function reanudarReloj(page: Page) {
  await page.clock.resume();
}

test.describe("estados — Catálogo", () => {
  test("filtro por ocasión activo", async ({ page }) => {
    await prepararPagina(page, catalogo);
    await page.locator("#filtros .js-filtro").first().click();
    await page.mouse.move(0, 0);
    expect(await capturarElemento(page, "#filtros")).toMatchSnapshot("catalogo-filtro-activo-filtros.png");
    expect(await capturarElemento(page, "#grid")).toMatchSnapshot("catalogo-filtro-activo-grilla.png", {
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("foto 2 en una tarjeta", async ({ page }) => {
    await prepararPagina(page, catalogo);
    const tarjeta = page.locator("#catalogo-grid .card").first();
    await tarjeta.locator(".js-foto").last().click();
    await page.mouse.move(0, 0);
    await esperarImagenes(page);
    expect(await capturarElemento(page, "#catalogo-grid .card")).toMatchSnapshot(
      "catalogo-tarjeta-foto2.png",
      {
        threshold: 0.2,
        maxDiffPixelRatio: 0.01,
      },
    );
  });

  for (const foto of [1, 2]) {
    test(`modal de producto abierto (foto ${foto})`, async ({ page }) => {
      await prepararPagina(page, catalogo);
      await reanudarReloj(page);
      await page.locator("#catalogo-grid .btn-detalles").first().click();
      const modal = page.locator("#modal");
      await modal.waitFor({ state: "visible" });
      if (foto === 2) await modal.locator(".js-mfoto").last().click();
      await page.mouse.move(0, 0);
      await esperarImagenes(page);
      await expect(page).toHaveScreenshot(`catalogo-modal-foto${foto}.png`, {
        threshold: 0.2,
        maxDiffPixelRatio: 0.01,
      });
    });
  }

  test("el modal se cierra con Esc y devuelve el scroll", async ({ page }) => {
    await prepararPagina(page, catalogo);
    await reanudarReloj(page);
    await page.locator("#catalogo-grid .btn-detalles").first().click();
    await page.locator("#modal").waitFor({ state: "visible" });
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await page.keyboard.press("Escape");
    await page.locator("#modal").waitFor({ state: "hidden" });
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});

const contacto = RUTAS[4];

test.describe("estados — Contacto", () => {
  test("pestaña Compra por mayor", async ({ page }) => {
    await prepararPagina(page, contacto);
    await page.locator("#tab-mayorista").click();
    await page.mouse.move(0, 0);
    expect(await capturarElemento(page, ".contacto-col-form")).toMatchSnapshot(
      "contacto-pestana-mayorista.png",
    );
  });

  test("Pedir presupuesto mayorista abre WhatsApp mayorista", async ({ page }) => {
    test.skip(ES_REFERENCIA, "En el sitio viejo cambiaba de pestaña (cambio del 28/10/2026)");
    await prepararPagina(page, contacto);
    const boton = page.locator("#ir-mayorista");
    await expect(boton).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=Hola!%20Quer%C3%ADa%20pedir%20un%20presupuesto%20mayorista$/);
    await expect(boton).toHaveAttribute("target", "_blank");
  });

  for (const pestana of ["consulta", "mayorista"]) {
    test(`mensaje de WhatsApp (${pestana})`, async ({ page }, info) => {
      test.skip(info.project.name !== "escritorio", "El mensaje no depende del ancho");
      await page.addInitScript(() => {
        (window as unknown as { abierto: string[] }).abierto = [];
        window.open = (url?: string | URL) => {
          (window as unknown as { abierto: string[] }).abierto.push(String(url));
          return null;
        };
      });
      await prepararPagina(page, contacto);
      await page.locator(`#tab-${pestana}`).click();
      await page.fill('input[name="nombre"]', "Ana Pérez");
      await page.fill('input[name="email"]', "ana@ejemplo.com");
      await page.fill('input[name="telefono"]', "249 4123456");
      await page.fill('textarea[name="mensaje"]', "¿Tienen queso azul? Quiero 2 kg & una horma.");
      await page.locator('#form-contacto button[type="submit"]').click();
      const abiertos = await page.evaluate(() => (window as unknown as { abierto: string[] }).abierto);
      expect(abiertos.join("\n")).toMatchSnapshot(`contacto-whatsapp-${pestana}.txt`);
    });
  }
});
