import type { Producto } from "@/lib/tipos";
import { precioVisible, ruta, slug } from "@/lib/util";
import { BotonDetalles } from "../BotonDetalles";
import { IcoInfo, IcoPin } from "../Icono";

/** Maridajes que entran en un renglón, con la misma regla que el sitio viejo. */
function maridajesVisibles(comida: string[]) {
  let cupo = 26;
  const muestra: string[] = [];
  for (const m of comida) {
    if (muestra.length >= 2 || m.length > cupo) break;
    muestra.push(m);
    cupo -= m.length + 3;
  }
  return muestra;
}

// Tarjeta del Inicio: pintarDestacados() de referencia/index.html:1844-1895.
// La foto es siempre la primera (en el Inicio del sitio viejo no hay flechas).
export function TarjetaDestacado({ p }: { p: Producto }) {
  const muestra = maridajesVisibles(p.comida);
  const resto = p.comida.length - muestra.length;
  return (
    <div className="card">
      <div className="td-foto">
        <img src={ruta(p.photos[0] || "")} alt={p.nombre} loading="lazy" className="td-img" />
        {p.badge ? <span className="badge">{p.badge}</span> : null}
      </div>
      <div className="td-cuerpo">
        <div className="td-titulo">
          <h3 className="serif">{p.nombre}</h3>
        </div>
        <p className="td-desc">{p.desc || ""}</p>
        <div className="td-precio">
          {precioVisible(p) ? (
            <>
              <span className="precio">{p.precio}</span>
              <span className="td-unidad">/ {p.unidad}</span>
            </>
          ) : (
            <span className="precio">Consultar</span>
          )}
        </div>
        <div className="td-caja">
          <div className="td-rotulo">
            <IcoInfo /> MARIDAJES
          </div>
          <div className="td-maridajes">
            {muestra.map((m) => (
              <span key={m} className="chip">
                {m}
              </span>
            ))}
            {resto > 0 ? <span className="td-extra">+{resto}</span> : null}
          </div>
          <div className="td-rotulo-locales">
            <IcoPin /> LOCALES
          </div>
          <div className="td-locales">
            <span className="td-local">
              <span className="td-punto"></span>Maipú
            </span>
            <span className="td-local">
              <span className="td-punto"></span>Avellaneda
            </span>
          </div>
        </div>
        <BotonDetalles slug={slug(p.nombre)} className="td-boton" />
      </div>
    </div>
  );
}
