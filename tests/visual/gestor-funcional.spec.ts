import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * El gestor guarda en la base y el sitio lo muestra al instante. Estos tests
 * modifican datos: corren al final y de a uno (proyecto "gestor-funcional"),
 * y cada uno deja todo como estaba.
 */
test.describe.configure({ mode: "serial" });
test.use({ storageState: "tests/visual/.sesion/gestor.json" });

const aviso = (page: Page) => page.locator("#g-aviso");
const tarjetaGestor = (page: Page, nombre: string) =>
  page.locator(".g-item").filter({ has: page.locator("h3", { hasText: new RegExp(`^${nombre}$`) }) });

async function abrirPanel(page: Page, nombre: string) {
  await page.goto("/gestor");
  await tarjetaGestor(page, nombre).locator(".js-g-editar").click();
  await expect(page.locator("#g-velo")).toBeVisible();
}

test.describe("sin sesión", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("/gestor lleva al login y la copia de seguridad está protegida", async ({ page }) => {
    await page.goto("/gestor");
    await expect(page).toHaveURL("/gestor/ingresar");
    expect((await page.request.get("/api/gestor/copia")).status()).toBe(401);
  });

  test("con datos incorrectos no entra", async ({ page }) => {
    await page.goto("/gestor/ingresar");
    await page.fill("#gi-email", process.env.GESTOR_PRUEBA_EMAIL!);
    await page.fill("#gi-clave", "no-es-la-clave");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator(".gi-error")).toHaveText("El email o la contraseña no son correctos.");
    await expect(page).toHaveURL("/gestor/ingresar");
  });
});

test("si se pierde la sesión, las acciones no guardan nada", async ({ page, context }) => {
  await page.goto("/gestor");
  await context.clearCookies();
  await tarjetaGestor(page, "Reggianito").locator(".js-g-toggle").click();
  await expect(aviso(page)).toHaveText("Tenés que iniciar sesión para hacer cambios.");
  await page.goto("/catalogo");
  await expect(page.locator("#catalogo-grid h3", { hasText: "Reggianito" })).toHaveCount(1);
});

test("anuncios: el texto nuevo de la barra se ve en el Inicio", async ({ page }) => {
  await page.goto("/gestor");
  const original = await page.inputValue("#ga-barra-txt");
  await page.fill("#ga-barra-txt", "PRUEBA DE ANUNCIO");
  await expect(page.locator("#gv-barra")).toHaveText("PRUEBA DE ANUNCIO"); // vista previa en vivo
  await page.click("#g-guardar-anuncios");
  await expect(aviso(page)).toHaveText("Anuncios guardados. Ya se ven en el Inicio.");
  await page.goto("/");
  await expect(page.locator("#announce-bar")).toHaveText("PRUEBA DE ANUNCIO");

  await page.goto("/gestor");
  await page.fill("#ga-barra-txt", original);
  await page.click("#g-guardar-anuncios");
  await expect(aviso(page)).toHaveText("Anuncios guardados. Ya se ven en el Inicio.");
});

test("productos: sacar del sitio y volver a poner", async ({ page }) => {
  await page.goto("/gestor");
  await tarjetaGestor(page, "Reggianito").locator(".js-g-toggle").click();
  await expect(aviso(page)).toHaveText("Producto oculto del sitio");
  await page.goto("/catalogo");
  await expect(page.locator("#catalogo-grid h3", { hasText: "Reggianito" })).toHaveCount(0);

  await page.goto("/gestor");
  await tarjetaGestor(page, "Reggianito").locator(".js-g-toggle").click();
  await expect(aviso(page)).toHaveText("Producto visible en el sitio");
  await page.goto("/catalogo");
  await expect(page.locator("#catalogo-grid h3", { hasText: "Reggianito" })).toHaveCount(1);
});

test("productos: el precio editado en el panel se ve en el catálogo", async ({ page }) => {
  await abrirPanel(page, "Gouda");
  await page.fill("#gf-precio", "$4999");
  await page.click("#g-guardar");
  await expect(aviso(page)).toHaveText("Guardado. Ya se ve en el catálogo.");
  await page.goto("/catalogo");
  await expect(page.locator("#catalogo-grid .card").first().locator(".precio")).toHaveText("$4999");

  await abrirPanel(page, "Gouda");
  await page.fill("#gf-precio", "$4500");
  await page.click("#g-guardar");
  await expect(aviso(page)).toHaveText("Guardado. Ya se ve en el catálogo.");
});

test("productos: subir una foto y quitarla", async ({ page }) => {
  await abrirPanel(page, "Mozzarella");
  const antes = await page.locator(".g-foto-mini").count();
  await page.setInputFiles("#gf-archivo", "public/img/gouda-1.jpg");
  await expect(page.locator(".g-foto-mini")).toHaveCount(antes + 1);
  const src = await page.locator(".g-foto-mini img").last().getAttribute("src");
  expect(src).toMatch(/^\/fotos\/[\w-]+\.jpg$/);
  expect((await page.request.get(src!)).status()).toBe(200);
  await page.click("#g-guardar");
  await expect(aviso(page)).toHaveText("Guardado. Ya se ve en el catálogo.");

  await abrirPanel(page, "Mozzarella");
  await expect(page.locator(".g-foto-mini")).toHaveCount(antes + 1);
  await page.locator(".g-foto-mini").last().locator(".js-g-quitar-foto").click();
  await page.click("#g-guardar");
  await expect(aviso(page)).toHaveText("Guardado. Ya se ve en el catálogo.");
});

test("premios: ocultar uno lo saca del carrusel de Nosotros", async ({ page }) => {
  await page.goto("/nosotros");
  const antes = await page.locator("#premios-carrusel .pr-card").count();
  await page.goto("/gestor");
  await page.locator(".js-pr-ver").first().uncheck();
  await expect(aviso(page)).toHaveText("Premio oculto del sitio");
  await page.goto("/nosotros");
  await expect(page.locator("#premios-carrusel .pr-card")).toHaveCount(antes - 2); // el carrusel duplica las tarjetas

  await page.goto("/gestor");
  await page.locator(".js-pr-ver").first().check();
  await expect(aviso(page)).toHaveText("Premio visible en el sitio");
});

test("Exportar descarga una copia de seguridad con todos los datos", async ({ page }) => {
  await page.goto("/gestor");
  const [descarga] = await Promise.all([page.waitForEvent("download"), page.click("#g-exportar")]);
  const copia = JSON.parse(readFileSync(await descarga.path(), "utf8"));
  expect(copia.productos).toHaveLength(12);
  expect(copia.equipo).toHaveLength(9); // el export viejo no incluía el equipo
});
