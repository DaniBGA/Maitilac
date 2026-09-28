import { AbrirProducto } from "./AbrirProducto";
import { IcoOjo } from "./Icono";

/**
 * Botón "Ver Detalles" de las tarjetas (en el sitio viejo, <button class="btn-detalles" data-abrir>).
 * Diferencia aprobada pendiente: en el Inicio del sitio viejo no abría nada
 * (el modal estaba dentro de la página del catálogo, oculta) y bloqueaba el scroll.
 */
export function BotonDetalles({ slug, className }: { slug: string; className?: string }) {
  return (
    <AbrirProducto slug={slug} className={className ? `btn-detalles ${className}` : "btn-detalles"}>
      <IcoOjo /> Ver Detalles
    </AbrirProducto>
  );
}
