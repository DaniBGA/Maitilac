import { defineConfig } from "@playwright/test";

/**
 * Tests visuales: comparan el sitio nuevo contra la copia congelada del sitio
 * viejo (referencia/). Ver docs/PASO A PASO.md, "Cómo se vigila el diseño".
 *
 *   pnpm ref:capturar  → genera las capturas de referencia desde referencia/
 *   pnpm test:visual   → compara el sitio nuevo contra esas capturas
 *
 *   PRUEBA_URL=https://nuevo.<dominio> pnpm test:visual
 *     → contra un sitio ya publicado: sólo las páginas públicas (sin el gestor, que
 *       modifica datos) y sin tocar ninguna base. El sitio tiene que tener los datos de fábrica.
 */
const ES_REFERENCIA = process.env.REFERENCIA === "1";
const PRUEBA_URL = process.env.PRUEBA_URL;
const LOCAL = !ES_REFERENCIA && !PRUEBA_URL;
try {
  process.loadEnvFile(".env");
} catch {}

const anchos = {
  escritorio: { viewport: { width: 1440, height: 900 } },
  tablet: { viewport: { width: 1024, height: 1366 } },
  celular: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

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
    baseURL: ES_REFERENCIA ? "http://localhost:4500" : (PRUEBA_URL ?? "http://localhost:3000"),
    ignoreHTTPSErrors: !!PRUEBA_URL,
    timezoneId: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
  },
  // Base con los datos de fábrica: sólo en local (contra un sitio publicado no se toca nada).
  globalSetup: LOCAL ? "./tests/visual/preparar-bd.ts" : undefined,
  projects: [
    // Sitio nuevo: primero se inicia sesión en el gestor (una vez) para los tests que lo usan.
    ...(LOCAL ? [{ name: "sesion", testMatch: /sesion\.setup\.ts/ }] : []),
    ...Object.entries(anchos).map(([name, use]) => ({
      name,
      use: { browserName: "chromium" as const, ...use },
      testIgnore: PRUEBA_URL ? /gestor/ : /gestor-funcional/,
      dependencies: LOCAL ? ["sesion"] : [],
    })),
    // Tests que modifican datos desde el gestor: corren al final y de a uno,
    // para no cambiar nada mientras se sacan las capturas.
    ...(!LOCAL
      ? []
      : [
          {
            name: "gestor-funcional",
            testMatch: /gestor-funcional\.spec\.ts/,
            use: { browserName: "chromium" as const, ...anchos.escritorio },
            dependencies: ["escritorio", "tablet", "celular"],
            fullyParallel: false,
          },
        ]),
  ],
  // Se lanzan con "exec" y sin pnpm en el medio: si no, al terminar Playwright cierra
  // pnpm pero el servidor queda vivo y la corrida no termina nunca.
  webServer: PRUEBA_URL
    ? undefined
    : ES_REFERENCIA
      ? {
          command: "exec ./node_modules/.bin/serve referencia -l 4500 --no-clipboard",
          url: "http://localhost:4500",
          reuseExistingServer: true,
          gracefulShutdown: { signal: "SIGTERM", timeout: 1000 },
        }
      : {
          command: "exec ./node_modules/.bin/next dev",
          // Playwright levanta el servidor antes del globalSetup (que reimporta la base) y
          // consulta esta URL para saber si está listo. Tiene que ser una ruta que no lea
          // datos cacheados: con "/" la caché se llenaba con la base de antes de reimportar.
          url: "http://localhost:3000/api/auth/ok",
          reuseExistingServer: true,
          timeout: 120_000,
          gracefulShutdown: { signal: "SIGTERM", timeout: 1000 },
        },
});
