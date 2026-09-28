"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Producto } from "@/lib/tipos";
import { indiceCircular, precioVisible } from "@/lib/util";
import { IcoDer, IcoIzq } from "../Icono";
import { Foto } from "../Foto";

/**
 * Modal de detalle de producto: #modal y pintarModal() de referencia/index.html:844
 * y 2173-2245. Galería con flechas y teclas ← →, Esc o clic en el fondo para cerrar,
 * y el scroll de la página bloqueado mientras está abierto.
 *
 * modo "interceptado": abierto desde el sitio → cerrar = volver atrás.
 * modo "pagina": se entró directo a /catalogo/<slug> → cerrar = ir al catálogo.
 */
export function ModalProducto({
  p,
  whatsapp,
  modo,
}: {
  p: Producto;
  whatsapp: string;
  modo: "interceptado" | "pagina";
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const total = p.photos.length;
  const i = indiceCircular(idx, total);

  const cerrar = useCallback(() => {
    if (modo === "interceptado") router.back();
    else router.push("/catalogo", { scroll: false });
  }, [modo, router]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") setIdx((n) => n - 1);
      if (e.key === "ArrowRight") setIdx((n) => n + 1);
    };
    document.addEventListener("keydown", teclas);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", teclas);
    };
  }, [cerrar]);

  const consulta = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola! Quería consultar por el queso " + p.nombre)}`;

  return (
    <div id="modal" className="md-velo" onClick={(e) => e.target === e.currentTarget && cerrar()}>
      {/* key={i}: como en el sitio viejo (que volvía a dibujar el modal entero), al
          cambiar de foto la caja se recrea: vuelve arriba y repite la animación de entrada. */}
      <div className="modal-grid md-caja" key={i}>
        <button type="button" id="cerrar-modal" aria-label="Cerrar" className="md-cerrar" onClick={cerrar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>
        </button>
        <div className="md-foto">
          <Foto src={p.photos[i] ?? ""} sizes="(max-width:720px) 84vw, 480px" alt={p.nombre} className="md-img" />
          {total > 1 ? (
            <>
              <button
                type="button"
                className="navimg js-mfoto md-izq"
                aria-label="Anterior"
                onClick={() => setIdx(idx - 1)}
              >
                <IcoIzq />
              </button>
              <button
                type="button"
                className="navimg js-mfoto md-der"
                aria-label="Siguiente"
                onClick={() => setIdx(idx + 1)}
              >
                <IcoDer />
              </button>
              <div className="md-puntos">
                {p.photos.map((_, k) => (
                  <span
                    key={k}
                    className="md-punto"
                    style={{ background: k === i ? "#C67A31" : "rgba(255,255,255,.7)" }}
                  ></span>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div className="modal-pad md-pad">
          <div className="md-badges">{p.badge ? <span className="md-badge">{p.badge}</span> : null}</div>
          <h2 className="serif md-nombre">{p.nombre}</h2>
          {p.tipo ? <div className="md-tipo">{p.tipo}</div> : null}
          {p.desc ? <p className="md-desc">{p.desc}</p> : null}
          <div className="md-precio-fila">
            <span className="md-precio">{precioVisible(p) ? p.precio : "Consultar"}</span>
            {precioVisible(p) ? <span className="md-unidad">/ {p.unidad}</span> : null}
          </div>
          <div className="md-info">
            <div className="md-rotulo">MARIDAJE COMIDA</div>
            <div className="md-chips">
              {p.comida.map((m) => (
                <span key={m} className="chip">
                  {m}
                </span>
              ))}
            </div>
            <div className="md-rotulo">MARIDAJE BEBIDA</div>
            <div className="md-chips">
              {p.bebida.map((b) => (
                <span key={b} className="chip">
                  {b}
                </span>
              ))}
            </div>
            {p.presentaciones && p.presentaciones.length ? (
              <>
                <div className="md-rotulo">PRESENTACIÓN</div>
                <div className="md-chips">
                  {p.presentaciones.map((v) => (
                    <span key={v} className="chip-pres">
                      {v}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
            {p.quesos && p.quesos.length ? (
              <>
                <div className="md-rotulo">QUESOS INCLUIDOS</div>
                <div className="md-chips">
                  {p.quesos.map((q) => (
                    <span key={q} className="chip-queso">
                      {q}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
            {p.premios ? (
              <>
                <div className="md-rotulo-premios">PREMIOS CATA QUESOS Y SABORES DE TANDIL</div>
                <div className="md-premios">{p.premios}</div>
              </>
            ) : null}
          </div>
          <a className="btn-pill btn-wsp md-wsp" href={consulta} target="_blank" rel="noopener">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"></path>
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
