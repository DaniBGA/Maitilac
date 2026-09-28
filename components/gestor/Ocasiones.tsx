"use client";

import {
  borrarOcasion,
  crearOcasion,
  marcarQuesoOcasion,
  moverOcasion,
  renombrarOcasion,
  verOcasion,
} from "@/lib/gestor/acciones";
import type { GOcasion, GProducto } from "@/lib/gestor/tipos";
import { Flechas, Mas, type Correr } from "./comun";
import { productosDeOcasion } from "@/lib/ocasiones";

// Bloque "Buscá por ocasión": markup de referencia/index.html:1203-1214 y
// gPintarOcasiones() y sus eventos de referencia/index.html:2443-2552.
export function BloqueOcasiones({
  ocasiones,
  productos,
  correr,
}: {
  ocasiones: GOcasion[];
  productos: GProducto[];
  correr: Correr;
}) {
  const nueva = () => {
    const label = (prompt('Nombre del filtro nuevo:\n\nPor ejemplo: "Para el desayuno"') || "").trim();
    if (!label) return;
    if (ocasiones.some((o) => o.label.toLowerCase() === label.toLowerCase())) {
      alert("Ya existe un filtro con ese nombre.");
      return;
    }
    correr(crearOcasion(label));
  };

  return (
    <div className="g-bloque">
      <div className="g-bloque-hdr">
        <h2 className="serif">Buscá por ocasión</h2>
        <button className="g-bt g-bt-naranja" id="g-ocasion-nueva" onClick={nueva}>
          <Mas /> Agregar filtro
        </button>
      </div>
      <div className="g-ayuda ges-7">
        Son los botones que se ven arriba del catálogo (&quot;Sale picadita&quot;, &quot;Va a la
        parrilla&quot;...) y la única forma en que el cliente busca los quesos. En cada uno marcá qué quesos
        tiene que mostrar. Destildá la casilla de la izquierda para que un filtro deje de verse en el sitio
        sin borrarlo. Un filtro sin quesos marcados se ve apagado y no se puede apretar.
      </div>
      <div id="g-ocasiones">
        {!ocasiones.length ? (
          <div className="g-ayuda gc-m0">
            No hay filtros. La fila de botones no se muestra en el catálogo.
          </div>
        ) : (
          ocasiones.map((o, i) => {
            // Cuántos de los quesos marcados se ven hoy en el sitio
            const n = productosDeOcasion(o, productos.filter((p) => p.activo)).length;
            const oculto = !o.ver;
            const aviso = oculto ? (
              <span className="g-oc-cant off">No se muestra en el sitio</span>
            ) : n ? (
              <span className="g-oc-cant">{n} en el sitio</span>
            ) : (
              <span className="g-oc-cant off">Apagado — sin quesos visibles</span>
            );
            return (
              <div key={o.id} className={`g-oc${n && !oculto ? "" : " off"}`}>
                <div className="g-oc-fila">
                  <Flechas
                    i={i}
                    total={ocasiones.length}
                    alMover={(dir) => correr(moverOcasion(o.id, dir))}
                  />
                  <input
                    type="checkbox"
                    key={`ver-${!oculto}`}
                    className="js-oc-ver"
                    defaultChecked={!oculto}
                    title="Mostrar este filtro en el sitio"
                    onChange={(e) => correr(verOcasion(o.id, e.target.checked))}
                  />
                  <input
                    key={o.label}
                    type="text"
                    className="g-oc-nom js-oc-nom"
                    defaultValue={o.label}
                    placeholder="Nombre del filtro"
                    onBlur={(e) => {
                      const nuevo = e.target.value.trim();
                      if (!nuevo) {
                        e.target.value = o.label;
                        return;
                      }
                      if (nuevo !== o.label) correr(renombrarOcasion(o.id, nuevo));
                    }}
                  />
                  {aviso}
                  <button
                    type="button"
                    className="g-cat-x js-oc-borrar"
                    onClick={() => {
                      if (
                        confirm(
                          `¿Eliminar el filtro "${o.label}"?\n\nLos quesos no se borran: sólo desaparece el botón del catálogo.`,
                        )
                      )
                        correr(borrarOcasion(o.id));
                    }}
                  >
                    Eliminar
                  </button>
                </div>
                <div className="g-oc-quesos">
                  {productos.map((p) => {
                    const on = o.match.includes(p.nombre);
                    return (
                      <label key={p.id} className={`g-oc-queso${on ? " on" : ""}`}>
                        <input
                          type="checkbox"
                          key={`queso-${on}`}
                          className="js-oc-queso"
                          defaultChecked={on}
                          onChange={(e) => correr(marcarQuesoOcasion(o.id, p.id, e.target.checked))}
                        />{" "}
                        {p.nombre}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
