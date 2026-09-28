/**
 * Paso 2.1 — Extrae los datos de fábrica del sitio viejo (referencia/index.html)
 * ejecutando su propio JavaScript, así no se copia nada a mano (regla 1: textos tal cual).
 *
 *   pnpm datos:extraer
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CONSTANTES = [
  "CONFIG", "ANUNCIOS_BASE", "COLORES", "PRODUCTOS_BASE", "OCASIONES_BASE", "HISTORIA",
  "FOTOS_HISTORIA", "FOTOS_HOY", "LOCALES", "PASOS", "EQUIPO_BASE", "PREMIOS_BASE", "INSTA",
];

const nombreArchivo = (c: string) => c.replace(/_BASE$/, "").toLowerCase().replace(/_/g, "-");

async function main() {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  // Sin datos guardados por el gestor: sólo los de fábrica.
  await pagina.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });
  await pagina.goto("file://" + resolve("referencia/index.html"));
  const datos = (await pagina.evaluate(`({ ${CONSTANTES.join(", ")} })`)) as Record<string, unknown>;
  await navegador.close();

  mkdirSync("data", { recursive: true });
  for (const c of CONSTANTES) {
    const archivo = `data/${nombreArchivo(c)}.json`;
    writeFileSync(archivo, JSON.stringify(datos[c], null, 2) + "\n");
    const n = Array.isArray(datos[c]) ? (datos[c] as unknown[]).length : Object.keys(datos[c] as object).length;
    console.log(`${archivo.padEnd(28)} ${n}`);
  }
}

main();
