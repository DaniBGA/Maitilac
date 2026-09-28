import { notFound } from "next/navigation";
import { ModalProducto } from "@/components/sitio/catalogo/ModalProducto";
import { PaginaCatalogo } from "@/components/sitio/catalogo/PaginaCatalogo";
import { getConfig, getProductoPorSlug, getProductosVisibles } from "@/lib/datos";
import { slug } from "@/lib/util";

export const generateStaticParams = () => getProductosVisibles().map((p) => ({ slug: slug(p.nombre) }));

// Entrada directa a /catalogo/<slug> (enlace compartido o recarga): el catálogo
// con el detalle abierto encima. Desde el sitio, esta URL se abre como modal
// sobre la página actual (ver app/(sitio)/@modal).
export default async function ProductoPagina({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProductoPorSlug((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PaginaCatalogo />
      <ModalProducto p={p} whatsapp={getConfig().whatsapp} modo="pagina" />
    </>
  );
}
