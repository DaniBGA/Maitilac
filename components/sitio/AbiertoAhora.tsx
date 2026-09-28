"use client";

import { useEffect, useState } from "react";
import { estaAbierto } from "@/lib/horarios";
import type { Local } from "@/lib/tipos";

/**
 * Cartel "Abierto ahora" / "Cerrado ahora". Como en el sitio viejo, arranca vacío
 * y se completa en el navegador (así no depende de la hora del servidor), y se
 * actualiza cada minuto.
 */
export function AbiertoAhora({ local, className }: { local: Local; className: string }) {
  const [abierto, setAbierto] = useState<boolean | null>(null);

  useEffect(() => {
    const actualizar = () => setAbierto(estaAbierto(local));
    actualizar();
    const id = setInterval(actualizar, 60000);
    return () => clearInterval(id);
  }, [local]);

  if (abierto === null) return <span className={`js-abierto ${className}`} data-local={local.nombre}></span>;
  return (
    <span
      className={`js-abierto ${className}`}
      data-local={local.nombre}
      style={{ color: abierto ? "#4f7a3f" : "#9a5a4a" }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          background: abierto ? "#5aa04a" : "#c88b7d",
        }}
      ></span>
      {abierto ? "Abierto ahora" : "Cerrado ahora"}
    </span>
  );
}
