/**
 * Crea un usuario del gestor, o le cambia la contraseña si ya existe.
 * El registro público está desactivado: es la única forma de dar acceso.
 *
 *   pnpm gestor:usuario <email> "<Nombre>"
 *
 * Pide la contraseña (mínimo 10 caracteres). Para usarlo sin preguntar
 * (por ejemplo en los tests), pasarla en la variable CLAVE.
 */
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { account, user } from "../db/esquema-auth";

/** Pregunta sin mostrar lo que se escribe (como sudo). */
async function preguntarOculto(pregunta: string): Promise<string> {
  process.stdout.write(pregunta);
  // readline repite en pantalla cada tecla: se le da una salida que no muestra nada.
  const muda = new Writable({ write: (_parte, _codificacion, listo) => listo() });
  const rl = createInterface({ input: process.stdin, output: muda, terminal: true });
  const valor = await rl.question("");
  rl.close();
  process.stdout.write("\n");
  return valor;
}

async function pedirClave(): Promise<string> {
  if (process.env.CLAVE) return process.env.CLAVE;
  const a = await preguntarOculto("Contraseña (mínimo 10 caracteres): ");
  const b = await preguntarOculto("Repetir contraseña: ");
  if (a !== b) throw new Error("Las contraseñas no coinciden.");
  return a;
}

async function main() {
  const [email, nombre] = process.argv.slice(2);
  if (!email || !email.includes("@")) {
    console.error('Uso: pnpm gestor:usuario <email> "<Nombre>"');
    process.exit(1);
  }
  const clave = await pedirClave();
  if (clave.length < 10) throw new Error("La contraseña tiene que tener al menos 10 caracteres.");

  const conexion = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(conexion);
  const hash = await hashPassword(clave);
  const correo = email.trim().toLowerCase();

  const [existente] = await db.select().from(user).where(eq(user.email, correo));
  if (existente) {
    await db
      .update(account)
      .set({ password: hash })
      .where(and(eq(account.userId, existente.id), eq(account.providerId, "credential")));
    console.log(`Contraseña actualizada para ${correo}.`);
  } else {
    const id = randomUUID();
    await db.insert(user).values({ id, name: nombre || correo, email: correo, emailVerified: true });
    await db.insert(account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash });
    console.log(`Usuario creado: ${correo}. Ya puede entrar en /gestor.`);
  }
  await conexion.end();
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
