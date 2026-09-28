"use client";

import { useRouter } from "next/navigation";

/**
 * Botón que abre el detalle de un producto (en el sitio viejo: data-abrir).
 * Navega a /catalogo/<slug>: desde el sitio se abre como modal sobre la página
 * actual (ruta interceptada, app/(sitio)/@modal); entrando directo, como página.
 */
export function AbrirProducto({
  slug,
  className,
  children,
}: {
  slug: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => router.push(`/catalogo/${slug}`, { scroll: false })}
    >
      {children}
    </button>
  );
}
