"use client";

import { useEffect, useState } from "react";
import { borrarProducto, guardarProducto, subirFotoProducto } from "@/lib/gestor/acciones";
import type { GProducto, ProductoEditado } from "@/lib/gestor/tipos";
import { ruta } from "@/lib/util";
import { formularioFoto, type Correr } from "./comun";

const PRESENTACIONES = ["Entero", "Trozado", "Feteado"];

const NUEVO: ProductoEditado = {
  nombre: "",
  tipo: "",
  activo: true,
  destacado: false,
  desc: "",
  precio: "",
  verPrecio: false,
  unidad: "kg",
  badge: "",
  photos: [],
  comida: [],
  bebida: [],
  presentaciones: [],
  quesos: [],
  premios: "",
};

// Panel de edición de un producto: markup de referencia/index.html:1263-1275 y
// gAbrirPanel()/gGuardarPanel() de referencia/index.html:2765-2972.
export function PanelProducto({
  id,
  productos,
  correr,
  avisar,
  alCerrar,
}: {
  id: string | null;
  productos: GProducto[];
  correr: Correr;
  avisar: (t: string) => void;
  alCerrar: () => void;
}) {
  const original = id ? productos.find((p) => p.id === id) : undefined;
  const [p, setP] = useState<ProductoEditado>(() => (original ? { ...original } : NUEVO));
  const [comida, setComida] = useState((original?.comida ?? []).join(", "));
  const [bebida, setBebida] = useState((original?.bebida ?? []).join(", "));
  const cambiar = (c: Partial<ProductoEditado>) => setP((x) => ({ ...x, ...c }));

  // Quesos que se pueden meter dentro de un combo o una picada: todos menos los
  // que a su vez están armados con otros quesos (así un combo no se puede incluir
  // a sí mismo ni meter otro combo adentro).
  const quesosDisp = productos.filter((x) => !x.quesos.length && x.nombre !== p.nombre).map((x) => x.nombre);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [alCerrar]);

  const alternar = (lista: string[], v: string, on: boolean) =>
    on ? [...lista, v] : lista.filter((x) => x !== v);
  const porComa = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const subir = async (archivos: FileList | null) => {
    const lista = Array.from(archivos ?? []);
    let agregadas = 0;
    for (const f of lista) {
      const r = await subirFotoProducto(formularioFoto(f));
      if (r.ok) {
        agregadas++;
        setP((x) => ({ ...x, photos: [...x.photos, r.archivo] }));
      } else avisar(r.error);
    }
    if (agregadas) avisar("Foto agregada");
  };

  const guardar = async () => {
    if (!p.nombre.trim()) {
      avisar("Poné un nombre al producto");
      document.getElementById("gf-nombre")?.focus();
      return;
    }
    if (await correr(guardarProducto(id, { ...p, comida: porComa(comida), bebida: porComa(bebida) })))
      alCerrar();
  };

  const borrar = async () => {
    if (!original) return;
    if (
      !confirm(
        `¿Eliminar "${original.nombre}" definitivamente?\n\nSi sólo querés que deje de verse en el sitio, cerrá esta ventana y usá "Sacar del sitio".`,
      )
    )
      return;
    if (await correr(borrarProducto(original.id))) alCerrar();
  };

  return (
    <div className="g-velo" id="g-velo" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="g-panel">
        <div className="g-panel-hdr">
          <h2 className="serif" id="g-panel-titulo">
            {original ? "Editar: " + original.nombre : "Nuevo producto"}
          </h2>
          <button className="g-bt g-bt-gris" id="g-cerrar" onClick={alCerrar}>
            Cerrar
          </button>
        </div>
        <div className="g-panel-body" id="g-panel-body">
          <div className="g-campo">
            <div className="g-sw">
              <input
                type="checkbox"
                id="gf-activo"
                checked={p.activo}
                onChange={(e) => cambiar({ activo: e.target.checked })}
              />
              <label htmlFor="gf-activo" className="ges-3">
                <strong className="gc-f145">Mostrar en el sitio</strong>
                <div className="g-ayuda ges-5">
                  Si lo destildás, el producto deja de verse en el sitio pero no se borra. Lo podés volver a
                  mostrar cuando quieras.
                </div>
              </label>
            </div>
          </div>

          <div className="g-campo">
            <div className="g-sw g-sw-destacado">
              <input
                type="checkbox"
                id="gf-destacado"
                checked={p.destacado}
                onChange={(e) => cambiar({ destacado: e.target.checked })}
              />
              <label htmlFor="gf-destacado" className="ges-3">
                <strong className="gc-f145">★ Producto destacado</strong>
                <div className="g-ayuda ges-5">
                  Aparece en la portada, en la sección &quot;Productos Destacados&quot;. Si no hay ninguno
                  marcado, esa sección no se muestra.
                </div>
              </label>
            </div>
          </div>
          <div className="g-fila">
            <div className="g-campo">
              <label>Nombre</label>
              <input
                type="text"
                id="gf-nombre"
                value={p.nombre}
                placeholder="Ej: Gouda"
                onChange={(e) => cambiar({ nombre: e.target.value })}
              />
            </div>
            <div className="g-campo">
              <label>Tipo</label>
              <input
                type="text"
                id="gf-tipo"
                value={p.tipo}
                placeholder="Ej: Pasta Semidura con Ojos"
                onChange={(e) => cambiar({ tipo: e.target.value })}
              />
            </div>
          </div>
          <div className="g-campo">
            <label>Descripción</label>
            <textarea
              id="gf-desc"
              rows={3}
              placeholder="Una o dos líneas describiendo el producto"
              value={p.desc}
              onChange={(e) => cambiar({ desc: e.target.value })}
            ></textarea>
          </div>
          <div className="g-fila">
            <div className="g-campo">
              <label>Precio</label>
              <input
                type="text"
                id="gf-precio"
                value={p.precio}
                placeholder="Ej: $4500 o Consultar"
                onChange={(e) => cambiar({ precio: e.target.value })}
              />
            </div>
            <div className="g-campo">
              <label>Unidad</label>
              <input
                type="text"
                id="gf-unidad"
                value={p.unidad}
                placeholder="kg / combo / unidad"
                onChange={(e) => cambiar({ unidad: e.target.value })}
              />
            </div>
          </div>
          <div className="g-campo">
            <div className="g-sw">
              <input
                type="checkbox"
                id="gf-verprecio"
                checked={p.verPrecio}
                onChange={(e) => cambiar({ verPrecio: e.target.checked })}
              />
              <label htmlFor="gf-verprecio" className="ges-3">
                <strong className="gc-f145">Mostrar el precio en el sitio</strong>
                <div className="g-ayuda ges-5">
                  Si lo destildás, en el sitio dice &quot;Consultar&quot; en lugar del precio. El precio queda
                  guardado para volver a mostrarlo.
                </div>
              </label>
            </div>
          </div>
          <div className="g-campo">
            <label>Presentación</label>
            <div className="g-checks" id="gf-presentaciones">
              {PRESENTACIONES.map((v) => {
                const on = p.presentaciones.includes(v);
                return (
                  <label key={v} className={`g-check${on ? " on" : ""}`}>
                    <input
                      type="checkbox"
                      value={v}
                      checked={on}
                      onChange={(e) =>
                        cambiar({ presentaciones: alternar(p.presentaciones, v, e.target.checked) })
                      }
                    />
                    {v}
                  </label>
                );
              })}
            </div>
            <div className="g-ayuda">
              Marcá todas las formas en que se vende. En el sitio aparecen como etiquetas. Un queso puede
              tener una, dos o las tres. Para combos y picadas, dejalas sin marcar.
            </div>
          </div>
          <div className="g-campo">
            <label>
              Quesos incluidos <span className="gc-nota">(sólo para combos y picadas)</span>
            </label>
            <div className="g-checks" id="gf-quesos">
              {quesosDisp.length ? (
                quesosDisp.map((q) => {
                  const on = p.quesos.includes(q);
                  return (
                    <label key={q} className={`g-check${on ? " on" : ""}`}>
                      <input
                        type="checkbox"
                        value={q}
                        checked={on}
                        onChange={(e) => cambiar({ quesos: alternar(p.quesos, q, e.target.checked) })}
                      />
                      {q}
                    </label>
                  );
                })
              ) : (
                <div className="g-ayuda">Todavía no hay quesos cargados.</div>
              )}
            </div>
            <div className="g-ayuda">
              Para un combo de 3 quesos, marcá exactamente tres. Se muestran como etiquetas verdes en el
              sitio.
            </div>
          </div>
          <div className="g-campo">
            <label>Etiqueta destacada</label>
            <input
              type="text"
              id="gf-badge"
              value={p.badge}
              placeholder="Ej: Nuevo, Producto del Mes (vacío si no lleva)"
              onChange={(e) => cambiar({ badge: e.target.value })}
            />
          </div>
          <div className="g-campo">
            <label>Maridaje — comida</label>
            <input
              type="text"
              id="gf-comida"
              value={comida}
              placeholder="Separá con comas: Nuez, Pera, Miel"
              onChange={(e) => setComida(e.target.value)}
            />
          </div>
          <div className="g-campo">
            <label>Maridaje — bebida</label>
            <input
              type="text"
              id="gf-bebida"
              value={bebida}
              placeholder="Separá con comas: Malbec, Cerveza rubia"
              onChange={(e) => setBebida(e.target.value)}
            />
          </div>
          <div className="g-campo">
            <label>Premios</label>
            <input
              type="text"
              id="gf-premios"
              value={p.premios}
              placeholder="Ej: ORO 2023 (vacío si no tiene)"
              onChange={(e) => cambiar({ premios: e.target.value })}
            />
          </div>
          <div className="g-campo">
            <label>Fotos</label>
            <div className="g-fotos" id="gf-fotos">
              {p.photos.length ? (
                p.photos.map((f, k) => (
                  <div key={f} className="g-foto-mini">
                    <img src={ruta(f)} alt="" />
                    <button
                      type="button"
                      className="g-foto-x js-g-quitar-foto"
                      title="Quitar"
                      onClick={() => cambiar({ photos: p.photos.filter((_, j) => j !== k) })}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="g-ayuda gc-m0">Todavía no hay fotos.</div>
              )}
            </div>
            <div className="gc-mt12">
              <label className="g-bt g-bt-gris gc-m0">
                Subir foto
                <input
                  type="file"
                  id="gf-archivo"
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
            <div className="g-ayuda">
              Las fotos se achican solas antes de guardarse. Conviene usar imágenes de hasta 1 MB.
            </div>
          </div>
        </div>
        <div className="g-panel-pie">
          <button className="g-bt g-bt-verde ges-10" id="g-guardar" onClick={guardar}>
            Guardar cambios
          </button>
          {original ? (
            <button className="g-bt g-bt-rojo" id="g-borrar" onClick={borrar}>
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
