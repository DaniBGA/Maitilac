import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModalProducto } from "@/components/sitio/catalogo/ModalProducto";
import { PaginaCatalogo } from "@/components/sitio/catalogo/PaginaCatalogo";
import { DatosProducto } from "@/components/sitio/DatosEstructurados";
import { getConfig, getProductoPorSlug } from "@/lib/datos";
import { OG_BASE } from "@/lib/sitio";
import { ruta } from "@/lib/util";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";

type Props = { params: Promise<{ slug: string }> };

// Título, descripción y foto del producto (los mismos textos del detalle).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductoPorSlug(slug);
  if (!p) return {};
  const descripcion = p.desc || p.tipo || undefined;
  return {
    title: p.nombre,
    description: descripcion,
    alternates: { canonical: `/catalogo/${slug}` },
    openGraph: {
      ...OG_BASE,
      title: `${p.nombre} — Maitilac`,
      description: descripcion,
      url: `/catalogo/${slug}`,
      ...(p.photos[0] ? { images: [{ url: ruta(p.photos[0]), alt: p.nombre }] } : {}),
    },
  };
}

// Entrada directa a /catalogo/<slug> (enlace compartido o recarga): el catálogo
// con el detalle abierto encima. Desde el sitio, esta URL se abre como modal
// sobre la página actual (ver app/(sitio)/@modal).
async function ProductoPaginaContenido({ params }: Props) {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [p, config] = await Promise.all([getProductoPorSlug((await params).slug), getConfig()]);
  if (!p) notFound();
  return (
    <>
      <PaginaCatalogo />
      <ModalProducto p={p} whatsapp={config.whatsapp} modo="pagina" />
      <DatosProducto p={p} />
    </>
  );
}

export default function ProductoPagina(props: Props) {
  return (
    <Pagina>
      <ProductoPaginaContenido {...props} />
    </Pagina>
  );
}
