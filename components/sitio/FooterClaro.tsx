import Link from "next/link";
import { getConfig, getLocales } from "@/lib/datos";
import { Foto } from "./Foto";

/** "2494538291" → "249 4538291", como se muestra en el sitio viejo. */
const telefonoVisible = (t: string) => `${t.slice(0, 3)} ${t.slice(3)}`;

// Footer propio de la página Nosotros, referencia/index.html:759-800. Texto tal cual.
const Pin = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C67A31"
    strokeWidth="2"
    className="fc-ico"
  >
    <path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z"></path>
    <circle cx="12" cy="10" r="2.4"></circle>
  </svg>
);

export async function FooterClaro() {
  const [CONFIG, locales] = await Promise.all([getConfig(), getLocales()]);
  return (
    <footer className="fc">
      <div className="foot-grid fc-grid">
        <div>
          <Foto src="/img/logo-tandil-2.png" sizes="125px" alt="Maitilac — Quesos de Tandil" className="foot-logo" />
          <p className="fc-desc">
            Empresa familiar que con el trabajado de cada día, hace que disfrutes de los buenos gustos.
          </p>
          <div className="fc-redes">
            <a href={CONFIG.instagram} target="_blank" rel="noopener" className="fc-red" aria-label="Instagram">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>
              </svg>
            </a>
            <a href={CONFIG.facebook} target="_blank" rel="noopener" className="fc-red" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V11H8v3h2v7h3v-7h2.2l.8-3H13V9.3c0-.2.2-.3.5-.3z"></path>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="fc-tit">Secciones</div>
          <div className="fc-secciones">
            <Link href="/" data-go="home" className="fc-link">
              Inicio
            </Link>
            <Link href="/nosotros" data-go="nosotros" className="fc-link">
              Nosotros
            </Link>
            <Link href="/catalogo" data-go="catalogo" className="fc-link">
              Catálogo
            </Link>
            <Link href="/locales" data-go="locales" className="fc-link">
              Locales
            </Link>
            <Link href="/contacto" data-go="contacto" className="fc-link">
              Contacto
            </Link>
          </div>
        </div>
        <div>
          <div className="fc-tit">Locales</div>
          <div className="fc-col">
            {locales.map((l) => (
              <span key={l.nombre} className="fc-item">
                <Pin />
                {l.direccion}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="fc-tit">Contacto</div>
          <div className="fc-col">
            <a href={`tel:${CONFIG.telefono}`} className="fc-item-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C67A31"
                strokeWidth="2"
                className="fc-ico"
              >
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"></path>
              </svg>
              {telefonoVisible(CONFIG.telefono)}
            </a>
            <a href={`mailto:${CONFIG.email}`} className="fc-item-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C67A31"
                strokeWidth="2"
                className="fc-ico"
              >
                <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                <path d="M3 7l9 6 9-6"></path>
              </svg>
              {CONFIG.email}
            </a>
          </div>
        </div>
      </div>
      <div className="fc-bottom">
        <div className="fc-bottom-fila">
          <span>© 2026 Maitilac. Todos los derechos reservados.</span>
          <span>
            Desarrollado por{" "}
            <a className="fc-credito" href="https://www.grupovexus.com" target="_blank" rel="noopener">
              Grupo Vexus
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
