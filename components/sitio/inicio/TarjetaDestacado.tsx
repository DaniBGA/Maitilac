import type { Producto } from "@/lib/tipos";
import { precioVisible, slug } from "@/lib/util";
import { BotonDetalles } from "../BotonDetalles";
import { Foto } from "../Foto";

// Tarjeta del Inicio: pintarDestacados() de referencia/index.html:1844-1895.
// La foto es siempre la primera (en el Inicio del sitio viejo no hay flechas).
export function TarjetaDestacado({ p }: { p: Producto }) {
  return (
    <div className="card">
      <div className="td-foto">
        <Foto
          src={p.photos[0] ?? ""}
          sizes="(max-width:720px) 90vw, (max-width:1024px) 46vw, 280px"
          alt={p.nombre}
          loading="lazy"
          className="td-img"
        />
        {p.badge ? <span className="badge">{p.badge}</span> : null}
      </div>
      <div className="td-cuerpo">
        <div className="td-titulo">
          <h3 className="serif">{p.nombre}</h3>
        </div>
        <p className="td-desc">{p.desc || ""}</p>
        {precioVisible(p) ? (
          <div className="td-precio">
            <span className="precio">{p.precio}</span>
            <span className="td-unidad">/ {p.unidad}</span>
          </div>
        ) : null}
        <BotonDetalles slug={slug(p.nombre)} className="td-boton" />
      </div>
    </div>
  );
}
