import type { Metadata, Viewport } from "next";
import { OG_BASE, URL_SITIO } from "@/lib/sitio";
import "./globals.css";

// Título, descripción e ícono del sitio viejo (referencia/index.html:4-8). Cada página
// pone su título con la plantilla ("Nuestro Catálogo — Maitilac").
export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: "Maitilac — Quesos artesanales de Tandil",
    template: "%s — Maitilac",
  },
  description:
    "Quesos artesanales elaborados con leche propia desde nuestros tambos, en Tandil. Empresa familiar con más de 40 años de tradición.",
  icons: { icon: "/img/logo-tandil-2.png" },
  openGraph: OG_BASE,
};

// Igual que el sitio viejo: viewport-fit=cover (pantallas con muesca).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
