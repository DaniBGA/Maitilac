"use client";

import { useState } from "react";
import type { Hito } from "@/lib/tipos";

// Columna de años: pintarHistoria() de referencia/index.html:1959-1970.
// Al pasar el mouse se ve el resumen (globo, sólo CSS); al hacer clic, el año queda marcado.
export function LineaTiempo({ hitos }: { hitos: Hito[] }) {
  const [activo, setActivo] = useState(0);
  return (
    <div className="tl-nav" id="tl-nav">
      {hitos.map((x, i) => (
        <button
          key={x.anio}
          type="button"
          className={`tl-item js-hito${i === activo ? " on" : ""}`}
          aria-pressed={i === activo}
          data-i={i}
          onClick={(e) => {
            setActivo(i);
            // En el celular los años están en una fila que se desliza: el elegido queda centrado.
            e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
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
