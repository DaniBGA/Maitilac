/**
 * Productos que muestra un filtro "Buscá por ocasión": los marcados en el filtro
 * que están en la lista dada (pintarFiltros() de referencia/index.html:2116).
 * El catálogo le pasa los productos visibles; el gestor, los que están "en el sitio".
 */
export const productosDeOcasion = <P extends { nombre: string }>(o: { match: string[] }, productos: P[]) =>
  productos.filter((p) => o.match.includes(p.nombre));
