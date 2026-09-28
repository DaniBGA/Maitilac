"use client";

import { useEffect, useRef } from "react";
import type { Premio } from "@/lib/tipos";
import { ruta } from "@/lib/util";
import { IcoCopa } from "../Icono";

function Tarjeta({ a }: { a: Premio }) {
  return (
    <div className="pr-card">
      {a.foto ? (
        <img src={ruta(a.foto)} alt={`Diploma ${a.titulo} ${a.anio}`} loading="lazy" className="pr-img" />
      ) : (
        <div className="ph pr-ph" data-ph={`foto — ${a.titulo}`}></div>
      )}
      <div className="pr-cuerpo">
        <div className="pr-cab">
          <span className="pr-copa">
            <IcoCopa />
          </span>
          <span className="serif pr-anio">{a.anio}</span>
        </div>
        <h3 className="serif pr-titulo">{a.titulo}</h3>
        {a.evento ? <div className="pr-evento">{a.evento}</div> : null}
        {a.detalle ? <p className="pr-detalle">{a.detalle}</p> : null}
      </div>
    </div>
  );
}

/**
 * Carrusel de premios: pintarPremios() y girar() de referencia/index.html:2072-2112.
 * Las tarjetas se duplican para que el desplazamiento sea continuo (0,6 px por cuadro).
 * Se frena al pasar el mouse; al tocarlo en el celular queda frenado (igual que antes).
 */
export function CarruselPremios({ premios, className }: { premios: Premio[]; className: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = ref.current!;
    let pausado = false;
    let id = 0;
    const girar = () => {
      if (!pausado) {
        c.scrollLeft += 0.6;
        const mitad = c.scrollWidth / 2;
        if (c.scrollLeft >= mitad) c.scrollLeft -= mitad;
      }
      id = requestAnimationFrame(girar);
    };
    girar();
    const entrar = () => (pausado = true);
    const salir = () => (pausado = false);
    c.addEventListener("mouseenter", entrar);
    c.addEventListener("mouseleave", salir);
    c.addEventListener("touchstart", entrar, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      c.removeEventListener("mouseenter", entrar);
      c.removeEventListener("mouseleave", salir);
      c.removeEventListener("touchstart", entrar);
    };
  }, []);

  return (
    <div id="premios-carrusel" className={className} ref={ref}>
      {[...premios, ...premios].map((a, k) => (
        <Tarjeta key={k} a={a} />
      ))}
    </div>
  );
}
