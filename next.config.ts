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
  // Fotos optimizadas por Next (components/sitio/Foto.tsx): AVIF o WebP según el navegador,
  // del ancho que pide el srcset, guardadas en .next/cache/images.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [400, 800, 1200, 1600, 2000],
    imageSizes: [120, 240],
    qualities: [75],
    // Los archivos no cambian: las fotos subidas tienen nombre único y las de public/ vienen con el código.
    minimumCacheTTL: 2678400, // 31 días
    localPatterns: [
      { pathname: "/img/**", search: "" },
      { pathname: "/fotos/**", search: "" },
      { pathname: "/fondo-hero.jpg", search: "" },
    ],
  },
};

export default nextConfig;
