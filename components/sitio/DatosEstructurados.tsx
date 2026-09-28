import type { Local, Producto } from "@/lib/tipos";
import { leerPrecioEscrito } from "@/lib/precio";
import { absoluta } from "@/lib/sitio";
import { ruta, slug } from "@/lib/util";

/**
 * Datos estructurados (JSON-LD) para los buscadores: no se ven en la página.
 * Sólo con datos que ya están en el sitio; lo que no hay, no se pone.
 */
function JsonLd({ datos }: { datos: object }) {
  // "<" escapado para que un texto no pueda cerrar el <script>.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}

export function DatosProducto({ p }: { p: Producto }) {
  const url = absoluta(`/catalogo/${slug(p.nombre)}`);
  // Sólo un precio exacto y visible: "Desde $8500" o "Consultar" no son un precio.
  let precio: string | null = null;
  if (p.verPrecio !== false) {
    try {
      const { prefijo, valor } = leerPrecioEscrito(p.precio);
      if (!prefijo && valor) precio = valor;
    } catch {}
  }
  return (
    <JsonLd
      datos={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.nombre,
        ...(p.desc ? { description: p.desc } : {}),
        ...(p.photos.length ? { image: p.photos.map((f) => absoluta(ruta(f))) } : {}),
        brand: { "@type": "Brand", name: "Maitilac" },
        url,
        ...(precio
          ? {
              offers: {
                "@type": "Offer",
                price: precio,
                priceCurrency: "ARS",
                url,
                ...(p.unidad
                  ? {
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: precio,
                        priceCurrency: "ARS",
                        unitText: p.unidad,
                      },
                    }
                  : {}),
              },
            }
          : {}),
      }}
    />
  );
}

const DIAS_SEMANA = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function DatosLocales({ locales, telefono }: { locales: Local[]; telefono: string }) {
  return (
    <JsonLd
      datos={{
        "@context": "https://schema.org",
        "@graph": locales.map((l) => {
          // "Maipú 1135, Tandil" → calle y ciudad
          const [calle, ...resto] = l.direccion.split(",");
          const ciudad = resto.join(",").trim();
          return {
            "@type": "LocalBusiness",
            name: `Maitilac — ${l.nombre}`,
            url: absoluta("/locales"),
            ...(l.fotoDetalle || l.foto ? { image: absoluta(ruta(l.fotoDetalle || l.foto)) } : {}),
            ...(telefono ? { telephone: `+54${telefono}` } : {}),
            address: {
              "@type": "PostalAddress",
              streetAddress: calle.trim(),
              ...(ciudad ? { addressLocality: ciudad } : {}),
              addressCountry: "AR",
            },
            ...(l.mapaUrl ? { hasMap: l.mapaUrl } : {}),
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: DIAS_SEMANA,
                opens: l.abre,
                closes: l.cierra,
              },
              ...(l.domAbre && l.domCierra
                ? [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: "Sunday",
                      opens: l.domAbre,
                      closes: l.domCierra,
                    },
                  ]
                : []),
            ],
          };
        }),
      }}
    />
  );
}
