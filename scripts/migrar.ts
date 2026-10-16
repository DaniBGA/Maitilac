/**
 * Aplica las migraciones pendientes (db/migraciones). Es lo que corre la imagen de
 * producción al arrancar, antes de levantar el sitio: no necesita drizzle-kit.
 * En desarrollo se usa `pnpm db:migrar` (drizzle-kit), que lleva el mismo registro.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const conexion = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
try {
  await migrate(drizzle(conexion), { migrationsFolder: "db/migraciones" });
  console.log("Migraciones al día.");
} finally {
  await conexion.end();
}
