"use client";

import { useRouter } from "next/navigation";
import { IcoOjo } from "./Icono";

/**
 * Botón "Ver Detalles" de las tarjetas. En el sitio viejo era un <button> con
 * data-abrir; se mantiene <button> para que se vea igual.
 * Diferencia aprobada pendiente: en el Inicio del sitio viejo no abría nada
 * (el modal estaba dentro de la página del catálogo, oculta) y bloqueaba el scroll.
 */
export function BotonDetalles({ slug, className }: { slug: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className ? `btn-detalles ${className}` : "btn-detalles"}
      onClick={() => router.push(`/catalogo/${slug}`, { scroll: false })}
    >
      <IcoOjo /> Ver Detalles
    </button>
  );
}
