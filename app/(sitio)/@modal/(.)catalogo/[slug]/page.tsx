import { notFound } from "next/navigation";
import { ModalProducto } from "@/components/sitio/catalogo/ModalProducto";
import { getConfig, getProductoPorSlug } from "@/lib/datos";

// /catalogo/<slug> abierto desde el sitio: modal sobre la página actual.
export default async function ProductoModal({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProductoPorSlug((await params).slug);
  if (!p) notFound();
  return <ModalProducto p={p} whatsapp={getConfig().whatsapp} modo="interceptado" />;
}
