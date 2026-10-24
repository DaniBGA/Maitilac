/**
 * Genera las versiones optimizadas de todas las fotos del sitio (lib/calentar.ts).
 * scripts/deploy.sh lo corre en el servidor, en segundo plano, después de cada publicación:
 *   docker compose exec -d app node herramientas/calentar.mjs
 * En local, con el sitio levantado: pnpm imagenes:calentar [http://localhost:3000]
 */
import { calentarImagenes } from "../lib/calentar";

const base = (process.argv[2] ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`).replace(/\/$/, "");
const inicio = Date.now();
const r = await calentarImagenes(base);
console.log(
  `Imágenes listas: ${r.fotos} fotos de ${r.paginas} páginas, ${r.generadas} versiones generadas` +
    `${r.errores ? `, ${r.errores} errores` : ""} (${Math.round((Date.now() - inicio) / 1000)} s).`,
);
