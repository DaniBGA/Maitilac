import type { Metadata } from "next";
import { OG_BASE } from "@/lib/sitio";
import Link from "next/link";
import { AbiertoAhora } from "@/components/sitio/AbiertoAhora";
import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { DatosLocales } from "@/components/sitio/DatosEstructurados";
import { getConfig, getLocales } from "@/lib/datos";
import { buscarLocalComoSitioViejo } from "@/lib/horarios";
import type { Local } from "@/lib/tipos";
import { slug } from "@/lib/util";
import { connection } from "next/server";
import { Pagina } from "@/components/sitio/Pagina";
import { Foto } from "@/components/sitio/Foto";

// Título y descripción: el título y la bajada de la página, tal cual.
export const metadata: Metadata = {
  title: "Nuestros Locales",
  description: "Vení a visitarnos y descubrí el sabor de Tandil en cada rincón.",
  alternates: { canonical: "/locales" },
  openGraph: {
    ...OG_BASE,
    url: "/locales",
    title: "Nuestros Locales — Maitilac",
    description: "Vení a visitarnos y descubrí el sabor de Tandil en cada rincón.",
  },
};

/**
 * Cartel "Abierto ahora". Reproduce la búsqueda por clave del sitio viejo
 * ("maipu", "avellaneda"): como "maipu" no coincide con "Local Maipú" (tilde),
 * el de Maipú queda vacío igual que antes. Backlog de la Etapa 7, ítem 11:
 * para corregirlo alcanza con pasar `local` directo a <AbiertoAhora>.
 */
function AbiertoLocal({ local, locales }: { local: Local; locales: Local[] }) {
  const clave = slug(local.nombre).replace(/^local-/, "");
  const encontrado = buscarLocalComoSitioViejo(locales, clave);
  if (!encontrado) return <span className="js-abierto loc-11" data-local={clave}></span>;
  return <AbiertoAhora local={encontrado} className="loc-11" />;
}

function FotoLocal({ l }: { l: Local }) {
  return (
    <a className="loc-18" href={l.mapaUrl} target="_blank" rel="noopener" title="Ver en el mapa">
      <Foto
        className="loc-19"
        src={l.fotoDetalle}
        sizes="(max-width:720px) 90vw, (max-width:1024px) 94vw, 540px"
        alt={l.fotoDetalleAlt}
        loading="lazy"
        style={{ objectPosition: l.encuadreDetalle }}
      />
    </a>
  );
}

function Datos({ l, locales }: { l: Local; locales: Local[] }) {
  return (
    <div>
      <div className="loc-7">
        <div>
          <h2 className="serif loc-8">{l.nombre}</h2>
          <div className="loc-9">
            <svg
              className="loc-10"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C67A31"
              strokeWidth="2"
            >
              <path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z"></path>
              <circle cx="12" cy="10" r="2.4"></circle>
            </svg>{" "}
            {l.direccion}
          </div>
        </div>
        <AbiertoLocal local={l} locales={locales} />
      </div>
      <div className="grid-2 loc-12">
        <div>
          <div className="loc-13">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 8v4l2.5 2.5"></path>
            </svg>{" "}
            HORARIOS DE ATENCIÓN
          </div>
          <div className="loc-14">Lunes a Sábado</div>
          <div className="loc-15">{l.semana}</div>
          {l.domingo ? (
            <>
              <div className="loc-21">Domingos</div>
              <div className="loc-15">{l.domingo}</div>
            </>
          ) : null}
        </div>
        <div>
          <div className="loc-13">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>{" "}
            CÓMO LLEGAR
          </div>
          <p className="loc-16">{l.comoLlegar}</p>
        </div>
      </div>
      <Link className="loc-17" href="/contacto" data-go="contacto">
        Consultas y pedidos{" "}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M9 6l6 6-6 6"></path>
        </svg>
      </Link>
    </div>
  );
}

// Página Locales: markup de referencia/index.html:849-953 (estilos en
// styles/en-linea/locales.css), armado con los datos de cada local. Como en el
// sitio viejo, la foto va a la derecha en el primero y a la izquierda en el segundo.
async function LocalesContenido() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [locales, config] = await Promise.all([getLocales(), getConfig()]);
  return (
    <main id="page-locales" className="page">
      <section className="sec-pad loc-1">
        <h1 className="serif loc-2">Nuestros Locales</h1>
        <p className="loc-3">Vení a visitarnos y descubrí el sabor de Tandil en cada rincón.</p>
      </section>
      <section className="sec-pad loc-4">
        <div className="loc-5">
          {locales.map((l, i) => (
            <div key={l.nombre} className="split loc-6">
              {i % 2 === 0 ? (
                <>
                  <Datos l={l} locales={locales} />
                  <FotoLocal l={l} />
                </>
              ) : (
                <>
                  <FotoLocal l={l} />
                  <Datos l={l} locales={locales} />
                </>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="sec-pad loc-22">
        <div className="loc-23">
          <h2 className="serif loc-24">Indicaciones Generales</h2>
          <div className="loc-25">
            <h3 className="serif loc-26">Estacionamiento</h3>
            <p className="loc-27">
              Ambos locales cuentan con espacio para estacionar en la puerta o en las inmediaciones. En
              Avellaneda es zona de estacionamiento libre.
            </p>
          </div>
        </div>
      </section>
      <DatosLocales locales={locales} telefono={config.telefono} />
      <FooterOscuro />
    </main>
  );
}

export default function Locales() {
  return (
    <Pagina>
      <LocalesContenido />
    </Pagina>
  );
}
