"use client";

import { useRef } from "react";
import type { Hito } from "@/lib/tipos";

// Columna de años: pintarHistoria() de referencia/index.html:1959-1970.
// Al pasar el mouse se ve el resumen (globo, sólo CSS); al hacer clic, el año queda marcado
// y Historia muestra su detalle.
export function LineaTiempo({
  hitos,
  activo,
  alElegir,
}: {
  hitos: Hito[];
  activo: number;
  alElegir: (i: number) => void;
}) {
  const nav = useRef<HTMLDivElement>(null);
  return (
    <div className="tl-nav" id="tl-nav" ref={nav}>
      {hitos.map((x, i) => (
        <button
          key={x.anio}
          type="button"
          className={`tl-item js-hito${i === activo ? " on" : ""}`}
          aria-pressed={i === activo}
          data-i={i}
          onClick={(e) => {
            alElegir(i);
            // En el celular los años están en una fila que se desliza: el elegido queda centrado.
            // Se mueve sólo la fila (no scrollIntoView), así no frena el desplazamiento de la
            // página hacia el detalle del año.
            const fila = nav.current!;
            const b = e.currentTarget.getBoundingClientRect();
            const f = fila.getBoundingClientRect();
            fila.scrollTo({
              left: fila.scrollLeft + b.left - f.left - (f.width - b.width) / 2,
              behavior: "smooth",
            });
          }}
        >
          <span className="tl-dot"></span>
          <span className="tl-anio">{x.anio}</span>
          <span className="tl-globo">
            <strong>{x.anio}</strong> {x.resumen}
          </span>
        </button>
      ))}
    </div>
  );
}
