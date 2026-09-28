import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida autocontenida para la imagen Docker del VPS (ver docs/PASO A PASO.md, Etapa 4).
  output: "standalone",
  // Nada de esto va en el servidor: la salida standalone tiene que llevar sólo el código.
  // (public/ se copia aparte en la imagen Docker; las fotos subidas viven en un volumen.)
  outputFileTracingExcludes: {
    "*": ["referencia/**", "_fuentes/**", "subidas/**", "docs/**", "tests/**", "public/**", ".env*"],
  },
  // Caché por etiqueta con 'use cache' (lib/datos.ts).
  cacheComponents: true,
  // Sin el indicador flotante de desarrollo: tapa parte de las capturas de los tests visuales.
  // Los errores de consola los controla el test "sin errores en consola".
  devIndicators: false,
};

export default nextConfig;
