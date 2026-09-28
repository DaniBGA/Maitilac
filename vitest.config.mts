import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests unitarios (pnpm test). Los visuales y funcionales son de Playwright (pnpm test:visual).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"] },
});
