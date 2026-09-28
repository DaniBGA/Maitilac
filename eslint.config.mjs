import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Durante la paridad visual se usa <img> común, no next/image (docs/PASO A PASO.md, contrato de diseño, regla 5).
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sitio viejo congelado y material del cliente: no se lintean.
    "referencia/**",
    "_fuentes/**",
  ]),
]);

export default eslintConfig;
