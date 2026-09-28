import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida autocontenida para la imagen Docker del VPS (ver docs/PASO A PASO.md, Etapa 4).
  output: "standalone",
  // Sin el indicador flotante de desarrollo: tapa parte de las capturas de los tests visuales.
  // Los errores de consola los controla el test "sin errores en consola".
  devIndicators: false,
};

export default nextConfig;
