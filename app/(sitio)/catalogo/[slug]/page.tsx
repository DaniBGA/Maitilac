import { notFound } from "next/navigation";
import { ModalProducto } from "@/components/sitio/catalogo/ModalProducto";
import { PaginaCatalogo } from "@/components/sitio/catalogo/PaginaCatalogo";
import { getConfig, getProductoPorSlug } from "@/lib/datos";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";

// Entrada directa a /catalogo/<slug> (enlace compartido o recarga): el catálogo
// con el detalle abierto encima. Desde el sitio, esta URL se abre como modal
// sobre la página actual (ver app/(sitio)/@modal).
async function ProductoPaginaContenido({ params }: { params: Promise<{ slug: string }> }) {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [p, config] = await Promise.all([getProductoPorSlug((await params).slug), getConfig()]);
  if (!p) notFound();
  return (
    <>
      <PaginaCatalogo />
      <ModalProducto p={p} whatsapp={config.whatsapp} modo="pagina" />
    </>
  );
}

export default function ProductoPagina(props: { params: Promise<{ slug: string }> }) {
  return (
    <Pagina>
      <ProductoPaginaContenido {...props} />
    </Pagina>
  );
}
