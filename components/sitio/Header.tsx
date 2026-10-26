"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Foto } from "./Foto";

// Markup de referencia/index.html:478-495. Mismas clases e id (el CSS y los tests dependen de ellos).
const SECCIONES = [
  { href: "/", texto: "Inicio" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/catalogo", texto: "Catálogo" },
  { href: "/locales", texto: "Locales" },
];

export function Header({ instagram }: { instagram: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const burger = useRef<HTMLButtonElement>(null);

  // Con el menú del celular abierto, Esc lo cierra y el foco vuelve al botón.
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      burger.current?.focus();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  return (
    <header>
      <div className="hdr">
        <Link href="/" className="hdr-logo" onClick={cerrar}>
          <Foto src="/img/logo maitilac.png" sizes="70px" alt="Maitilac — Quesos de Tandil" />
        </Link>
        <button
          className="burger"
          id="burger"
          ref={burger}
          aria-label="Menú"
          aria-expanded={abierto}
          aria-controls="nav"
          onClick={() => setAbierto((a) => !a)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18"></path>
          </svg>
        </button>
        <nav id="nav" className={abierto ? "open" : undefined}>
          {SECCIONES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={ruta === s.href ? "navlink on" : "navlink"}
              onClick={cerrar}
            >
              {s.texto}
            </Link>
          ))}
          <Link href="/contacto" className="btn-contacto" onClick={cerrar}>
            Contactanos
          </Link>
          <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram" className="ig-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5"></rect>
              <circle cx="12" cy="12" r="4"></circle>
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
