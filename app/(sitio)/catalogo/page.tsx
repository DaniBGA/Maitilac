import type { Metadata } from "next";
import { OG_BASE } from "@/lib/sitio";
import { Pagina } from "@/components/sitio/Pagina";
import { PaginaCatalogo } from "@/components/sitio/catalogo/PaginaCatalogo";

// Título y descripción: el título y la bajada de la página, tal cual.
export const metadata: Metadata = {
  title: "Nuestro Catálogo",
  description: "Descubrí la variedad de sabores y texturas que logramos para vos.",
  alternates: { canonical: "/catalogo" },
  openGraph: {
    ...OG_BASE,
    url: "/catalogo",
    title: "Nuestro Catálogo — Maitilac",
    description: "Descubrí la variedad de sabores y texturas que logramos para vos.",
  },
};

export default function Catalogo() {
  return (
    <Pagina>
      <PaginaCatalogo />
    </Pagina>
  );
}
