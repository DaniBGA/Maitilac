import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Una sola conexión por proceso (en desarrollo, el recargado en caliente
// volvería a crear el cliente en cada cambio).
const global = globalThis as unknown as { conexionMaitilac?: ReturnType<typeof postgres> };
const conexion = global.conexionMaitilac ?? postgres(process.env.DATABASE_URL!, { max: 10 });
if (process.env.NODE_ENV !== "production") global.conexionMaitilac = conexion;

export const db = drizzle(conexion, { schema });
