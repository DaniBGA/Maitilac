"use client";

import { useState } from "react";
import { asignarFoto, crearProductoConFoto, subirFotosBanco } from "@/lib/gestor/acciones";
import type { GFoto, GProducto } from "@/lib/gestor/tipos";
import { ruta } from "@/lib/util";
import { subirFoto, type Correr } from "./comun";
import type { Resultado } from "@/lib/gestor/tipos";

const NUEVO = "__nuevo__";

/**
 * Bloque nuevo "Banco de fotos" (pendiente del registro, §24): todas las fotos,
 * a qué producto pertenece cada una y las que quedaron sueltas (borde naranja).
 * Asignar una foto la saca de donde estaba antes; "Sin asignar" no borra el archivo.
 */
export function BancoFotos({
  fotos,
  productos,
  correr,
  alCrearProducto,
}: {
  fotos: GFoto[];
  productos: GProducto[];
  correr: Correr;
  alCrearProducto: (accion: Promise<Resultado>) => void;
}) {
  const [soloSueltas, setSoloSueltas] = useState(false);
  const idDe = (nombre: string) => productos.find((p) => p.nombre === nombre)?.id ?? "";
  const visibles = fotos.filter((f) => !soloSueltas || (!f.productos.length && !f.otros.length));

  const elegir = (f: GFoto, valor: string) => {
    if (valor === NUEVO) {
      const nombre = (prompt("Nombre del producto nuevo:") || "").trim();
      if (nombre) alCrearProducto(crearProductoConFoto(nombre, f.id));
      return;
    }
    correr(asignarFoto(f.id, valor || null));
  };

  // De a una: cada envío lleva una sola foto, así ninguno pasa el límite de Next.
  const subir = async (archivos: FileList | null) => {
    for (const a of Array.from(archivos ?? [])) {
      if (!(await correr(subirFoto(a, subirFotosBanco)))) return; // correr ya avisó qué pasó
    }
  };

  return (
    <div className="g-bloque" data-nuevo id="g-banco">
      <div className="g-bloque-hdr">
        <h2 className="serif">Banco de fotos</h2>
        <div className="ges-8">
          <button className={`g-pill${soloSueltas ? "" : " on"}`} onClick={() => setSoloSueltas(false)}>
            Todas
          </button>
          <button className={`g-pill${soloSueltas ? " on" : ""}`} onClick={() => setSoloSueltas(true)}>
            Sin asignar
          </button>
          <label className="g-bt g-bt-naranja gc-m0">
            Subir fotos
            <input
              type="file"
              id="gb-archivo"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                subir(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      <div className="g-ayuda ges-7">
        Todas las fotos del sitio. Debajo de cada una elegí a qué producto pertenece: la foto se saca de donde
        estaba antes. Las que no están en ningún lado tienen borde naranja. &quot;Producto nuevo…&quot; crea
        un producto con esa foto.
      </div>
      {!visibles.length ? (
        <div className="g-ayuda gc-m0">No hay fotos sin asignar.</div>
      ) : (
        <div className="gn-grilla">
          {visibles.map((f) => {
            const suelta = !f.productos.length && !f.otros.length;
            const actual = f.productos.length === 1 ? idDe(f.productos[0]) : "";
            return (
              <div key={f.id} className={`gn-banco${suelta ? " suelta" : ""}`}>
                <img src={ruta(f.archivo)} alt="" loading="lazy" />
                <div className="gn-banco-pie">
                  <div className="gn-archivo">{f.archivo.split("/").pop()}</div>
                  <div className={`gn-uso${suelta ? " suelta" : ""}`}>
                    {suelta
                      ? "Sin asignar"
                      : [
                          f.productos.length
                            ? `En ${f.productos.length === 1 ? f.productos[0] : `${f.productos.length} productos`}`
                            : "",
                          ...f.otros,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </div>
                  {f.otros.length ? null : (
                    <select
                      key={`${f.id}-${actual}`}
                      defaultValue={actual}
                      onChange={(e) => elegir(f, e.target.value)}
                    >
                      <option value="">— Sin asignar —</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                      <option value={NUEVO}>➕ Producto nuevo…</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
