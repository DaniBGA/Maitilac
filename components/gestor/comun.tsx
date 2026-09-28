"use client";

import type { Resultado } from "@/lib/gestor/tipos";

/** Ejecuta una acción del servidor, actualiza los datos y muestra el aviso. Devuelve si salió bien. */
export type Correr = (accion: Promise<Resultado>) => Promise<boolean>;

/** Flechas para cambiar el orden: gFlechas() de referencia/index.html:2395-2406. */
export function Flechas({
  i,
  total,
  alMover,
  horizontal = false,
}: {
  i: number;
  total: number;
  alMover: (dir: number) => void;
  horizontal?: boolean;
}) {
  return (
    <div className={horizontal ? "g-orden g-orden-prod" : "g-orden"}>
      <button
        type="button"
        className="js-subir"
        disabled={i === 0}
        title={horizontal ? "Mover antes" : "Subir"}
        aria-label={horizontal ? "Mover antes" : "Subir"}
        onClick={() => alMover(-1)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d={horizontal ? "M15 6l-6 6 6 6" : "M6 15l6-6 6 6"}></path>
        </svg>
      </button>
      <button
        type="button"
        className="js-bajar"
        disabled={i === total - 1}
        title={horizontal ? "Mover después" : "Bajar"}
        aria-label={horizontal ? "Mover después" : "Bajar"}
        onClick={() => alMover(1)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d={horizontal ? "M9 6l6 6-6 6" : "M6 9l6 6 6-6"}></path>
        </svg>
      </button>
    </div>
  );
}

/** Ícono "+" de los botones Agregar. */
export const Mas = ({ tam = 15 }: { tam?: number }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M12 5v14M5 12h14"></path>
  </svg>
);

/** Arma el FormData con la foto elegida en un <input type="file">. */
export function formularioFoto(archivo: File) {
  const f = new FormData();
  f.append("foto", archivo);
  return f;
}
