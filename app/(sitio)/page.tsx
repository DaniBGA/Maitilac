import Link from "next/link";
import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { LocalResumen } from "@/components/sitio/inicio/LocalResumen";
import { TarjetaDestacado } from "@/components/sitio/inicio/TarjetaDestacado";
import { getAnuncios, getColor, getConfig, getInsta, getLocales, getProductosDestacados } from "@/lib/datos";
import { ruta } from "@/lib/util";
import { connection } from "next/server";

// Página de Inicio: markup de referencia/index.html:497-628, convertido con
// scripts/html_a_jsx.py (estilos en styles/en-linea/inicio.css). Las partes que
// llenaba el JavaScript viejo usan los componentes de components/sitio/inicio/.
export default async function Inicio() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [config, a, destacados, locales] = await Promise.all([
    getConfig(),
    getAnuncios(),
    getProductosDestacados(),
    getLocales(),
  ]);
  const cBarra = getColor(a.barra.color);
  const c1 = getColor(a.badge1.color);
  const c2 = getColor(a.badge2.color);
  // pintarAnuncios(): un cartel se esconde si está apagado o sin texto.
  const verBarra = a.barra.ver && a.barra.texto.trim() !== "";
  const verB1 = a.badge1.ver && a.badge1.texto.trim() !== "";
  const verB2 = a.badge2.ver && a.badge2.texto.trim() !== "";
  const insta = getInsta();

  return (
    <main id="page-home" className="page">
      {/* Barra de anuncio */}
      <div
        className={`ini-1${verBarra ? "" : " hidden"}`}
        id="announce-bar"
        style={{ background: cBarra.fondo, color: cBarra.texto }}
      >
        <svg
          className="ini-2"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        <span className="js-announce">{a.barra.texto}</span>
      </div>
      {/* Hero */}
      <section className="hero ini-3">
        {/* Foto de fondo de la portada. El archivo está junto a este index.html.
               Para cambiarla: reemplazá "fondo-hero.jpg" por otra foto con el mismo nombre. */}
        <img
          className="hero-img ini-4"
          src="/fondo-hero.jpg"
          alt="Quesos artesanales Maitilac sobre tabla de madera"
        />
        <div className="hero-veil ini-5"></div>
        <div className="hero-inner ini-6">
          <div className="ini-7">
            <div className={`ini-8${verB1 || verB2 ? "" : " hidden"}`} id="promo-badges">
              <span
                className={`ini-9${verB1 ? "" : " hidden"}`}
                id="badge-naranja"
                style={{ background: c1.fondo, color: c1.texto }}
              >
                <svg
                  className="ini-10"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 11l14-7v16L3 13v-2z"></path>
                  <path d="M11 6.5V17"></path>
                </svg>{" "}
                <span className="js-badge1">{a.badge1.texto}</span>
              </span>
              <span
                className={`js-badge2 ini-11${verB2 ? "" : " hidden"}`}
                id="badge-verde"
                style={{ background: c2.fondo, color: c2.texto }}
              >
                {a.badge2.texto}
              </span>
            </div>
            <h1 className="serif ini-12">
              Empresa familiar que
              <br /> <em className="ini-13">cuida cada detalle</em>
            </h1>
            <p className="ini-14">Desde el campo, hasta llegar a vos. Quesos de TANDIL.</p>
            <div className="ini-15">
              <Link className="ini-16" href="/catalogo" data-go="catalogo">
                Ver Catálogo{" "}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                >
                  <path d="M9 6l6 6-6 6"></path>
                </svg>
              </Link>
              <Link className="ini-17" href="/nosotros" data-go="nosotros">
                Nuestra Historia
              </Link>
              <Link className="ini-18" href="/locales" data-go="locales">
                Ver locales
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Cifras */}
      <section className="ini-19">
        <div className="grid-3 sec-pad ini-20">
          <div className="ini-21">
            <div className="ini-22">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="9" cy="8" r="3.4"></circle>
                <path d="M2.5 19c0-3.2 2.9-5.2 6.5-5.2S15.5 15.8 15.5 19"></path>
                <path d="M16 5.2a3.2 3.2 0 010 6"></path>
                <path d="M17 13.9c2.7.5 4.5 2.3 4.5 5.1"></path>
              </svg>
            </div>
            <div className="serif ini-23">+40 Años</div>
            <p className="ini-24">De tradición familiar en el sector lácteo.</p>
          </div>
          <div className="ini-21">
            <div className="ini-22">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="12" cy="9" r="5.2"></circle>
                <path d="M8.5 13.5L7 21l5-2.6L17 21l-1.5-7.5"></path>
              </svg>
            </div>
            <div className="serif ini-23">8 Variedades</div>
            <p className="ini-24">De quesos artesanales elaborados con leche propia.</p>
          </div>
          <div className="ini-21">
            <div className="ini-22">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 17h18v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"></path>
                <path d="M3 17l9-8.5 9 8.5"></path>
                <circle cx="9.5" cy="14.5" r="1"></circle>
                <circle cx="14" cy="12.5" r="1"></circle>
              </svg>
            </div>
            <div className="serif ini-25">Quesos de Tandil</div>
            <p className="ini-24">Identidad y sabor de nuestra tierra.</p>
          </div>
        </div>
      </section>
      {/* Productos destacados */}
      <section className={`ini-26${destacados.length ? "" : " hidden"}`}>
        <div className="sec-pad ini-27">
          <div className="ini-28">
            <div className="ini-29">
              <h2 className="serif ini-30">Productos Destacados</h2>
              <p className="ini-31">
                Una selección de nuestros quesos más pedidos, elaborados con pasión y dedicación.
              </p>
            </div>
            <Link className="ini-32" href="/catalogo" data-go="catalogo">
              Ver catálogo completo{" "}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M9 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <div className="grid-centrada" id="home-products">
            {destacados.map((p) => (
              <TarjetaDestacado key={p.nombre} p={p} />
            ))}
          </div>
        </div>
      </section>
      {/* Historia */}
      <section className="ini-33">
        <div className="split sec-pad ini-34">
          <div className="ini-35">
            <img
              className="ini-36"
              src="/img/tradicion-que-se-hereda.jpg"
              alt="La familia Maitia en el stand de Maitilac"
              loading="lazy"
            />
            <div className="ini-37">
              <span className="serif ini-38">&quot;Tradición que se hereda&quot;</span>
            </div>
          </div>
          <div>
            <h2 className="serif ini-30">Nuestra Historia</h2>
            <p className="ini-39">
              Todo comenzó en 1940, cuando Miguel Maitia puso en marcha un pequeño tambo en Napaleofú, con
              ordeñe a mano y mucho trabajo familiar.
            </p>
            <p className="ini-40">
              Somos tres generaciones de una misma familia trabajando con la misma pasión: producir alimentos
              de calidad y compartir el sabor de nuestras raíces.
            </p>
            <Link className="ini-41" href="/nosotros" data-go="nosotros">
              Conocé más sobre nosotros{" "}
              <svg
                width="17"
                height="17"
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
      </section>
      {/* Locales (resumen) */}
      <section className="ini-26">
        <div className="sec-pad ini-42">
          <div className="ini-43">
            <h2 className="serif ini-30">Nuestros Locales</h2>
            <Link className="ini-32" href="/contacto" data-go="contacto">
              Contactanos{" "}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M9 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <div className="grid-2" id="home-locales">
            {locales.map((l) => (
              <LocalResumen key={l.nombre} l={l} />
            ))}
          </div>
        </div>
      </section>
      {/* Instagram */}
      <section className="ini-19">
        <div className="sec-pad ini-44">
          <div className="ini-45">
            <h2 className="serif ini-46">Seguinos en Instagram</h2>
            <a className="ini-47" href={config.instagram} target="_blank" rel="noopener">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>
              </svg>{" "}
              @maitilac
            </a>
          </div>
          <div className="grid-6" id="home-insta">
            {insta.map((i) =>
              i.foto ? (
                <img key={i.foto} src={ruta(i.foto)} alt={i.alt || ""} loading="lazy" className="ig-img" />
              ) : (
                <div key={i.alt} className="ph ig-ph" data-ph={i.alt || ""}></div>
              ),
            )}
          </div>
        </div>
      </section>

      <FooterOscuro />
    </main>
  );
}
