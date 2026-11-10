import type { Hito } from "@/lib/tipos";

// Columna de años: pintarHistoria() de referencia/index.html:1959-1970.
// Sólo informativa (09/11/2026): al pasar el mouse se ve el resumen del año (globo, sólo CSS).
// No se toca ni queda un año marcado: en el sitio viejo los años parecían botones y no hacían
// nada, y el detalle por año que se probó después mostraba textos que no estaban en el relato.
export function LineaTiempo({ hitos }: { hitos: Hito[] }) {
  return (
    <div className="tl-nav" id="tl-nav">
      {hitos.map((x) => (
        <div key={x.anio} className="tl-item">
          <span className="tl-dot"></span>
          <span className="tl-anio">{x.anio}</span>
          <span className="tl-globo">
            <strong>{x.anio}</strong> {x.resumen}
          </span>
        </div>
      ))}
    </div>
  );
}
