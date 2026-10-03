import { execSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Antes de correr los tests contra el sitio nuevo: base con los datos de fábrica
 * (así las capturas son deterministas) y el usuario de prueba del gestor.
 * Ojo: borra lo que se haya editado en el gestor de la base local. Y como la
 * reimportación no pasa por el gestor, no invalida la caché: si `pnpm dev` ya estaba
 * abierto con datos editados, hay que reiniciarlo antes de correr los tests.
 */
export default function prepararBase() {
  if (process.env.REFERENCIA === "1") return;
  const opciones = { stdio: "pipe" as const, env: process.env };
  execSync("pnpm db:importar --forzar", opciones);
  execSync(`pnpm gestor:usuario "${process.env.GESTOR_PRUEBA_EMAIL}" "Usuario de prueba"`, {
    ...opciones,
    env: { ...process.env, CLAVE: process.env.GESTOR_PRUEBA_CLAVE },
  });
  // Las fotos subidas en corridas anteriores (los tests del gestor suben algunas)
  // quedan sin uso al reimportar: se borran para que no se acumulen.
  const carpeta = process.env.FOTOS_DIR || "./subidas";
  try {
    for (const archivo of readdirSync(carpeta))
      if (/^[0-9a-f-]{36}\.jpg$/.test(archivo)) rmSync(join(carpeta, archivo));
  } catch {}
}
