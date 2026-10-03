/**
 * Empaqueta las herramientas del servidor en archivos .mjs autocontenidos
 * (.next/herramientas/), para que la imagen de producción las corra con node solo,
 * sin tsx ni node_modules de desarrollo:
 *
 *   migrar.mjs         aplica las migraciones (la imagen lo corre al arrancar)
 *   importar.mjs       carga los datos de fábrica (pnpm db:importar)
 *   crear-usuario.mjs  crea un usuario del gestor (pnpm gestor:usuario)
 */
import { build } from "esbuild";

await build({
  entryPoints: {
    migrar: "scripts/migrar.ts",
    importar: "db/importar/index.ts",
    "crear-usuario": "scripts/crear-usuario.ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  outdir: ".next/herramientas",
  outExtension: { ".js": ".mjs" },
  // Algunas dependencias usan require(): en un módulo ESM hay que crearlo.
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  logLevel: "warning",
});
