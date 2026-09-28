import Link from "next/link";
import type { Local } from "@/lib/tipos";
import { ruta } from "@/lib/util";
import { AbiertoAhora } from "../AbiertoAhora";
import { IcoPin } from "../Icono";

// Tarjeta de local del Inicio: pintarLocalesHome() de referencia/index.html:1897-1926.
export function LocalResumen({ l }: { l: Local }) {
  return (
    <div className="lr-card">
      {l.foto ? (
        <img src={ruta(l.foto)} alt={`Frente del ${l.nombre}`} loading="lazy" className="lr-img" />
      ) : (
        <div className="ph lr-ph" data-ph={`foto — fachada ${l.nombre}`}></div>
      )}
      <div className="lr-cuerpo">
        <div className="lr-cab">
          <div>
            <h3 className="serif lr-nombre">{l.nombre}</h3>
            <div className="lr-dir">
              <IcoPin />
              {l.direccion}
            </div>
          </div>
          <AbiertoAhora local={l} className="lr-abierto" />
        </div>
        <div className="lr-rotulo">HORARIOS</div>
        <div className="lr-horarios">
          <div>
            <div className="lr-dia">Lun a Sáb</div>
            <div className="lr-hora">{l.semana}</div>
          </div>
          {l.domingo ? (
            <div>
              <div className="lr-dia">Domingos</div>
              <div className="lr-hora">{l.domingo}</div>
            </div>
          ) : null}
        </div>
        <Link href="/locales" data-go="locales" className="lr-llegar">
          Cómo llegar
        </Link>
      </div>
    </div>
  );
}
