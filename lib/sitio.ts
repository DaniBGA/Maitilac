/**
 * Dirección pública del sitio, para las URLs absolutas (Open Graph, sitemap, robots,
 * datos estructurados). Se lee al compilar y al ejecutar: en el VPS tiene que estar en los dos.
 */
export const URL_SITIO = (process.env.SITIO_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluta = (ruta: string) => URL_SITIO + (ruta.startsWith("/") ? ruta : "/" + ruta);

/**
 * Open Graph común. En Next, el openGraph de una página reemplaza entero al del
 * layout, así que cada página lo arma con esta base.
 */
export const OG_BASE = {
  siteName: "Maitilac",
  locale: "es_AR",
  type: "website" as const,
  images: [{ url: "/fondo-hero.jpg", alt: "Quesos artesanales Maitilac sobre tabla de madera" }],
};
