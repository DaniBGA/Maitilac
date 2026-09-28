import type { MetadataRoute } from "next";
import { absoluta } from "@/lib/sitio";

// El gestor y la API no se indexan (además, el gestor pide login).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/gestor", "/api/"] },
    sitemap: absoluta("/sitemap.xml"),
  };
}
