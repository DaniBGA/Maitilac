import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { SeccionContacto } from "@/components/sitio/contacto/SeccionContacto";
import { getConfig } from "@/lib/datos";
import { connection } from "next/server";

// Página Contacto: markup de referencia/index.html:955-1104.
export default async function Contacto() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const config = await getConfig();
  return (
    <main id="page-contacto" className="page">
      <section className="sec-pad con-1">
        <h1 className="serif con-2">Contacto</h1>
        <p className="con-3">Estamos para escucharte. Realizá tu consulta.</p>
      </section>
      <SeccionContacto whatsapp={config.whatsapp} whatsappMayorista={config.whatsappMayorista} />
      <FooterOscuro />
    </main>
  );
}
