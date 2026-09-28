import { execSync } from "node:child_process";

/**
 * Antes de correr los tests contra el sitio nuevo: base con los datos de fábrica
 * (así las capturas son deterministas) y el usuario de prueba del gestor.
 * Ojo: borra lo que se haya editado en el gestor de la base local.
 */
export default function prepararBase() {
  if (process.env.REFERENCIA === "1") return;
  const opciones = { stdio: "pipe" as const, env: process.env };
  execSync("pnpm db:importar --forzar", opciones);
  execSync(
    `pnpm gestor:usuario "${process.env.GESTOR_PRUEBA_EMAIL}" "Usuario de prueba"`,
    { ...opciones, env: { ...process.env, CLAVE: process.env.GESTOR_PRUEBA_CLAVE } },
  );
}
