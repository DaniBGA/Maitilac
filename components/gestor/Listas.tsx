"use client";

import {
  actualizarPersona,
  actualizarPremio,
  borrarPersona,
  borrarPremio,
  crearPersona,
  crearPremio,
  fotoPersona,
  fotoPremio,
  moverPersona,
  moverPremio,
  restaurarPremios,
  verPersona,
  verPremio,
} from "@/lib/gestor/acciones";
import type { GPersona, GPremio } from "@/lib/gestor/tipos";
import { ruta } from "@/lib/util";
import { Flechas, formularioFoto, Mas, type Correr } from "./comun";

/** Campo de texto que se guarda al salir de él (como los del gestor viejo). */
function Campo({
  valor,
  className,
  placeholder,
  alGuardar,
}: {
  valor: string;
  className?: string;
  placeholder: string;
  alGuardar: (v: string) => void;
}) {
  return (
    <input
      key={valor}
      type="text"
      className={className}
      defaultValue={valor}
      placeholder={placeholder}
      onBlur={(e) => {
        const v = e.target.value.trim();
        if (v !== valor) alGuardar(v);
      }}
    />
  );
}

/** Recuadro de foto: al tocarlo se elige una imagen nueva. */
function Foto({
  className,
  foto,
  alElegir,
}: {
  className: string;
  foto: string;
  alElegir: (f: File) => void;
}) {
  return (
    <label className={className} title="Cambiar foto">
      {foto ? <img src={ruta(foto)} alt="" /> : <span>Sin foto</span>}
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) alElegir(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

// Bloque "Premios": markup de referencia/index.html:1217-1231 y gPintarPremios()
// y sus eventos de referencia/index.html:2553-2631.
export function BloquePremios({ premios, correr }: { premios: GPremio[]; correr: Correr }) {
  return (
    <div className="g-bloque">
      <div className="g-bloque-hdr">
        <h2 className="serif">Premios</h2>
        <div className="ges-8">
          <button
            className="g-bt g-bt-gris"
            id="g-premios-restaurar"
            title="Vuelve a los premios originales, con las fotos de los diplomas"
            onClick={() => {
              if (
                confirm(
                  "Esto descarta los cambios en los premios y vuelve a la lista original, con las fotos de los diplomas.\n\n¿Continuar?",
                )
              )
                correr(restaurarPremios());
            }}
          >
            Restaurar premios
          </button>
          <button className="g-bt g-bt-naranja" id="g-premio-nuevo" onClick={() => correr(crearPremio())}>
            <Mas /> Agregar premio
          </button>
        </div>
      </div>
      <div className="g-ayuda ges-7">
        Son los que se ven en el carrusel de la página Nosotros. Destildá uno para que deje de mostrarse sin
        borrarlo. &quot;Restaurar premios&quot; vuelve a la lista original con las fotos de los diplomas.
      </div>
      <div id="g-premios">
        {!premios.length ? (
          <div className="g-ayuda gc-m0">No hay premios cargados. El carrusel no se muestra.</div>
        ) : (
          premios.map((p, i) => (
            <div key={p.id} className={`g-premio${p.ver ? "" : " off"}`}>
              <Flechas i={i} total={premios.length} alMover={(dir) => correr(moverPremio(p.id, dir))} />
              <input
                type="checkbox"
                key={`ver-${p.ver}`}
                className="js-pr-ver"
                defaultChecked={p.ver}
                title="Mostrar en el sitio"
                onChange={(e) => correr(verPremio(p.id, e.target.checked))}
              />
              <Foto
                className="g-premio-foto"
                foto={p.foto}
                alElegir={(f) => correr(fotoPremio(p.id, formularioFoto(f)))}
              />
              <div className="g-premio-campos">
                <Campo
                  className="gp-anio js-pr-campo"
                  valor={p.anio}
                  placeholder="Año"
                  alGuardar={(v) => correr(actualizarPremio(p.id, "anio", v))}
                />
                <Campo
                  className="gp-titulo js-pr-campo"
                  valor={p.titulo}
                  placeholder="Ej: Oro, Plata, Gran Campeón"
                  alGuardar={(v) => correr(actualizarPremio(p.id, "titulo", v))}
                />
                <Campo
                  className="js-pr-campo gc-ancho"
                  valor={p.evento}
                  placeholder="Concurso"
                  alGuardar={(v) => correr(actualizarPremio(p.id, "evento", v))}
                />
                <Campo
                  className="js-pr-campo gc-ancho"
                  valor={p.detalle}
                  placeholder="Quesos premiados"
                  alGuardar={(v) => correr(actualizarPremio(p.id, "detalle", v))}
                />
              </div>
              <button
                type="button"
                className="g-premio-x js-pr-borrar"
                onClick={() => {
                  if (
                    confirm(
                      `¿Eliminar el premio "${p.titulo} ${p.anio}"?\n\nSi sólo querés que no se vea, destildá la casilla en vez de eliminar.`,
                    )
                  )
                    correr(borrarPremio(p.id));
                }}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Bloque "Nuestro Equipo": markup de referencia/index.html:1234-1244 y gPintarEquipo()
// y sus eventos de referencia/index.html:2632-2707.
export function BloqueEquipo({ equipo, correr }: { equipo: GPersona[]; correr: Correr }) {
  return (
    <div className="g-bloque">
      <div className="g-bloque-hdr">
        <h2 className="serif">Nuestro Equipo</h2>
        <button className="g-bt g-bt-naranja" id="g-persona-nueva" onClick={() => correr(crearPersona())}>
          <Mas /> Agregar persona
        </button>
      </div>
      <div className="g-ayuda ges-7">
        Son las personas que aparecen en la sección &quot;Nuestro Equipo&quot; de la página Nosotros. Destildá
        a alguien para que deje de mostrarse sin borrarlo.
      </div>
      <div id="g-equipo">
        {!equipo.length ? (
          <div className="g-ayuda gc-m0">
            No hay nadie cargado. La sección &quot;Nuestro Equipo&quot; no se muestra.
          </div>
        ) : (
          equipo.map((m, i) => (
            <div key={m.id} className={`g-persona${m.ver ? "" : " off"}`}>
              <Flechas i={i} total={equipo.length} alMover={(dir) => correr(moverPersona(m.id, dir))} />
              <input
                type="checkbox"
                key={`ver-${m.ver}`}
                className="js-pe-ver"
                defaultChecked={m.ver}
                title="Mostrar en el sitio"
                onChange={(e) => correr(verPersona(m.id, e.target.checked))}
              />
              <Foto
                className="g-persona-foto"
                foto={m.foto}
                alElegir={(f) => correr(fotoPersona(m.id, formularioFoto(f)))}
              />
              <div className="g-persona-campos">
                <Campo
                  className="gp-nombre js-pe-campo"
                  valor={m.nombre}
                  placeholder="Nombre"
                  alGuardar={(v) => correr(actualizarPersona(m.id, "nombre", v))}
                />
                <Campo
                  className="js-pe-campo"
                  valor={m.rol}
                  placeholder="Cargo"
                  alGuardar={(v) => correr(actualizarPersona(m.id, "rol", v))}
                />
                <Campo
                  className="js-pe-campo"
                  valor={m.area}
                  placeholder="Profesión o área"
                  alGuardar={(v) => correr(actualizarPersona(m.id, "area", v))}
                />
              </div>
              <button
                type="button"
                className="g-premio-x js-pe-borrar gc-mt0"
                onClick={() => {
                  if (
                    confirm(
                      `¿Eliminar a "${m.nombre}" del equipo?\n\nSi sólo querés que no se vea, destildá la casilla en vez de eliminar.`,
                    )
                  )
                    correr(borrarPersona(m.id));
                }}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
