import { FooterOscuro } from "@/components/sitio/FooterOscuro";
import { getOcasiones, getProductosVisibles } from "@/lib/datos";
import { AbrirProducto } from "../AbrirProducto";
import { Catalogo } from "./Catalogo";

// Página del Catálogo: markup de referencia/index.html:804-847, convertido con
// scripts/html_a_jsx.py (estilos en styles/en-linea/catalogo.css). La usan /catalogo
// y /catalogo/[slug] (esta última con el modal abierto encima).
export function PaginaCatalogo() {
  return (
    <main id="page-catalogo" className="page">
      <section className="sec-pad cat-1">
        <h1 className="serif cat-2">Nuestro Catálogo</h1>
        <p className="cat-3">Descubrí la variedad de sabores y texturas que logramos para vos.</p>
      </section>
      {/* Producto del mes: por ahora fijo, igual que en el sitio viejo. En la Etapa 3
          pasa a salir del producto marcado como "producto del mes". */}
      <section className="sec-pad cat-4">
        <div className="split cat-5">
          <div className="cat-6">
            <img className="cat-7" src="/img/holanda-1.jpg" alt="Holanda" />
          </div>
          <div>
            <span className="cat-8">Producto del Mes</span>
            <h2 className="serif cat-9">Holanda</h2>
            <p className="cat-10">Queso picante. Pasta semidura con ojos.</p>
            <div className="cat-11">
              <span className="cat-12">$4800</span>
              <span className="cat-13">/ kg</span>
            </div>
            <AbrirProducto slug="holanda" className="btn-out btn-pill cat-14">
              Ver detalles
            </AbrirProducto>
          </div>
        </div>
      </section>
      <Catalogo productos={getProductosVisibles()} ocasiones={getOcasiones()} />
      <FooterOscuro />
    </main>
  );
}
