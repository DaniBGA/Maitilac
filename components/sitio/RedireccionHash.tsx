"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// En el sitio viejo las secciones eran /#nosotros, /#catalogo, etc. (y el gestor, /#gestor).
// Los enlaces que ya estén compartidos así llevan a la página nueva correspondiente.
const DESTINOS: Record<string, string> = {
  home: "/",
  nosotros: "/nosotros",
  catalogo: "/catalogo",
  locales: "/locales",
  contacto: "/contacto",
  gestor: "/gestor",
};

export function RedireccionHash() {
  const ruta = usePathname();
  const router = useRouter();
  useEffect(() => {
    const destino = DESTINOS[location.hash.slice(1)];
    if (ruta !== "/" || !destino) return;
    if (destino === "/") history.replaceState(null, "", "/");
    else router.replace(destino);
  }, [ruta, router]);
  return null;
}
