"use client";

import { useState } from "react";
import colores from "@/content/colores.json";
import { guardarAnuncios } from "@/lib/gestor/acciones";
import type { Anuncio, Anuncios as TAnuncios, Color } from "@/lib/tipos";
import type { Correr } from "./comun";

const COLORES = colores as Record<string, Color>;
type Clave = keyof TAnuncios;

const CARTELES: { clave: Clave; id: string; titulo: string; ayuda: string; ejemplo: string }[] = [
  {
    clave: "barra",
    id: "barra",
    titulo: "Barra marrón superior",
    ayuda: "La franja que cruza todo el ancho, arriba de la foto.",
    ejemplo: "Ej: ¡NUEVA VARIEDAD DE QUESO AZUL DISPONIBLE!",
  },
  {
    clave: "badge1",
    id: "b1",
    titulo: "Banner naranja",
    ayuda: "El primer globo sobre la foto. Suele usarse para promociones.",
    ejemplo: "Ej: 20% OFF",
  },
  {
    clave: "badge2",
    id: "b2",
    titulo: "Banner verde",
    ayuda: "El segundo globo, al lado del naranja.",
    ejemplo: "Ej: ¡NUEVA VARIEDAD DE QUESO AZUL DISPONIBLE!",
  },
];

// Bloque "Anuncios de la portada": markup de referencia/index.html:1128-1199 y
// gCargarAnuncios()/gVistaAnuncios()/gGuardarAnuncios() de referencia/index.html:2329-2391.
export function BloqueAnuncios({ anuncios, correr }: { anuncios: TAnuncios; correr: Correr }) {
  const [editado, setEditado] = useState<TAnuncios>(anuncios);
  const cambiar = (clave: Clave, cambio: Partial<Anuncio>) =>
    setEditado((a) => ({ ...a, [clave]: { ...a[clave], ...cambio } }));

  return (
    <div className="g-bloque">
      <div className="g-bloque-hdr">
        <h2 className="serif">Anuncios de la portada</h2>
        <button
          className="g-bt g-bt-verde"
          id="g-guardar-anuncios"
          onClick={() => correr(guardarAnuncios(editado))}
        >
          Guardar anuncios
        </button>
      </div>
      <div className="g-anuncios">
        {CARTELES.map(({ clave, id, titulo, ayuda, ejemplo }) => {
          const a = editado[clave];
          const t = a.texto.trim();
          const c = COLORES[a.color] || COLORES.marron;
          const vista = t || "(sin texto)";
          const estilo = { background: c.fondo, color: c.texto };
          const apagado = !(a.ver && t) ? " g-apagado" : "";
          return (
            <div key={clave} className="g-anuncio">
              <div className="g-sw ges-2">
                <input
                  type="checkbox"
                  id={`ga-${id}-on`}
                  checked={a.ver}
                  onChange={(e) => cambiar(clave, { ver: e.target.checked })}
                />
                <label className="ges-3" htmlFor={`ga-${id}-on`}>
                  <strong className="ges-4">{titulo}</strong>
                  <div className="g-ayuda ges-5">{ayuda}</div>
                </label>
              </div>
              {clave === "barra" ? (
                <div className={`g-vista${apagado}`} id="gc-barra" style={estilo}>
                  <span id="gv-barra">{vista}</span>
                </div>
              ) : (
                <div className="g-vista">
                  <span className={`g-prev${apagado}`} id={`gv-${id}`} style={estilo}>
                    {vista}
                  </span>
                </div>
              )}
              <div className="g-campo ges-6">
                <label>Texto</label>
                <input
                  type="text"
                  id={`ga-${id}-txt`}
                  placeholder={ejemplo}
                  value={a.texto}
                  onChange={(e) => cambiar(clave, { texto: e.target.value })}
                />
              </div>
              <div className="g-campo ges-6">
                <label>Color</label>
                <div className="g-colores" data-para={clave}>
                  {Object.entries(COLORES).map(([k, col]) => (
                    <button
                      key={k}
                      type="button"
                      className={`g-color js-color${a.color === k ? " on" : ""}`}
                      data-para={clave}
                      data-color={k}
                      title={col.nombre}
                      aria-label={col.nombre}
                      style={{ background: col.fondo }}
                      onClick={() => cambiar(clave, { color: k })}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
