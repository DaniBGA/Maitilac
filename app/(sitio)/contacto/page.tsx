import type { Metadata } from "next";
import { OG_BASE } from "@/lib/sitio";
import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { SeccionContacto } from "@/components/sitio/contacto/SeccionContacto";
import { getConfig, getLocales } from "@/lib/datos";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";

// Título y descripción: el título y la bajada de la página, tal cual.
export const metadata: Metadata = {
  title: "Contacto",
  description: "Estamos para escucharte. Realizá tu consulta.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    ...OG_BASE,
    url: "/contacto",
    title: "Contacto — Maitilac",
    description: "Estamos para escucharte. Realizá tu consulta.",
  },
};

// Página Contacto: markup de referencia/index.html:955-1104.
async function ContactoContenido() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [config, locales] = await Promise.all([getConfig(), getLocales()]);
  return (
    <main id="page-contacto" className="page">
      <section className="sec-pad con-1">
        <h1 className="serif con-2">Contacto</h1>
        <p className="con-3">Estamos para escucharte. Realizá tu consulta.</p>
      </section>
      <SeccionContacto
        whatsapp={config.whatsapp}
        whatsappMayorista={config.whatsappMayorista}
        locales={locales}
      />
      <FooterOscuro />
    </main>
  );
}

export default function Contacto() {
  return (
    <Pagina>
      <ContactoContenido />
    </Pagina>
  );
}
