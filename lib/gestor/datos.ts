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
  // Todas las consultas en una sola tanda (antes eran tres, una detrás de otra).
  const [
    anuncios,
    ocasiones,
    relOcasiones,
    premios,
    equipo,
    productos,
    fotosProd,
    quesos,
    config,
    locales,
    pdm,
    fotos,
  ] = await Promise.all([
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
        fotoId: s.premios.fotoId,
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
        fotoId: s.equipo.fotoId,
      })
      .from(s.equipo)
      .leftJoin(s.fotos, eq(s.fotos.id, s.equipo.fotoId))
      .orderBy(asc(s.equipo.orden)),
    db.select().from(s.productos).where(isNull(s.productos.eliminadoEn)).orderBy(asc(s.productos.orden)),
    db
      .select({
        productoId: s.productoFotos.productoId,
        fotoId: s.productoFotos.fotoId,
        archivo: s.fotos.archivo,
      })
      .from(s.productoFotos)
      .innerJoin(s.fotos, eq(s.fotos.id, s.productoFotos.fotoId))
      .orderBy(asc(s.productoFotos.orden)),
    db
      .select({ comboId: s.comboQuesos.comboId, nombre: s.productos.nombre })
      .from(s.comboQuesos)
      .innerJoin(s.productos, eq(s.productos.id, s.comboQuesos.quesoId))
      .orderBy(asc(s.comboQuesos.orden)),
    db.select().from(s.config).limit(1),
    db.select().from(s.locales).orderBy(asc(s.locales.orden)),
    db.select().from(s.productoDelMes).limit(1),
    db.select({ id: s.fotos.id, archivo: s.fotos.archivo }).from(s.fotos).orderBy(asc(s.fotos.archivo)),
  ]);

  // Índices para no recorrer las listas una y otra vez (el banco de fotos puede crecer).
  const agrupar = <T, V>(filas: T[], clave: (f: T) => string, valor: (f: T) => V) => {
    const m = new Map<string, V[]>();
    for (const f of filas) {
      const k = clave(f);
      const lista = m.get(k);
      if (lista) lista.push(valor(f));
      else m.set(k, [valor(f)]);
    }
    return (k: string) => m.get(k) ?? [];
  };
  const archivoDe = new Map(fotos.map((f) => [f.id, f.archivo]));
  const archivo = (id: string | null) => (id && archivoDe.get(id)) || "";
  const nombreProducto = new Map(productos.map((p) => [p.id, p.nombre]));
  const fotosDe = agrupar(
    fotosProd,
    (f) => f.productoId,
    (f) => f.archivo,
  );
  const quesosDe = agrupar(
    quesos,
    (q) => q.comboId,
    (q) => q.nombre,
  );
  const matchDe = agrupar(
    relOcasiones,
    (r) => r.ocasionId,
    (r) => r.nombre,
  );
  const productosConFoto = agrupar(
    fotosProd.filter((r) => nombreProducto.has(r.productoId)),
    (r) => r.fotoId,
    (r) => nombreProducto.get(r.productoId)!,
  );
  const enPremios = new Set(premios.map((p) => p.fotoId));
  const enEquipo = new Set(equipo.map((m) => m.fotoId));
  const enLocales = new Set(locales.flatMap((l) => [l.fotoId, l.fotoDetalleId]));
  // fotoId sólo sirve para lo de arriba: al gestor le llega el archivo.
  const sinFotoId = <T extends { fotoId: string | null; foto: string | null }>({ fotoId, ...resto }: T) => {
    void fotoId;
    return { ...resto, foto: resto.foto ?? "" };
  };

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
      match: matchDe(o.id),
    })),
    premios: premios.map(sinFotoId),
    equipo: equipo.map(sinFotoId),
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
      photos: fotosDe(p.id),
      comida: p.maridajeComida,
      bebida: p.maridajeBebida,
      presentaciones: p.presentaciones,
      quesos: quesosDe(p.id),
      premios: p.premiosTexto,
    })),
    config: config[0],
    locales: locales.map((l) => ({
      id: l.id,
      nombre: l.nombre,
      direccion: l.direccion,
      horarioSemana: l.horarioSemana,
      horarioDomingo: l.horarioDomingo,
      abre: l.abre,
      cierra: l.cierra,
      domAbre: l.domAbre ?? "",
      domCierra: l.domCierra ?? "",
      foto: archivo(l.fotoId),
      fotoDetalle: archivo(l.fotoDetalleId),
      comoLlegar: l.comoLlegar,
      mapaUrl: l.mapaUrl,
    })),
    productoDelMes: {
      productoId: pdm[0]?.productoId ?? "",
      texto: pdm[0]?.texto ?? "",
      foto: archivo(pdm[0]?.fotoId ?? null),
    },
    fotos: fotos.map((f) => ({
      id: f.id,
      archivo: f.archivo,
      productos: productosConFoto(f.id),
      otros: [
        enPremios.has(f.id) ? "Premios" : "",
        enEquipo.has(f.id) ? "Equipo" : "",
        enLocales.has(f.id) ? "Locales" : "",
        pdm[0]?.fotoId === f.id ? "Producto del mes" : "",
      ].filter(Boolean),
    })),
  };
}
