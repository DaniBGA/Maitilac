import Link from "next/link";
import { getConfig, getLocales } from "@/lib/datos";
import { Foto } from "./Foto";

// FOOTER_HTML de referencia/index.html:1779-1807. Se repite en Inicio, Catálogo, Locales y Contacto.
export async function FooterOscuro() {
  const [CONFIG, locales] = await Promise.all([getConfig(), getLocales()]);
  return (
    <footer className="foot-dark js-footer-dark">
      <div className="foot-grid">
        <div>
          <Foto
            src="/img/logo-tandil-2.png"
            sizes="125px"
            alt="Maitilac — Quesos de Tandil"
            className="foot-logo"
          />
          <p className="foot-desc">
            Empresa familiar que, con el trabajo de cada día, hace que disfrutes de los buenos gustos
          </p>
        </div>
        <div>
          <div className="foot-tit">NAVEGACIÓN</div>
          <div className="foot-col">
            <Link href="/" data-go="home">
              Inicio
            </Link>
            <Link href="/nosotros" data-go="nosotros">
              Nosotros
            </Link>
            <Link href="/catalogo" data-go="catalogo">
              Catálogo
            </Link>
            <Link href="/locales" data-go="locales">
              Locales
            </Link>
          </div>
        </div>
        <div>
          <div className="foot-tit">CONTACTO</div>
          <div className="foot-col">
            {locales.map((l) => (
              <span key={l.nombre}>{l.direccion}</span>
            ))}
            <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
            <Link href="/contacto" data-go="contacto">
              Contacto
            </Link>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <div className="foot-bottom-fila">
          <span>© 2026 Maitilac · Quesos de Tandil. Todos los derechos reservados.</span>
          {/* El enlace "Gestor del catálogo" se sacó (paso 5.10): al gestor se entra por /admin. */}
        </div>
      </div>
    </footer>
  );
}
