import { notFound } from "next/navigation";
import { ModalProducto } from "@/components/sitio/catalogo/ModalProducto";
import { getConfig, getProductoPorSlug } from "@/lib/datos";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";

// /catalogo/<slug> abierto desde el sitio: modal sobre la página actual.
async function ProductoModalContenido({ params }: { params: Promise<{ slug: string }> }) {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [p, config] = await Promise.all([getProductoPorSlug((await params).slug), getConfig()]);
  if (!p) notFound();
  return <ModalProducto p={p} whatsapp={config.whatsapp} modo="interceptado" />;
}

export default function ProductoModal(props: { params: Promise<{ slug: string }> }) {
  return (
    <Pagina>
      <ProductoModalContenido {...props} />
    </Pagina>
  );
}
