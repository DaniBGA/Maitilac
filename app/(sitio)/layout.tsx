import { connection } from "next/server";
import { Suspense } from "react";
import { Header } from "@/components/sitio/Header";
import { MarcaHidratado } from "@/components/sitio/MarcaHidratado";
import { RedireccionHash } from "@/components/sitio/RedireccionHash";
import { getConfig } from "@/lib/datos";

/**
 * Las páginas se arman en cada pedido (connection) con los datos en caché
 * (lib/datos.ts): así la base no hace falta al compilar la imagen Docker, y lo
 * que se guarda en el gestor se ve al instante. El Suspense es obligatorio con
 * cacheComponents; su fallback vacío no llega a verse porque los datos salen de
 * la caché del servidor y el HTML se envía completo.
 */
export default function LayoutSitio({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Contenido modal={modal}>{children}</Contenido>
    </Suspense>
  );
}

async function Contenido({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  await connection();
  const config = await getConfig();
  return (
    <>
      <Header instagram={config.instagram} />
      {children}
      {modal}
      <RedireccionHash />
      <MarcaHidratado />
    </>
  );
}
