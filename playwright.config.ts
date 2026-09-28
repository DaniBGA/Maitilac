import { defineConfig } from "@playwright/test";

/**
 * Tests visuales: comparan el sitio nuevo contra la copia congelada del sitio
 * viejo (referencia/). Ver docs/PASO A PASO.md, "Cómo se vigila el diseño".
 *
 *   pnpm ref:capturar  → genera las capturas de referencia desde referencia/
 *   pnpm test:visual   → compara el sitio nuevo contra esas capturas
 */
const ES_REFERENCIA = process.env.REFERENCIA === "1";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./tests/visual/__resultados__",
  snapshotPathTemplate: "{testDir}/__referencia__/{arg}-{projectName}{ext}",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 20_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" },
    toMatchSnapshot: { maxDiffPixelRatio: 0.002 },
  },
  use: {
    baseURL: ES_REFERENCIA ? "http://localhost:4500" : "http://localhost:3000",
    timezoneId: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
  },
  projects: [
    { name: "escritorio", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { browserName: "chromium", viewport: { width: 1024, height: 1366 } } },
    {
      name: "celular",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: ES_REFERENCIA
    ? { command: "pnpm ref:servir", url: "http://localhost:4500", reuseExistingServer: true }
    : { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
