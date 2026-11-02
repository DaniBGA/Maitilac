"use client";

import { useEffect, useRef, useState } from "react";
import type { Hito } from "@/lib/tipos";
import { LineaTiempo } from "./LineaTiempo";

/**
 * Historia de Nosotros: los años a la izquierda y, a la derecha, el relato, el detalle del
 * año elegido y las fotos. El detalle vuelve a estar (02/11/2026): en el sitio viejo se había
 * sacado al dejar un solo relato, y tocar un año no cambiaba nada (registro §6).
 * Los textos de cada año salen de content/historia.json (HTML del repositorio, no del gestor).
 */
export function Historia({
  hitos,
  relato,
  fotos,
}: {
  hitos: Hito[];
  relato: React.ReactNode;
  fotos: React.ReactNode;
}) {
  const [activo, setActivo] = useState(0);
  const detalle = useRef<HTMLDivElement>(null);
  const elegido = useRef(false);
  const hito = hitos[activo];

  // Que se vea el cambio: si el detalle quedó fuera de la pantalla, se lo trae. Después de
  // pintar el año nuevo (con su alto), y sólo cuando alguien tocó un año (no al cargar).
  useEffect(() => {
    if (elegido.current) detalle.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activo]);

  const elegir = (i: number) => {
    elegido.current = true;
    setActivo(i);
  };

  return (
    <div className="timeline">
      <LineaTiempo hitos={hitos} activo={activo} alElegir={elegir} />
      <div className="tl-panel">
        {relato}
        <div className="tl-detalle" ref={detalle} aria-live="polite">
          <span className="tl-detalle-anio">{hito.anio}</span>
          <h3 className="serif tl-detalle-tit">{hito.titulo}</h3>
          {hito.textos.map((t, k) => (
            <p key={k} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </div>
        {fotos}
      </div>
    </div>
  );
}
