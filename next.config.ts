import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida autocontenida para la imagen Docker del VPS (ver docs/PASO A PASO.md, Etapa 4).
  output: "standalone",
};

export default nextConfig;
