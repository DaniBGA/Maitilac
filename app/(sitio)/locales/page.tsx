import Link from "next/link";
import { AbiertoAhora } from "@/components/sitio/AbiertoAhora";
import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { getLocales } from "@/lib/datos";
import { buscarLocalComoSitioViejo } from "@/lib/horarios";

/** Cartel "Abierto ahora" de cada local, con la búsqueda por clave del sitio viejo. */
function AbiertoLocal({ clave }: { clave: string }) {
  const local = buscarLocalComoSitioViejo(getLocales(), clave);
  if (!local) return <span className="js-abierto loc-11" data-local={clave}></span>;
  return <AbiertoAhora local={local} className="loc-11" />;
}

// Página Locales: markup de referencia/index.html:849-953, convertido con
// scripts/html_a_jsx.py (estilos en styles/en-linea/locales.css). Direcciones y
// horarios tal como están escritos en el sitio viejo; en la Etapa 3 se unifican
// con los datos de los locales.
export default function Locales() {
  return (
    <main id="page-locales" className="page">
      <section className="sec-pad loc-1">
        <h1 className="serif loc-2">Nuestros Locales</h1>
        <p className="loc-3">Vení a visitarnos y descubrí el sabor de Tandil en cada rincón.</p>
      </section>
      <section className="sec-pad loc-4">
        <div className="loc-5">
          {/* Local Maipú */}
          <div className="split loc-6">
            <div>
              <div className="loc-7">
                <div>
                  <h2 className="serif loc-8">Local Maipú</h2>
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
                    Maipú 1135, Tandil
                  </div>
                </div>
                <AbiertoLocal clave="maipu" />
              </div>
              <div className="grid-2 loc-12">
                <div>
                  <div className="loc-13">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M12 8v4l2.5 2.5"></path>
                    </svg>{" "}
                    HORARIOS DE ATENCIÓN
                  </div>
                  <div className="loc-14">Lunes a Sábado</div>
                  <div className="loc-15">8:30 a 21:00 hs</div>
                </div>
                <div>
                  <div className="loc-13">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>{" "}
                    CÓMO LLEGAR
                  </div>
                  <p className="loc-16">
                    Ubicado a pocas cuadras del centro, sobre calle Maipú entre 4 de Abril y Alsina (a media
                    cuadra de la calesita).
                  </p>
                </div>
              </div>
              <Link className="loc-17" href="/contacto" data-go="contacto">
                Consultas y pedidos{" "}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M9 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>
            <a
              className="loc-18"
              href="https://maps.google.com/?q=Maipú+1135,+Tandil"
              target="_blank"
              rel="noopener"
              title="Ver en el mapa"
            >
              <img
                className="loc-19"
                src="/img/local-maipu-2.jpg"
                alt="Frente del local de Maipú 1135"
                loading="lazy"
              />
            </a>
          </div>
          {/* Local Avellaneda */}
          <div className="split loc-6">
            <a
              className="loc-18"
              href="https://maps.google.com/?q=Avellaneda+655,+Tandil"
              target="_blank"
              rel="noopener"
              title="Ver en el mapa"
            >
              <img
                className="loc-20"
                src="/img/local-avellaneda-2.jpg"
                alt="Frente del local de Avellaneda 655"
                loading="lazy"
              />
            </a>
            <div>
              <div className="loc-7">
                <div>
                  <h2 className="serif loc-8">Local Avellaneda</h2>
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
                    Avellaneda 655, Tandil
                  </div>
                </div>
                <AbiertoLocal clave="avellaneda" />
              </div>
              <div className="grid-2 loc-12">
                <div>
                  <div className="loc-13">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M12 8v4l2.5 2.5"></path>
                    </svg>{" "}
                    HORARIOS DE ATENCIÓN
                  </div>
                  <div className="loc-14">Lunes a Sábado</div>
                  <div className="loc-15">8:30 a 21:00 hs</div>
                  <div className="loc-21">Domingos</div>
                  <div className="loc-15">9:30 a 13:30 hs</div>
                </div>
                <div>
                  <div className="loc-13">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>{" "}
                    CÓMO LLEGAR
                  </div>
                  <p className="loc-16">
                    De camino al dique y al Parque Independencia, sobre Av. Avellaneda.
                  </p>
                </div>
              </div>
              <Link className="loc-17" href="/contacto" data-go="contacto">
                Consultas y pedidos{" "}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M9 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>
          </div>
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

      <FooterOscuro />
    </main>
  );
}
