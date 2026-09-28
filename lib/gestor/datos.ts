import "server-only";
import { asc, eq, isNull } from "drizzle-orm";
import * as s from "@/db/schema";
import { db } from "../db";
import { precioTexto } from "../precio";
import type { DatosGestor } from "./tipos";

/**
 * Todo lo que muestra el gestor, SIN caché: quien edita tiene que ver siempre
 * lo último. Incluye lo oculto (activo/ver en false); no incluye lo eliminado.
 */
export async function leerDatosGestor(): Promise<DatosGestor> {
  const [anuncios, ocasiones, relOcasiones, premios, equipo, productos, fotosProd, quesos] =
    await Promise.all([
      db.select().from(s.anuncios),
      db.select().from(s.ocasiones).orderBy(asc(s.ocasiones.orden)),
      db
        .select({ ocasionId: s.ocasionProductos.ocasionId, nombre: s.productos.nombre })
        .from(s.ocasionProductos)
        .innerJoin(s.productos, eq(s.productos.id, s.ocasionProductos.productoId)),
      db
        .select({
          id: s.premios.id,
          anio: s.premios.anio,
          titulo: s.premios.titulo,
          evento: s.premios.evento,
          detalle: s.premios.detalle,
          foto: s.fotos.archivo,
          ver: s.premios.ver,
        })
        .from(s.premios)
        .leftJoin(s.fotos, eq(s.fotos.id, s.premios.fotoId))
        .orderBy(asc(s.premios.orden)),
      db
        .select({
          id: s.equipo.id,
          nombre: s.equipo.nombre,
          rol: s.equipo.rol,
          area: s.equipo.area,
          foto: s.fotos.archivo,
          ver: s.equipo.ver,
        })
        .from(s.equipo)
        .leftJoin(s.fotos, eq(s.fotos.id, s.equipo.fotoId))
        .orderBy(asc(s.equipo.orden)),
      db.select().from(s.productos).where(isNull(s.productos.eliminadoEn)).orderBy(asc(s.productos.orden)),
      db
        .select({ productoId: s.productoFotos.productoId, archivo: s.fotos.archivo })
        .from(s.productoFotos)
        .innerJoin(s.fotos, eq(s.fotos.id, s.productoFotos.fotoId))
        .orderBy(asc(s.productoFotos.orden)),
      db
        .select({ comboId: s.comboQuesos.comboId, nombre: s.productos.nombre })
        .from(s.comboQuesos)
        .innerJoin(s.productos, eq(s.productos.id, s.comboQuesos.quesoId))
        .orderBy(asc(s.comboQuesos.orden)),
    ]);

  const anuncio = (clave: string) => {
    const a = anuncios.find((x) => x.clave === clave);
    return a ? { ver: a.ver, texto: a.texto, color: a.color } : { ver: false, texto: "", color: "marron" };
  };

  return {
    anuncios: { barra: anuncio("barra"), badge1: anuncio("badge1"), badge2: anuncio("badge2") },
    ocasiones: ocasiones.map((o) => ({
      id: o.id,
      clave: o.clave,
      label: o.label,
      ver: o.ver,
      match: relOcasiones.filter((r) => r.ocasionId === o.id).map((r) => r.nombre),
    })),
    premios: premios.map((p) => ({ ...p, foto: p.foto ?? "" })),
    equipo: equipo.map((m) => ({ ...m, foto: m.foto ?? "" })),
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      activo: p.activo,
      destacado: p.destacado,
      desc: p.descripcion,
      precio: precioTexto(p.precio, p.precioPrefijo),
      verPrecio: p.verPrecio,
      unidad: p.unidad,
      badge: p.badge,
      photos: fotosProd.filter((f) => f.productoId === p.id).map((f) => f.archivo),
      comida: p.maridajeComida,
      bebida: p.maridajeBebida,
      presentaciones: p.presentaciones,
      quesos: quesos.filter((q) => q.comboId === p.id).map((q) => q.nombre),
      premios: p.premiosTexto,
    })),
  };
}
