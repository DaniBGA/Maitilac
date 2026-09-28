import { leerFoto } from "@/lib/gestor/fotos";

// Sirve las fotos subidas desde el gestor. En el VPS, Caddy las sirve antes de
// llegar acá (infra/Caddyfile); esta ruta queda para desarrollo.
export async function GET(_: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const foto = await leerFoto((await params).ruta.join("/"));
  if (!foto) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(foto), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
