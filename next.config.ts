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
  // Fotos del gestor: cada envío lleva una sola, de hasta 15 MB (FOTO_MAXIMO_MB en
  // lib/gestor/tipos.ts), más lo que suma el formulario. Next acepta 1 MB por defecto en
  // las Server Actions, y proxy.ts (que mira /gestor) guarda hasta 10 MB del envío.
  experimental: {
    serverActions: { bodySizeLimit: "16mb" },
    proxyClientMaxBodySize: "16mb",
  },
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
  // Archivos de public/: Next los manda con max-age=0 y el navegador los vuelve a pedir en
  // cada visita. Las fuentes no cambian nunca; las imágenes y el video, 31 días como las optimizadas.
  // (Si se reemplaza un archivo, conviene cambiarle el nombre.)
  async headers() {
    const dias = (n: number) => `public, max-age=${n * 86400}`;
    return [
      { source: "/fonts/:archivo*", headers: [{ key: "Cache-Control", value: `${dias(365)}, immutable` }] },
      { source: "/img/:archivo*", headers: [{ key: "Cache-Control", value: dias(31) }] },
      { source: "/fondo-hero.jpg", headers: [{ key: "Cache-Control", value: dias(31) }] },
      { source: "/video/:archivo*", headers: [{ key: "Cache-Control", value: dias(31) }] },
    ];
  },
  // Al gestor se entra escribiendo <dominio>/admin: el enlace del footer se sacó (paso 5.10).
  // Temporal (307): el navegador no la guarda, por si algún día cambia.
  async redirects() {
    return [{ source: "/admin", destination: "/gestor", permanent: false }];
  },
};

export default nextConfig;
