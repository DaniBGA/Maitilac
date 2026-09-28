import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maitilac — Quesos artesanales de Tandil",
  description:
    "Quesos artesanales elaborados con leche propia desde nuestros tambos, en Tandil. Empresa familiar con más de 40 años de tradición.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
