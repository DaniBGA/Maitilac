"use client";

import { useState } from "react";
import type { Producto } from "@/lib/tipos";
import { indiceCircular, precioVisible, slug } from "@/lib/util";
import { BotonDetalles } from "../BotonDetalles";
import { IcoDer, IcoIzq } from "../Icono";
import { Foto } from "../Foto";

// Tarjeta del catálogo: tarjetaHTML(p, 220) de referencia/index.html:1811-1841,
// con flechas para pasar las fotos si tiene más de una.
export function TarjetaProducto({ p }: { p: Producto }) {
  const [idx, setIdx] = useState(0);
  const total = p.photos.length;
  const foto = total ? p.photos[indiceCircular(idx, total)] : "";

  return (
    <div className="card">
      <div className="tc-foto">
        <Foto
          src={foto}
          sizes="(max-width:720px) 90vw, (max-width:1024px) 46vw, 280px"
          alt={p.nombre}
          loading="lazy"
          className="tc-img"
        />
        {p.badge ? <span className="badge">{p.badge}</span> : null}
        {total > 1 ? (
          <>
            <button
              type="button"
              className="navimg js-foto tc-izq"
              aria-label="Anterior"
              onClick={() => setIdx(idx - 1)}
            >
              <IcoIzq />
            </button>
            <button
              type="button"
              className="navimg js-foto tc-der"
              aria-label="Siguiente"
              onClick={() => setIdx(idx + 1)}
            >
              <IcoDer />
            </button>
          </>
        ) : null}
      </div>
      <div className="tc-cuerpo">
        <div className="tc-titulo">
          <h3 className="serif">{p.nombre}</h3>
        </div>
        <div className="tc-tipo">{p.tipo || ""}</div>
        <p className="tc-desc">{p.desc || ""}</p>
        {p.presentaciones && p.presentaciones.length ? (
          <div className="tc-chips">
            {p.presentaciones.map((v) => (
              <span key={v} className="chip-pres tc-chip">
                {v}
              </span>
            ))}
          </div>
        ) : null}
        {p.quesos && p.quesos.length ? (
          <div className="tc-chips">
            {p.quesos.map((q) => (
              <span key={q} className="chip-queso tc-chip">
                {q}
              </span>
            ))}
          </div>
        ) : null}
        {precioVisible(p) ? (
          <div className="tc-precio">
            <span className="precio">{p.precio}</span>
            <span className="tc-unidad">/ {p.unidad}</span>
          </div>
        ) : null}
        <BotonDetalles slug={slug(p.nombre)} />
      </div>
    </div>
  );
}
