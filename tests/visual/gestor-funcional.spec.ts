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

// ---------- Bloques nuevos ----------

const campo = (page: Page, contenedor: string, etiqueta: string) =>
  page.locator(`${contenedor} .g-campo`).filter({ has: page.locator("label", { hasText: etiqueta }) }).locator("input, textarea, select").first();

test("contacto: el email nuevo se ve en el footer", async ({ page }) => {
  await page.goto("/gestor");
  const email = campo(page, "#g-contacto", "Email");
  const original = await email.inputValue();
  await email.fill("pruebas@maitilac.com");
  await page.locator("#g-contacto button", { hasText: "Guardar contacto" }).click();
  await expect(aviso(page)).toHaveText("Datos de contacto guardados. Ya se ven en el sitio.");
  await page.goto("/");
  await expect(page.locator("footer.foot-dark")).toContainText("pruebas@maitilac.com");

  await page.goto("/gestor");
  await campo(page, "#g-contacto", "Email").fill(original);
  await page.locator("#g-contacto button", { hasText: "Guardar contacto" }).click();
  await expect(aviso(page)).toHaveText("Datos de contacto guardados. Ya se ven en el sitio.");
});

test("locales: el horario nuevo se ve en Locales y en Contacto", async ({ page }) => {
  await page.goto("/gestor");
  const local = page.locator("#g-contacto .gn-local").first();
  const horario = local.locator(".g-campo").filter({ hasText: "lunes a sábado (como se muestra)" }).locator("input");
  const original = await horario.inputValue();
  await horario.fill("9:00 a 20:00 hs");
  await local.locator("button", { hasText: "Guardar local" }).click();
  await expect(aviso(page)).toHaveText("Local guardado. Ya se ve en el sitio.");
  await page.goto("/locales");
  await expect(page.locator("#page-locales")).toContainText("9:00 a 20:00 hs");
  await page.goto("/contacto");
  await expect(page.locator(".canal-loc").first()).toContainText("Lun a Sáb · 9:00 a 20:00 hs");

  await page.goto("/gestor");
  const local2 = page.locator("#g-contacto .gn-local").first();
  await local2.locator(".g-campo").filter({ hasText: "lunes a sábado (como se muestra)" }).locator("input").fill(original);
  await local2.locator("button", { hasText: "Guardar local" }).click();
  await expect(aviso(page)).toHaveText("Local guardado. Ya se ve en el sitio.");
});

test("producto del mes: se puede cambiar desde el gestor", async ({ page }) => {
  await page.goto("/gestor");
  const selector = campo(page, "#g-contacto", "Producto");
  const original = await selector.inputValue();
  await selector.selectOption({ label: "Gouda" });
  await page.locator("#g-contacto button", { hasText: "Guardar producto del mes" }).click();
  await expect(aviso(page)).toHaveText("Producto del mes guardado. Ya se ve en el catálogo.");
  await page.goto("/catalogo");
  await expect(page.locator(".cat-9")).toHaveText("Gouda");

  await page.goto("/gestor");
  await campo(page, "#g-contacto", "Producto").selectOption(original);
  await page.locator("#g-contacto button", { hasText: "Guardar producto del mes" }).click();
  await expect(aviso(page)).toHaveText("Producto del mes guardado. Ya se ve en el catálogo.");
});

test("banco de fotos: subir una foto suelta, asignarla y volver a soltarla", async ({ page }) => {
  await page.goto("/gestor");
  const sueltasAntes = await page.locator("#g-banco .gn-banco.suelta").count();
  await page.setInputFiles("#gb-archivo", "public/img/sardo-1.jpg");
  await expect(aviso(page)).toHaveText("Foto agregada al banco");
  await expect(page.locator("#g-banco .gn-banco.suelta")).toHaveCount(sueltasAntes + 1);

  const nueva = page.locator("#g-banco .gn-banco.suelta").last();
  const archivo = await nueva.locator(".gn-archivo").textContent();
  await nueva.locator("select").selectOption({ label: "Reggianito" });
  await expect(aviso(page)).toHaveText("Foto asignada");
  const tarjeta = page.locator("#g-banco .gn-banco").filter({ hasText: archivo! });
  await expect(tarjeta.locator(".gn-uso")).toHaveText("En Reggianito");

  await tarjeta.locator("select").selectOption("");
  await expect(aviso(page)).toHaveText("La foto quedó sin asignar");
  await expect(page.locator("#g-banco .gn-banco.suelta")).toHaveCount(sueltasAntes + 1);
});

test("panel de producto: Tab no sale del panel y Esc devuelve el foco a Editar", async ({ page }) => {
  await page.goto("/gestor");
  const editar = tarjetaGestor(page, "Gouda").locator(".js-g-editar");
  await editar.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#g-velo [role='dialog']")).toBeVisible();
  const dentro = () => page.evaluate(() => !!document.activeElement?.closest("#g-velo [role='dialog']"));
  for (let k = 0; k < 60; k++) {
    await page.keyboard.press("Tab");
    expect(await dentro()).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator("#g-velo")).toBeHidden();
  await expect(editar).toBeFocused();
});

test("filtros: desmarcar un queso cambia el contador del catálogo", async ({ page }) => {
  const sardo = () =>
    page
      .locator(".g-oc")
      .filter({ has: page.locator('.js-oc-nom[value="A rallar se ha dicho"]') })
      .locator(".g-oc-queso", { hasText: /^\s*Sardo\s*$/ });
  const filtro = page.locator("#filtros .js-filtro", { hasText: "A rallar se ha dicho" });

  await page.goto("/gestor");
  await expect(sardo()).toHaveClass(/\bon\b/);
  await sardo().locator("input").click();
  await expect(sardo()).not.toHaveClass(/\bon\b/);
  await page.goto("/catalogo");
  await expect(filtro).toHaveText("A rallar se ha dicho 1");

  await page.goto("/gestor");
  await sardo().locator("input").click();
  await expect(sardo()).toHaveClass(/\bon\b/);
  await page.goto("/catalogo");
  await expect(filtro).toHaveText("A rallar se ha dicho 2");
});

test("equipo: el cargo editado se ve en Nosotros", async ({ page }) => {
  const cargo = () => page.locator("#g-equipo .g-persona").first().locator('input[placeholder="Cargo"]');
  await page.goto("/gestor");
  const original = await cargo().inputValue();
  await cargo().fill("Cargo de prueba");
  await cargo().blur();
  await expect(aviso(page)).toHaveText("Actualizado");
  await page.goto("/nosotros");
  await expect(page.locator("#equipo")).toContainText("Cargo de prueba");

  await page.goto("/gestor");
  await cargo().fill(original);
  await cargo().blur();
  await expect(aviso(page)).toHaveText("Actualizado");
  await page.goto("/nosotros");
  await expect(page.locator("#equipo")).not.toContainText("Cargo de prueba");
});

test("productos: la flecha cambia el orden en el catálogo", async ({ page }) => {
  const nombres = () => page.locator("#catalogo-grid h3").allTextContents();
  await page.goto("/catalogo");
  const original = await nombres();
  expect(original.slice(0, 2)).toEqual(["Gouda", "Holanda"]);

  await page.goto("/gestor");
  await tarjetaGestor(page, "Holanda").getByRole("button", { name: "Mover antes" }).click();
  await expect(aviso(page)).toHaveText("Orden actualizado");
  await page.goto("/catalogo");
  expect(await nombres()).toEqual(["Holanda", "Gouda", ...original.slice(2)]);

  await page.goto("/gestor");
  await tarjetaGestor(page, "Holanda").getByRole("button", { name: "Mover después" }).click();
  await expect(aviso(page)).toHaveText("Orden actualizado");
  await page.goto("/catalogo");
  expect(await nombres()).toEqual(original);
});
