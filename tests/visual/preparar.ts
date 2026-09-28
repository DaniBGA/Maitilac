import type { Page } from "@playwright/test";

/** Páginas del sitio: ruta en el sitio viejo (hash) y en el nuevo (URL real). */
export const RUTAS = [
  { nombre: "inicio", vieja: "/#home", nueva: "/" },
  { nombre: "nosotros", vieja: "/#nosotros", nueva: "/nosotros" },
  { nombre: "catalogo", vieja: "/#catalogo", nueva: "/catalogo" },
  { nombre: "locales", vieja: "/#locales", nueva: "/locales" },
  { nombre: "contacto", vieja: "/#contacto", nueva: "/contacto" },
] as const;

export type Ruta = (typeof RUTAS)[number];

export const ES_REFERENCIA = process.env.REFERENCIA === "1";

// Jueves 01/10/2026: a las 11:00 los dos locales están abiertos.
const INICIO = new Date("2026-10-01T10:59:00-03:00");
const CONGELADO = new Date("2026-10-01T11:00:00-03:00");

/**
 * Deja la página en un estado idéntico en los dos sitios:
 * reloj fijo, datos de fábrica, fuentes e imágenes cargadas y carruseles
 * automáticos detenidos en su posición inicial.
 */
export async function prepararPagina(page: Page, ruta: Ruta) {
  await page.clock.install({ time: INICIO });
  // El sitio viejo guarda lo editado en el gestor: se parte siempre de fábrica.
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  await page.goto(ES_REFERENCIA ? ruta.vieja : ruta.nueva);
  await esperarContenido(page);
  await page.clock.pauseAt(CONGELADO);
  await detenerCarruseles(page);
}

/** Carga todas las imágenes (también las "lazy") y espera las fuentes. */
export async function esperarContenido(page: Page) {
  await page.evaluate(async () => {
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
      img.loading = "eager";
    });
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((listo) => {
              img.addEventListener("load", () => listo(), { once: true });
              img.addEventListener("error", () => listo(), { once: true });
            }),
        ),
    );
  });
}

/**
 * Detiene los carruseles automáticos en scrollLeft = 0 (el reloj ya está
 * pausado, así que no se vuelven a mover). Como su contenido está duplicado,
 * 0 se ve igual que la posición inicial de la fila de abajo (la mitad), y es la
 * única posición que el navegador no reacomoda al agrandar la ventana para la
 * captura de página completa. El sitio nuevo tiene que conservar estas clases e id.
 */
export async function detenerCarruseles(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>(".tl-carrusel, #premios-carrusel").forEach((c) => {
      c.scrollLeft = 0;
    });
  });
}

/** El <main> visible (en el sitio viejo, los demás están ocultos con .hidden). */
export const MAIN_VISIBLE = "main.page:not(.hidden)";

/**
 * Captura de un elemento con coordenadas redondeadas. La captura por locator de
 * Playwright redondea distinto según la posición con decimales del elemento en
 * la página (en el sitio viejo el footer arranca en y = 4395,19; en el nuevo,
 * mientras la página esté vacía, en y = 85) y da 1 px de diferencia de alto.
 */
export async function capturarElemento(page: Page, selector: string) {
  const r = await page.locator(selector).first().evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height };
  });
  return page.screenshot({
    fullPage: true,
    animations: "disabled",
    caret: "hide",
    clip: {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    },
  });
}
