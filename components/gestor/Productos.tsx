"use client";

import { useState } from "react";
import { alternarProducto, moverProducto, restaurarProductos } from "@/lib/gestor/acciones";
import type { GProducto } from "@/lib/gestor/tipos";
import { ruta } from "@/lib/util";
import { Flechas, Mas, type Correr } from "./comun";

type Filtro = "todos" | "activos" | "ocultos";

// Bloque "Productos": markup de referencia/index.html:1246-1260 y gPintarLista()
// de referencia/index.html:2709-2763.
export function BloqueProductos({
  productos,
  correr,
  alEditar,
}: {
  productos: GProducto[];
  correr: Correr;
  alEditar: (id: string | null) => void;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  let lista = productos.map((p, i) => ({ p, i }));
  if (filtro === "activos") lista = lista.filter((x) => x.p.activo);
  if (filtro === "ocultos") lista = lista.filter((x) => !x.p.activo);
  if (busqueda) lista = lista.filter((x) => x.p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  // Las flechas de orden sólo aparecen sin filtros ni búsqueda: con la lista
  // recortada, mover un producto daría un resultado confuso.
  const sinFiltro = filtro === "todos" && !busqueda;

  return (
    <>
      <div className="g-bloque-hdr ges-9">
        <h2 className="serif">Productos</h2>
        <button className="g-bt g-bt-naranja" id="g-nuevo-2" onClick={() => alEditar(null)}>
          <Mas /> Crear producto
        </button>
      </div>
      <div className="g-barra">
        <input
          className="g-buscar"
          id="g-buscar"
          type="text"
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.trim() ? e.target.value : "")}
        />
        {(
          [
            ["todos", "Todos"],
            ["activos", "En el sitio"],
            ["ocultos", "Ocultos"],
          ] as const
        ).map(([clave, texto]) => (
          <button
            key={clave}
            className={`g-pill${filtro === clave ? " on" : ""}`}
            data-gfiltro={clave}
            onClick={() => setFiltro(clave)}
          >
            {texto}
          </button>
        ))}
        <button
          className="g-bt g-bt-gris"
          id="g-restaurar"
          title="Vuelve a los productos originales"
          onClick={() => {
            if (
              confirm("Esto descarta todos los cambios y vuelve a los productos originales.\n\n¿Continuar?")
            )
              correr(restaurarProductos());
          }}
        >
          Restaurar original
        </button>
      </div>
      <div className="g-lista" id="g-lista">
        {!lista.length ? (
          <div className="g-vacio gc-col-completa">No hay productos que coincidan.</div>
        ) : (
          lista.map(({ p, i }) => (
            <div key={p.id} className={`g-item${p.activo ? "" : " off"}`}>
              <div className="g-item-top">
                {p.photos[0] ? (
                  <img src={ruta(p.photos[0])} alt={p.nombre} />
                ) : (
                  <div className="gc-sinfoto">Sin foto</div>
                )}
                <span className={`g-tag ${p.activo ? "g-tag-on" : "g-tag-off"} gc-tag`}>
                  {p.activo ? "EN EL SITIO" : "OCULTO"}
                </span>
                {p.destacado ? (
                  <span className="g-estrella" title="Destacado en la portada">
                    ★
                  </span>
                ) : null}
                {sinFiltro ? (
                  <Flechas
                    horizontal
                    i={i}
                    total={productos.length}
                    alMover={(dir) => correr(moverProducto(p.id, dir))}
                  />
                ) : null}
              </div>
              <div className="g-item-body">
                <h3 className="serif">{p.nombre}</h3>
                <div className="gc-tipo">{p.tipo}</div>
                <div className="gc-precio">
                  {p.precio} <span className="gc-unidad">/ {p.unidad}</span>
                  {!p.verPrecio ? (
                    <span className="g-mini gc-consultar">En el sitio dice &quot;Consultar&quot;</span>
                  ) : null}
                </div>
                {p.presentaciones.length ? (
                  <div className="gc-chips">
                    {p.presentaciones.map((v) => (
                      <span key={v} className="g-mini">
                        {v}
                      </span>
                    ))}
                  </div>
                ) : null}
                {p.quesos.length ? (
                  <div className="gc-chips">
                    {p.quesos.map((q) => (
                      <span key={q} className="g-mini-q">
                        {q}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="gc-botones">
                  <button className="g-bt g-bt-gris js-g-editar ges-10" onClick={() => alEditar(p.id)}>
                    Editar
                  </button>
                  <button
                    className={`g-bt ${p.activo ? "g-bt-rojo" : "g-bt-verde"} js-g-toggle ges-10`}
                    onClick={() => correr(alternarProducto(p.id))}
                  >
                    {p.activo ? "Sacar del sitio" : "Poner en el sitio"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
