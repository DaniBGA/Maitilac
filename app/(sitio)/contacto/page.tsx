import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { SeccionContacto } from "@/components/sitio/contacto/SeccionContacto";
import { getConfig } from "@/lib/datos";

// Página Contacto: markup de referencia/index.html:955-1104.
export default function Contacto() {
  const config = getConfig();
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
