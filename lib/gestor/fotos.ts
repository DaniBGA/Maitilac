import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, normalize, resolve } from "node:path";
import sharp from "sharp";

/** Carpeta de las fotos subidas (en el VPS, un volumen que sirve Caddy en /fotos). */
// turbopackIgnore: es una carpeta externa (un volumen en el VPS), no forma parte del build.
const carpetaFotos = () => resolve(/*turbopackIgnore: true*/ process.env.FOTOS_DIR || "./subidas");

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAXIMO_BYTES = 15 * 1024 * 1024;

/**
 * Guarda una foto subida desde el gestor. Igual que gAchicar() del gestor viejo,
 * la achica a 1000 px como máximo y la guarda en JPEG (calidad 82). Re-codificarla
 * además descarta cualquier contenido que no sea una imagen.
 * Devuelve la ruta a guardar en la base ("fotos/<id>.jpg").
 */
export async function guardarFoto(archivo: File): Promise<string> {
  if (!TIPOS.includes(archivo.type)) throw new Error("La foto tiene que ser JPG, PNG o WebP.");
  if (archivo.size > MAXIMO_BYTES) throw new Error("La foto es demasiado pesada (máximo 15 MB).");
  const entrada = Buffer.from(await archivo.arrayBuffer());
  const salida = await sharp(entrada)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const nombre = `${randomUUID()}.jpg`;
  await mkdir(/*turbopackIgnore: true*/ carpetaFotos(), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ join(carpetaFotos(), nombre), salida);
  return `fotos/${nombre}`;
}

/** Lee una foto subida (para servirla en desarrollo). null si no existe o la ruta es inválida. */
export async function leerFoto(ruta: string): Promise<Buffer | null> {
  const limpia = normalize(ruta).replace(/^(\.\.[/\\])+/, "");
  if (limpia.includes("..") || !/^[\w-]+\.jpg$/.test(limpia)) return null;
  try {
    return await readFile(/*turbopackIgnore: true*/ join(carpetaFotos(), limpia));
  } catch {
    return null;
  }
}
