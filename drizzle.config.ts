import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env");
} catch {}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migraciones",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
