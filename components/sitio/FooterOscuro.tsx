import Link from "next/link";
import { getConfig } from "@/lib/datos";

const CONFIG = getConfig();

// FOOTER_HTML de referencia/index.html:1779-1807. Se repite en Inicio, Catálogo, Locales y Contacto.
export function FooterOscuro() {
  return (
    <footer className="foot-dark js-footer-dark">
      <div className="foot-grid">
        <div>
          <img src="/img/logo-tandil-2.png" alt="Maitilac — Quesos de Tandil" className="foot-logo" />
          <p className="foot-desc">Quesos artesanales elaborados con leche propia desde nuestros tambos.</p>
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
            <span>Maipú 1135, Tandil</span>
            <span>Avellaneda 655, Tandil</span>
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
          {/* Se quita en el paso 5.10 (ver "Diferencias visuales aprobadas"). */}
          <Link href="/gestor" data-go="gestor" className="foot-gestor">
            Gestor del catálogo
          </Link>
        </div>
      </div>
    </footer>
  );
}
