"use client";

import { useState } from "react";
import {
  fotoLocal,
  fotoProductoDelMes,
  guardarConfig,
  guardarLocal,
  guardarProductoDelMes,
} from "@/lib/gestor/acciones";
import type { GLocal, GProducto, GProductoDelMes } from "@/lib/gestor/tipos";
import type { Config } from "@/lib/tipos";
import { ruta } from "@/lib/util";
import { subirFoto, type Correr } from "./comun";

function Texto({
  etiqueta,
  valor,
  alCambiar,
  ayuda,
  ejemplo,
}: {
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  ayuda?: string;
  ejemplo?: string;
}) {
  return (
    <div className="g-campo">
      <label>{etiqueta}</label>
      <input type="text" value={valor} placeholder={ejemplo} onChange={(e) => alCambiar(e.target.value)} />
      {ayuda ? <div className="g-ayuda">{ayuda}</div> : null}
    </div>
  );
}

function FotoCambiable({
  titulo,
  foto,
  alElegir,
}: {
  titulo: string;
  foto: string;
  alElegir: (f: File) => void;
}) {
  return (
    <div className="gn-foto">
      {titulo}
      <label className="g-premio-foto" title="Cambiar foto">
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
    </div>
  );
}

function EditorLocal({ local, correr }: { local: GLocal; correr: Correr }) {
  const [l, setL] = useState(local);
  const c = (cambio: Partial<GLocal>) => setL((x) => ({ ...x, ...cambio }));
  return (
    <div className="gn-local">
      <div className="g-fila">
        <Texto etiqueta="Nombre" valor={l.nombre} alCambiar={(v) => c({ nombre: v })} />
        <Texto etiqueta="Dirección" valor={l.direccion} alCambiar={(v) => c({ direccion: v })} />
      </div>
      <div className="g-fila">
        <Texto
          etiqueta="Horario de lunes a sábado (como se muestra)"
          valor={l.horarioSemana}
          ejemplo="8:30 a 21:00 hs"
          alCambiar={(v) => c({ horarioSemana: v })}
        />
        <Texto
          etiqueta="Horario de domingo (vacío si cierra)"
          valor={l.horarioDomingo}
          ejemplo="9:30 a 13:30 hs"
          alCambiar={(v) => c({ horarioDomingo: v })}
        />
      </div>
      <div className="g-campo">
        <label>Horarios para el cartel &quot;Abierto ahora&quot;</label>
        <div className="gn-horas">
          <input
            type="time"
            aria-label="Abre (lunes a sábado)"
            value={l.abre}
            onChange={(e) => c({ abre: e.target.value })}
          />
          <input
            type="time"
            aria-label="Cierra (lunes a sábado)"
            value={l.cierra}
            onChange={(e) => c({ cierra: e.target.value })}
          />
          <input
            type="time"
            aria-label="Abre (domingo)"
            value={l.domAbre}
            onChange={(e) => c({ domAbre: e.target.value })}
          />
          <input
            type="time"
            aria-label="Cierra (domingo)"
            value={l.domCierra}
            onChange={(e) => c({ domCierra: e.target.value })}
          />
        </div>
        <div className="g-ayuda">
          Lunes a sábado: abre y cierra. Domingo: abre y cierra (vacíos si ese día está cerrado).
        </div>
      </div>
      <div className="g-campo">
        <label>Cómo llegar</label>
        <textarea
          rows={2}
          value={l.comoLlegar}
          onChange={(e) => c({ comoLlegar: e.target.value })}
        ></textarea>
      </div>
      <Texto
        etiqueta="Enlace al mapa"
        valor={l.mapaUrl}
        ejemplo="https://maps.google.com/?q=..."
        alCambiar={(v) => c({ mapaUrl: v })}
      />
      <div className="g-campo">
        <div className="gn-fotos">
          <FotoCambiable
            titulo="Foto del Inicio"
            foto={local.foto}
            alElegir={(f) => correr(subirFoto(f, (fd) => fotoLocal(local.id, "resumen", fd)))}
          />
          <FotoCambiable
            titulo="Foto de la página Locales"
            foto={local.fotoDetalle}
            alElegir={(f) => correr(subirFoto(f, (fd) => fotoLocal(local.id, "detalle", fd)))}
          />
        </div>
      </div>
      <button className="g-bt g-bt-verde" onClick={() => correr(guardarLocal(local.id, l))}>
        Guardar local
      </button>
    </div>
  );
}

/**
 * Bloque nuevo "Contacto y locales": el gestor viejo no permitía editar estos
 * datos (estaban escritos en el HTML). Incluye el producto del mes del catálogo.
 */
export function BloqueContacto({
  config,
  locales,
  productoDelMes,
  productos,
  correr,
}: {
  config: Config;
  locales: GLocal[];
  productoDelMes: GProductoDelMes;
  productos: GProducto[];
  correr: Correr;
}) {
  const [cfg, setCfg] = useState(config);
  const [pdm, setPdm] = useState(productoDelMes);
  const c = (cambio: Partial<Config>) => setCfg((x) => ({ ...x, ...cambio }));

  return (
    <div className="g-bloque" data-nuevo id="g-contacto">
      <div className="g-bloque-hdr">
        <h2 className="serif">Contacto y locales</h2>
        <button className="g-bt g-bt-verde" onClick={() => correr(guardarConfig(cfg))}>
          Guardar contacto
        </button>
      </div>
      <div className="g-ayuda ges-7">
        Los números de WhatsApp reciben los mensajes del formulario de contacto y de los botones
        &quot;Consultar por WhatsApp&quot;. Escribilos con código de país y de área, sin espacios (ej:
        542494538291).
      </div>
      <div className="g-fila">
        <Texto etiqueta="WhatsApp del local" valor={cfg.whatsapp} alCambiar={(v) => c({ whatsapp: v })} />
        <Texto
          etiqueta="WhatsApp de compras por mayor"
          valor={cfg.whatsappMayorista}
          alCambiar={(v) => c({ whatsappMayorista: v })}
        />
      </div>
      <div className="g-fila">
        <Texto etiqueta="Teléfono" valor={cfg.telefono} alCambiar={(v) => c({ telefono: v })} />
        <Texto etiqueta="Email" valor={cfg.email} alCambiar={(v) => c({ email: v })} />
      </div>
      <div className="g-fila">
        <Texto etiqueta="Instagram" valor={cfg.instagram} alCambiar={(v) => c({ instagram: v })} />
        <Texto etiqueta="Facebook" valor={cfg.facebook} alCambiar={(v) => c({ facebook: v })} />
      </div>

      <h3 className="serif gn-sub">Producto del mes</h3>
      <div className="g-ayuda ges-7">El bloque grande que se ve arriba de todo en el catálogo.</div>
      <div className="g-fila">
        <div className="g-campo">
          <label>Producto</label>
          <select value={pdm.productoId} onChange={(e) => setPdm({ ...pdm, productoId: e.target.value })}>
            <option value="">— No mostrar el bloque —</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <Texto etiqueta="Texto" valor={pdm.texto} alCambiar={(v) => setPdm({ ...pdm, texto: v })} />
      </div>
      <div className="g-campo gn-fotos">
        <FotoCambiable
          titulo="Foto"
          foto={productoDelMes.foto}
          alElegir={(f) => correr(subirFoto(f, fotoProductoDelMes))}
        />
      </div>
      <button
        className="g-bt g-bt-verde"
        onClick={() => correr(guardarProductoDelMes(pdm.productoId, pdm.texto))}
      >
        Guardar producto del mes
      </button>

      <h3 className="serif gn-sub">Locales</h3>
      {locales.map((l) => (
        <EditorLocal key={`${l.id}-${l.foto}-${l.fotoDetalle}`} local={l} correr={correr} />
      ))}
    </div>
  );
}
