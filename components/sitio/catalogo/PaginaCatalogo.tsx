import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { getOcasiones, getProductoDelMes, getProductosVisibles } from "@/lib/datos";
import { AbrirProducto } from "../AbrirProducto";
import { Catalogo } from "./Catalogo";
import { connection } from "next/server";
import { Foto } from "../Foto";

// Página del Catálogo: markup de referencia/index.html:804-847, convertido con
// scripts/html_a_jsx.py (estilos en styles/en-linea/catalogo.css). La usan /catalogo
// y /catalogo/[slug] (esta última con el modal abierto encima).
export async function PaginaCatalogo() {
  // Se arma en cada pedido con datos en caché: la base no hace falta al compilar (ver app/(sitio)/layout.tsx).
  await connection();
  const [pm, productos, ocasiones] = await Promise.all([
    getProductoDelMes(),
    getProductosVisibles(),
    getOcasiones(),
  ]);
  return (
    <main id="page-catalogo" className="page">
      <section className="sec-pad cat-1">
        <h1 className="serif cat-2">Nuestro Catálogo</h1>
        <p className="cat-3">Descubrí la variedad de sabores y texturas que logramos para vos.</p>
      </section>
      {/* Producto del mes: texto y foto propios; nombre, precio y unidad del producto. */}
      {pm ? (
        <section className="sec-pad cat-4">
          <div className="split cat-5">
            <div className="cat-6">
              <Foto
                className="cat-7"
                src={pm.foto}
                sizes="(max-width:720px) 67vw, (max-width:1024px) 85vw, 480px"
                alt={pm.nombre}
              />
            </div>
            <div>
              <span className="cat-8">Producto del Mes</span>
              <h2 className="serif cat-9">{pm.nombre}</h2>
              <p className="cat-10">{pm.texto}</p>
              <div className="cat-11">
                <span className="cat-12">{pm.verPrecio ? pm.precio : "Consultar"}</span>
                {pm.verPrecio ? <span className="cat-13">/ {pm.unidad}</span> : null}
              </div>
              <AbrirProducto slug={pm.slug} className="btn-out btn-pill cat-14">
                Ver detalles
              </AbrirProducto>
            </div>
          </div>
        </section>
      ) : null}
      <Catalogo productos={productos} ocasiones={ocasiones} />
      <FooterOscuro />
    </main>
  );
}
