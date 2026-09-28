import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getProductosVisibles } from "@/lib/datos";
import { absoluta } from "@/lib/sitio";
import { slug } from "@/lib/util";

// Las 5 páginas y el detalle de cada producto visible. Se arma en cada pedido
// (con los datos en caché): así el build no necesita la base.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const productos = await getProductosVisibles();
  return [
    ...["/", "/nosotros", "/catalogo", "/locales", "/contacto"].map((ruta) => ({ url: absoluta(ruta) })),
    ...productos.map((p) => ({ url: absoluta(`/catalogo/${slug(p.nombre)}`) })),
  ];
}
