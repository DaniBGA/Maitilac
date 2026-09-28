"use client";

import { useEffect, useRef } from "react";
import { ruta } from "@/lib/util";

/** Una fila de fotos: ruta de imagen, o texto → recuadro de "foto pendiente". Se duplica para que el desplazamiento no tenga corte. */
function Fila({ lista, alt }: { lista: string[]; alt: string }) {
  const items = [...lista, ...lista];
  return items.map((f, k) =>
    /^img\//.test(f) ? (
      <img key={k} src={ruta(f)} alt={alt} loading="lazy" className="tl-foto tl-foto-img" />
    ) : (
      <div key={k} className="ph tl-foto" data-ph={`foto — ${f}`}></div>
    ),
  );
}

/**
 * Las dos filas de fotos de la historia: pintarFotosHistoria() y moverCarrusel()
 * de referencia/index.html:1976-2033. La de arriba avanza y la de abajo retrocede,
 * 0,5 px por cuadro. Cada una se frena al pasar el mouse o tocarla.
 */
export function CarruselHistoria({
  fotosHistoria,
  fotosHoy,
}: {
  fotosHistoria: string[];
  fotosHoy: string[];
}) {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c1 = ref1.current!;
    const c2 = ref2.current!;
    c1.scrollLeft = 0;
    // Arranca en la mitad: desde ahí puede correr hacia atrás sin quedarse sin fotos
    c2.scrollLeft = c2.scrollWidth / 2;

    const pausa = { c1: false, c2: false };
    let id = 0;
    const mover = () => {
      if (!pausa.c1) {
        c1.scrollLeft += 0.5;
        const mitad = c1.scrollWidth / 2;
        if (c1.scrollLeft >= mitad) c1.scrollLeft -= mitad;
      }
      if (!pausa.c2) {
        c2.scrollLeft -= 0.5; // sentido contrario
        const mitad = c2.scrollWidth / 2;
        if (c2.scrollLeft <= 0) c2.scrollLeft += mitad;
      }
      id = requestAnimationFrame(mover);
    };
    mover();

    const limpiar: (() => void)[] = [];
    for (const [el, clave] of [
      [c1, "c1"],
      [c2, "c2"],
    ] as const) {
      const on = (tipo: string, fn: () => void, opciones?: AddEventListenerOptions) => {
        el.addEventListener(tipo, fn, opciones);
        limpiar.push(() => el.removeEventListener(tipo, fn));
      };
      on("mouseenter", () => (pausa[clave] = true));
      on("mouseleave", () => (pausa[clave] = false));
      on("touchstart", () => (pausa[clave] = true), { passive: true });
      on("touchend", () => setTimeout(() => (pausa[clave] = false), 2500), { passive: true });
    }
    return () => {
      cancelAnimationFrame(id);
      limpiar.forEach((f) => f());
    };
  }, []);

  return (
    <>
      <div className="tl-carrusel" id="tl-carrusel" ref={ref1}>
        <Fila lista={fotosHistoria} alt="Historia de Maitilac" />
      </div>
      <div className="tl-carrusel tl-carrusel-2" id="tl-carrusel-2" ref={ref2}>
        <Fila lista={fotosHoy} alt="Maitilac hoy: el campo y el trabajo diario" />
      </div>
    </>
  );
}
