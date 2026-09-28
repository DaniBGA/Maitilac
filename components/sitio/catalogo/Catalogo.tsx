"use client";

import { useState } from "react";
import type { Ocasion, Producto } from "@/lib/tipos";
import { TarjetaProducto } from "./TarjetaProducto";

// Filtros por ocasión y grilla: pintarFiltros() y pintarCatalogo() de
// referencia/index.html:2116-2171. Markup de las secciones: referencia/index.html:830-839.
export function Catalogo({ productos, ocasiones }: { productos: Producto[]; ocasiones: Ocasion[] }) {
  const [activa, setActiva] = useState<string | null>(null);
  // Tocar el filtro activo lo apaga y vuelve a mostrar todo.
  const alternar = (key: string) => setActiva(key === activa ? null : key);

  const contar = (o: Ocasion) => productos.filter((p) => o.match.includes(p.nombre)).length;
  const visibles = ocasiones.filter((o) => o.ver !== false);
  const oc = activa ? visibles.find((o) => o.key === activa) : undefined;
  const lista = oc ? productos.filter((p) => oc.match.includes(p.nombre)) : productos;

  return (
    <>
      {/* Filtros por ocasión */}
      <section className="sec-pad cat-15">
        <h3 className="serif cat-16">Buscá por ocasión</h3>
        <div className="cat-17" id="filtros">
          {visibles.map((o) => {
            const n = contar(o);
            // Un filtro sin productos disponibles se muestra apagado y no se puede apretar
            if (!n)
              return (
                <button
                  key={o.key}
                  type="button"
                  disabled
                  title="Por ahora no hay quesos para esta búsqueda"
                  className="fl-off"
                >
                  {o.label}
                </button>
              );
            return (
              <button
                key={o.key}
                type="button"
                className={`js-filtro fl-btn${o.key === activa ? " fl-on" : ""}`}
                aria-pressed={o.key === activa}
                data-key={o.key}
                onClick={() => alternar(o.key)}
              >
                {o.label} <span className="fl-n">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="cat-18"></div>
      </section>
      {/* Grilla de productos */}
      <section className="sec-pad cat-19" id="grid">
        <div className="grid-4 cat-20" id="catalogo-grid">
          {lista.length ? (
            lista.map((p) => <TarjetaProducto key={p.nombre} p={p} />)
          ) : (
            <div className="cv-vacio">
              <p className="cv-texto">No hay quesos para esta búsqueda por el momento.</p>
              <button
                type="button"
                className="js-filtro cv-btn"
                data-key={activa || ""}
                onClick={() => setActiva(null)}
              >
                Ver todo el catálogo
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
