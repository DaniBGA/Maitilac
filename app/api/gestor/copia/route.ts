import * as s from "@/db/schema";
import { db } from "@/lib/db";
import { sesionActual } from "@/lib/gestor/sesion";

/**
 * Botón "Exportar" del gestor: descarga una copia de seguridad con TODOS los datos
 * (a diferencia del export viejo, incluye el equipo). No incluye usuarios ni sesiones.
 */
export async function GET() {
  if (!(await sesionActual())) return new Response("Tenés que iniciar sesión.", { status: 401 });
  const tablas = {
    fotos: s.fotos,
    productos: s.productos,
    producto_fotos: s.productoFotos,
    combo_quesos: s.comboQuesos,
    ocasiones: s.ocasiones,
    ocasion_productos: s.ocasionProductos,
    anuncios: s.anuncios,
    premios: s.premios,
    equipo: s.equipo,
    locales: s.locales,
    config: s.config,
    producto_del_mes: s.productoDelMes,
  };
  const copia: Record<string, unknown> = { sitio: "Maitilac", fecha: new Date().toISOString(), version: 1 };
  for (const [nombre, tabla] of Object.entries(tablas)) copia[nombre] = await db.select().from(tabla);
  const dia = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(copia, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="maitilac-copia-${dia}.json"`,
    },
  });
}
