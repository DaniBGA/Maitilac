"use server";

/**
 * Acciones del gestor (Server Actions). Cada una:
 *  1. verifica la sesión (requerirSesion, siempre primero),
 *  2. guarda en la base,
 *  3. invalida la caché de lo que cambió (updateTag), así el sitio lo muestra al instante,
 *  4. devuelve los datos del gestor actualizados.
 * Los mensajes son los mismos que mostraba el gestor viejo.
 */
import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import extrasFabrica from "@/db/importar/data/extras.json";
import ocasionesFabrica from "@/db/importar/data/ocasiones.json";
import premiosFabrica from "@/db/importar/data/premios.json";
import productosFabrica from "@/db/importar/data/productos.json";
import * as s from "@/db/schema";
import { db } from "../db";
import {
  asegurarFotos,
  importarOcasiones,
  importarPremios,
  importarProductoDelMes,
  importarProductos,
  type ExtrasFabrica,
  type ProductoFabrica,
} from "../importacion";
import { leerPrecioEscrito } from "../precio";
import type { Anuncios, Config } from "../tipos";
import { slug } from "../util";
import { leerDatosGestor } from "./datos";
import { guardarFoto } from "./fotos";
import { requerirSesion } from "./sesion";
import type { GLocal, ProductoEditado, Resultado } from "./tipos";

class ErrorVisible extends Error {}

/** Envuelve cada acción: sesión, cambios, invalidación de caché y respuesta. */
async function accion(
  etiquetas: string[],
  cambios: () => Promise<string | void | { aviso: string; id: string }>,
): Promise<Resultado> {
  try {
    await requerirSesion();
    const r = await cambios();
    for (const e of etiquetas) updateTag(e);
    const aviso = typeof r === "object" ? r.aviso : r;
    const id = typeof r === "object" ? r.id : undefined;
    return { ok: true, datos: await leerDatosGestor(), aviso: aviso || undefined, id };
  } catch (e) {
    console.error("Gestor:", e);
    const error =
      e instanceof ErrorVisible || (e instanceof Error && e.message.startsWith("Tenés que iniciar sesión"))
        ? e.message
        : "No se pudo guardar. Probá de nuevo en un momento.";
    return { ok: false, error };
  }
}

/** Mueve una fila una posición (dir -1 sube, 1 baja) intercambiando el "orden" con su vecina. */
async function mover(
  tabla: typeof s.ocasiones | typeof s.premios | typeof s.equipo | typeof s.productos,
  id: string,
  dir: number,
  filtro?: ReturnType<typeof isNull>,
) {
  const filas = await db
    .select({ id: tabla.id, orden: tabla.orden })
    .from(tabla)
    .where(filtro)
    .orderBy(asc(tabla.orden));
  const i = filas.findIndex((f) => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= filas.length) return;
  await db.transaction(async (tx) => {
    // Se reasignan 0..n para que el orden quede siempre consecutivo
    const nuevo = filas.map((f) => f.id);
    [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
    for (const [k, fid] of nuevo.entries()) await tx.update(tabla).set({ orden: k }).where(eq(tabla.id, fid));
  });
}

const limpiar = (t: unknown) => String(t ?? "").trim();

// =====================================================================
// Anuncios de la portada
// =====================================================================

export async function guardarAnuncios(a: Anuncios): Promise<Resultado> {
  return accion(["anuncios"], async () => {
    for (const clave of ["barra", "badge1", "badge2"] as const) {
      const x = a[clave];
      const color = ["marron", "naranja", "verde"].includes(x.color) ? x.color : "marron";
      await db
        .insert(s.anuncios)
        .values({ clave, ver: !!x.ver, texto: limpiar(x.texto), color })
        .onConflictDoUpdate({
          target: s.anuncios.clave,
          set: { ver: !!x.ver, texto: limpiar(x.texto), color },
        });
    }
    return "Anuncios guardados. Ya se ven en el Inicio.";
  });
}

// =====================================================================
// Filtros por ocasión
// =====================================================================

export async function crearOcasion(label: string): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    const nombre = limpiar(label);
    if (!nombre) throw new ErrorVisible("Poné un nombre al filtro.");
    const existentes = await db.select({ label: s.ocasiones.label }).from(s.ocasiones);
    if (existentes.some((o) => o.label.toLowerCase() === nombre.toLowerCase()))
      throw new ErrorVisible("Ya existe un filtro con ese nombre.");
    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${s.ocasiones.orden}), -1)::int` })
      .from(s.ocasiones);
    await db
      .insert(s.ocasiones)
      .values({ clave: "f" + Date.now(), label: nombre, ver: true, orden: max + 1 });
    return "Filtro creado. Marcá abajo qué quesos tiene que mostrar.";
  });
}

export async function renombrarOcasion(id: string, label: string): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    const nombre = limpiar(label);
    if (!nombre) throw new ErrorVisible("Poné un nombre al filtro.");
    await db.update(s.ocasiones).set({ label: nombre }).where(eq(s.ocasiones.id, id));
    return "Filtro renombrado";
  });
}

export async function verOcasion(id: string, ver: boolean): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    await db.update(s.ocasiones).set({ ver }).where(eq(s.ocasiones.id, id));
    return ver ? "Filtro visible en el sitio" : "Filtro oculto del sitio";
  });
}

export async function marcarQuesoOcasion(
  id: string,
  productoId: string,
  marcado: boolean,
): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    if (marcado)
      await db.insert(s.ocasionProductos).values({ ocasionId: id, productoId }).onConflictDoNothing();
    else
      await db
        .delete(s.ocasionProductos)
        .where(and(eq(s.ocasionProductos.ocasionId, id), eq(s.ocasionProductos.productoId, productoId)));
  });
}

export async function borrarOcasion(id: string): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    await db.delete(s.ocasiones).where(eq(s.ocasiones.id, id));
    return "Filtro eliminado";
  });
}

export async function moverOcasion(id: string, dir: number): Promise<Resultado> {
  return accion(["ocasiones"], async () => {
    await mover(s.ocasiones, id, dir);
    return "Orden actualizado";
  });
}

// =====================================================================
// Premios y equipo (listas con foto, casilla "ver" y campos de texto)
// =====================================================================

const CAMPOS_PREMIO = ["anio", "titulo", "evento", "detalle"] as const;
const CAMPOS_PERSONA = ["nombre", "rol", "area"] as const;

export async function crearPremio(): Promise<Resultado> {
  return accion(["premios"], async () => {
    // El premio nuevo va primero (como en el gestor viejo)
    await db.update(s.premios).set({ orden: sql`${s.premios.orden} + 1` });
    await db.insert(s.premios).values({ evento: "Cata Quesos y Sabores de Tandil", ver: true, orden: 0 });
    return "Premio agregado. Completá los datos.";
  });
}

export async function actualizarPremio(id: string, campo: string, valor: string): Promise<Resultado> {
  return accion(["premios"], async () => {
    if (!(CAMPOS_PREMIO as readonly string[]).includes(campo)) throw new ErrorVisible("Campo desconocido.");
    await db
      .update(s.premios)
      .set({ [campo]: limpiar(valor) })
      .where(eq(s.premios.id, id));
    return "Premio actualizado";
  });
}

export async function verPremio(id: string, ver: boolean): Promise<Resultado> {
  return accion(["premios"], async () => {
    await db.update(s.premios).set({ ver }).where(eq(s.premios.id, id));
    return ver ? "Premio visible en el sitio" : "Premio oculto del sitio";
  });
}

export async function fotoPremio(id: string, formulario: FormData): Promise<Resultado> {
  return accion(["premios"], async () => {
    const archivo = await guardarFotoDelFormulario(formulario);
    const ids = await asegurarFotos(db, [archivo]);
    await db.update(s.premios).set({ fotoId: ids[archivo] }).where(eq(s.premios.id, id));
    return "Foto del premio actualizada";
  });
}

export async function borrarPremio(id: string): Promise<Resultado> {
  return accion(["premios"], async () => {
    await db.delete(s.premios).where(eq(s.premios.id, id));
    return "Premio eliminado";
  });
}

export async function moverPremio(id: string, dir: number): Promise<Resultado> {
  return accion(["premios"], async () => {
    await mover(s.premios, id, dir);
    return "Orden actualizado";
  });
}

/** Vuelve a los premios originales, con las fotos de los diplomas. */
export async function restaurarPremios(): Promise<Resultado> {
  return accion(["premios"], async () => {
    await db.transaction(async (tx) => {
      await tx.delete(s.premios);
      await importarPremios(tx, premiosFabrica);
    });
    return "Premios restaurados";
  });
}

export async function crearPersona(): Promise<Resultado> {
  return accion(["equipo"], async () => {
    // La persona nueva va al final (como en el gestor viejo)
    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${s.equipo.orden}), -1)::int` })
      .from(s.equipo);
    await db.insert(s.equipo).values({ ver: true, orden: max + 1 });
    return "Persona agregada. Completá los datos.";
  });
}

export async function actualizarPersona(id: string, campo: string, valor: string): Promise<Resultado> {
  return accion(["equipo"], async () => {
    if (!(CAMPOS_PERSONA as readonly string[]).includes(campo)) throw new ErrorVisible("Campo desconocido.");
    await db
      .update(s.equipo)
      .set({ [campo]: limpiar(valor) })
      .where(eq(s.equipo.id, id));
    return "Actualizado";
  });
}

export async function verPersona(id: string, ver: boolean): Promise<Resultado> {
  return accion(["equipo"], async () => {
    await db.update(s.equipo).set({ ver }).where(eq(s.equipo.id, id));
    return ver ? "Se muestra en el sitio" : "Oculto del sitio";
  });
}

export async function fotoPersona(id: string, formulario: FormData): Promise<Resultado> {
  return accion(["equipo"], async () => {
    const archivo = await guardarFotoDelFormulario(formulario);
    const ids = await asegurarFotos(db, [archivo]);
    await db.update(s.equipo).set({ fotoId: ids[archivo] }).where(eq(s.equipo.id, id));
    return "Foto actualizada";
  });
}

export async function borrarPersona(id: string): Promise<Resultado> {
  return accion(["equipo"], async () => {
    await db.delete(s.equipo).where(eq(s.equipo.id, id));
    return "Eliminado del equipo";
  });
}

export async function moverPersona(id: string, dir: number): Promise<Resultado> {
  return accion(["equipo"], async () => {
    await mover(s.equipo, id, dir);
    return "Orden actualizado";
  });
}

// =====================================================================
// Productos
// =====================================================================

const ETIQUETAS_PRODUCTOS = ["productos", "ocasiones", "producto-del-mes"];
const noEliminado = isNull(s.productos.eliminadoEn);

/**
 * Sube una foto para un producto. Queda registrada en el banco de fotos; se
 * asigna al producto recién al guardar el panel (como en el gestor viejo).
 */
export async function subirFotoProducto(
  formulario: FormData,
): Promise<{ ok: true; archivo: string } | { ok: false; error: string }> {
  try {
    await requerirSesion();
    const archivo = await guardarFotoDelFormulario(formulario);
    await asegurarFotos(db, [archivo]);
    return { ok: true, archivo };
  } catch (e) {
    console.error("Gestor:", e);
    return { ok: false, error: e instanceof ErrorVisible ? e.message : "No se pudo subir la foto." };
  }
}

export async function guardarProducto(id: string | null, p: ProductoEditado): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    const nombre = limpiar(p.nombre);
    if (!nombre) throw new ErrorVisible("Poné un nombre al producto");
    const repetido = await db
      .select({ id: s.productos.id })
      .from(s.productos)
      .where(
        and(
          noEliminado,
          sql`lower(${s.productos.nombre}) = lower(${nombre})`,
          id ? ne(s.productos.id, id) : undefined,
        ),
      );
    if (repetido.length) throw new ErrorVisible(`Ya hay un producto que se llama "${nombre}".`);
    let precio;
    try {
      precio = leerPrecioEscrito(p.precio);
    } catch (e) {
      throw new ErrorVisible((e as Error).message);
    }
    const porComa = (lista: string[]) => lista.map(limpiar).filter(Boolean);
    const valores = {
      nombre,
      slug: slug(nombre),
      tipo: limpiar(p.tipo),
      activo: !!p.activo,
      destacado: !!p.destacado,
      descripcion: limpiar(p.desc),
      precio: precio.valor,
      precioPrefijo: precio.prefijo,
      verPrecio: !!p.verPrecio,
      unidad: limpiar(p.unidad) || "kg",
      badge: limpiar(p.badge),
      maridajeComida: porComa(p.comida),
      maridajeBebida: porComa(p.bebida),
      presentaciones: p.presentaciones.filter((v) => ["Entero", "Trozado", "Feteado"].includes(v)),
      premiosTexto: limpiar(p.premios),
    };

    let renombrado = false;
    await db.transaction(async (tx) => {
      let productoId = id;
      if (id) {
        const [antes] = await tx
          .select({ nombre: s.productos.nombre })
          .from(s.productos)
          .where(eq(s.productos.id, id));
        renombrado = !!antes && antes.nombre !== nombre;
        await tx.update(s.productos).set(valores).where(eq(s.productos.id, id));
      } else {
        const [{ max }] = await tx
          .select({ max: sql<number>`coalesce(max(${s.productos.orden}), -1)::int` })
          .from(s.productos)
          .where(noEliminado);
        const [fila] = await tx
          .insert(s.productos)
          .values({ ...valores, orden: max + 1 })
          .returning({ id: s.productos.id });
        productoId = fila.id;
      }
      // Fotos, en el orden del panel
      const fotoId = await asegurarFotos(tx, p.photos);
      await tx.delete(s.productoFotos).where(eq(s.productoFotos.productoId, productoId!));
      for (const [k, archivo] of p.photos.entries())
        await tx
          .insert(s.productoFotos)
          .values({ productoId: productoId!, fotoId: fotoId[archivo], orden: k });
      // Quesos incluidos (por nombre en el panel, por id en la base)
      await tx.delete(s.comboQuesos).where(eq(s.comboQuesos.comboId, productoId!));
      const quesos = await tx
        .select({ id: s.productos.id, nombre: s.productos.nombre })
        .from(s.productos)
        .where(noEliminado);
      for (const [k, q] of p.quesos.entries()) {
        const queso = quesos.find((x) => x.nombre === q && x.id !== productoId);
        if (queso)
          await tx.insert(s.comboQuesos).values({ comboId: productoId!, quesoId: queso.id, orden: k });
      }
    });
    // Los filtros y combos se relacionan por id: al renombrar se actualizan solos.
    return renombrado ? "Guardado. Los filtros se actualizaron solos." : "Guardado. Ya se ve en el catálogo.";
  });
}

export async function alternarProducto(id: string): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    const [p] = await db
      .select({ activo: s.productos.activo })
      .from(s.productos)
      .where(eq(s.productos.id, id));
    if (!p) throw new ErrorVisible("El producto no existe.");
    await db.update(s.productos).set({ activo: !p.activo }).where(eq(s.productos.id, id));
    return !p.activo ? "Producto visible en el sitio" : "Producto oculto del sitio";
  });
}

/**
 * Elimina un producto (borrado lógico: queda en la base, marcado). Sale también
 * de los filtros y de los combos que lo incluían, como en el gestor viejo.
 */
export async function borrarProducto(id: string): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    await db.transaction(async (tx) => {
      const [p] = await tx.select({ slug: s.productos.slug }).from(s.productos).where(eq(s.productos.id, id));
      if (!p) throw new ErrorVisible("El producto no existe.");
      await tx
        .update(s.productos)
        // Libera el slug por si se vuelve a crear un producto con el mismo nombre
        .set({ eliminadoEn: new Date(), slug: `${p.slug}--eliminado-${id.slice(0, 8)}` })
        .where(eq(s.productos.id, id));
      await tx.delete(s.ocasionProductos).where(eq(s.ocasionProductos.productoId, id));
      await tx.delete(s.comboQuesos).where(eq(s.comboQuesos.quesoId, id));
      await tx.delete(s.comboQuesos).where(eq(s.comboQuesos.comboId, id));
    });
    return "Producto eliminado";
  });
}

export async function moverProducto(id: string, dir: number): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    await mover(s.productos, id, dir, noEliminado);
    return "Orden actualizado";
  });
}

/**
 * Vuelve a los productos y filtros originales (los del sitio viejo). Las fotos
 * subidas no se borran: quedan en el banco de fotos.
 */
export async function restaurarProductos(): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`TRUNCATE productos, producto_fotos, combo_quesos, ocasiones, ocasion_productos CASCADE`,
      );
      const productos = productosFabrica as ProductoFabrica[];
      const productoId = await importarProductos(tx, productos);
      await importarOcasiones(tx, ocasionesFabrica, productoId);
      await importarProductoDelMes(tx, productos, productoId, extrasFabrica as ExtrasFabrica);
    });
    return "Catálogo y filtros restaurados";
  });
}

// =====================================================================
// Contacto, locales y producto del mes (bloques nuevos: el gestor viejo no los tenía)
// =====================================================================

export async function guardarConfig(c: Config): Promise<Resultado> {
  return accion(["config"], async () => {
    const soloNumeros = (v: string) => limpiar(v).replace(/\D/g, "");
    const valores = {
      whatsapp: soloNumeros(c.whatsapp),
      whatsappMayorista: soloNumeros(c.whatsappMayorista),
      telefono: soloNumeros(c.telefono),
      email: limpiar(c.email),
      instagram: limpiar(c.instagram),
      facebook: limpiar(c.facebook),
    };
    if (!valores.whatsapp || !valores.whatsappMayorista)
      throw new ErrorVisible("Completá los dos números de WhatsApp.");
    if (!valores.email.includes("@")) throw new ErrorVisible("El email no parece válido.");
    await db.update(s.config).set(valores).where(eq(s.config.id, 1));
    return "Datos de contacto guardados. Ya se ven en el sitio.";
  });
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function guardarLocal(
  id: string,
  l: Omit<GLocal, "id" | "foto" | "fotoDetalle">,
): Promise<Resultado> {
  return accion(["locales"], async () => {
    const nombre = limpiar(l.nombre);
    if (!nombre) throw new ErrorVisible("Poné un nombre al local.");
    for (const h of [l.abre, l.cierra])
      if (!HORA.test(h)) throw new ErrorVisible("Revisá los horarios de apertura y cierre.");
    const domingo = !!(l.domAbre || l.domCierra);
    if (domingo && (!HORA.test(l.domAbre) || !HORA.test(l.domCierra)))
      throw new ErrorVisible("Revisá el horario del domingo (o dejalo vacío si cierra).");
    await db
      .update(s.locales)
      .set({
        nombre,
        direccion: limpiar(l.direccion),
        horarioSemana: limpiar(l.horarioSemana),
        horarioDomingo: limpiar(l.horarioDomingo),
        abre: l.abre,
        cierra: l.cierra,
        domAbre: domingo ? l.domAbre : null,
        domCierra: domingo ? l.domCierra : null,
        comoLlegar: limpiar(l.comoLlegar),
        mapaUrl: limpiar(l.mapaUrl),
      })
      .where(eq(s.locales.id, id));
    return "Local guardado. Ya se ve en el sitio.";
  });
}

export async function fotoLocal(
  id: string,
  cual: "resumen" | "detalle",
  formulario: FormData,
): Promise<Resultado> {
  return accion(["locales"], async () => {
    const archivo = await guardarFotoDelFormulario(formulario);
    const ids = await asegurarFotos(db, [archivo]);
    await db
      .update(s.locales)
      .set(cual === "resumen" ? { fotoId: ids[archivo] } : { fotoDetalleId: ids[archivo] })
      .where(eq(s.locales.id, id));
    return "Foto del local actualizada";
  });
}

export async function guardarProductoDelMes(productoId: string, texto: string): Promise<Resultado> {
  return accion(["producto-del-mes"], async () => {
    await db
      .insert(s.productoDelMes)
      .values({ id: 1, productoId: productoId || null, texto: limpiar(texto) })
      .onConflictDoUpdate({
        target: s.productoDelMes.id,
        set: { productoId: productoId || null, texto: limpiar(texto) },
      });
    return productoId
      ? "Producto del mes guardado. Ya se ve en el catálogo."
      : "El catálogo ya no muestra producto del mes.";
  });
}

export async function fotoProductoDelMes(formulario: FormData): Promise<Resultado> {
  return accion(["producto-del-mes"], async () => {
    const archivo = await guardarFotoDelFormulario(formulario);
    const ids = await asegurarFotos(db, [archivo]);
    await db
      .insert(s.productoDelMes)
      .values({ id: 1, fotoId: ids[archivo] })
      .onConflictDoUpdate({ target: s.productoDelMes.id, set: { fotoId: ids[archivo] } });
    return "Foto del producto del mes actualizada";
  });
}

// =====================================================================
// Banco de fotos (pendiente del registro §24)
// =====================================================================

/** Sube fotos sueltas al banco, sin asignarlas a ningún producto. */
export async function subirFotosBanco(formulario: FormData): Promise<Resultado> {
  return accion([], async () => {
    const archivos = formulario.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
    if (!archivos.length) throw new ErrorVisible("Elegí una foto.");
    const rutas: string[] = [];
    for (const f of archivos) {
      try {
        rutas.push(await guardarFoto(f));
      } catch (e) {
        throw new ErrorVisible((e as Error).message);
      }
    }
    await asegurarFotos(db, rutas);
    return rutas.length === 1 ? "Foto agregada al banco" : `${rutas.length} fotos agregadas al banco`;
  });
}

/**
 * Asigna una foto a un producto (va al final de sus fotos) y la saca de donde
 * estaba antes: no quedan duplicados. Sin producto, queda suelta (el archivo no se borra).
 */
export async function asignarFoto(fotoId: string, productoId: string | null): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    await db.transaction(async (tx) => {
      await tx.delete(s.productoFotos).where(eq(s.productoFotos.fotoId, fotoId));
      if (productoId) {
        const [{ max }] = await tx
          .select({ max: sql<number>`coalesce(max(${s.productoFotos.orden}), -1)::int` })
          .from(s.productoFotos)
          .where(eq(s.productoFotos.productoId, productoId));
        await tx.insert(s.productoFotos).values({ productoId, fotoId, orden: max + 1 });
      }
    });
    return productoId ? "Foto asignada" : "La foto quedó sin asignar";
  });
}

/** Crea un producto nuevo con esa foto (visible en el sitio) y devuelve su id para abrir el panel. */
export async function crearProductoConFoto(nombre: string, fotoId: string): Promise<Resultado> {
  return accion(ETIQUETAS_PRODUCTOS, async () => {
    const n = limpiar(nombre);
    if (!n) throw new ErrorVisible("Poné un nombre al producto");
    const repetido = await db
      .select({ id: s.productos.id })
      .from(s.productos)
      .where(and(noEliminado, sql`lower(${s.productos.nombre}) = lower(${n})`));
    if (repetido.length) throw new ErrorVisible(`Ya hay un producto que se llama "${n}".`);
    let id = "";
    await db.transaction(async (tx) => {
      const [{ max }] = await tx
        .select({ max: sql<number>`coalesce(max(${s.productos.orden}), -1)::int` })
        .from(s.productos)
        .where(noEliminado);
      const [fila] = await tx
        .insert(s.productos)
        .values({ nombre: n, slug: slug(n), unidad: "kg", verPrecio: false, activo: true, orden: max + 1 })
        .returning({ id: s.productos.id });
      id = fila.id;
      await tx.delete(s.productoFotos).where(eq(s.productoFotos.fotoId, fotoId));
      await tx.insert(s.productoFotos).values({ productoId: id, fotoId, orden: 0 });
    });
    return { aviso: "Producto creado. Completá los datos.", id };
  });
}

// =====================================================================

async function guardarFotoDelFormulario(formulario: FormData) {
  const archivo = formulario.get("foto");
  if (!(archivo instanceof File) || !archivo.size) throw new ErrorVisible("Elegí una foto.");
  try {
    return await guardarFoto(archivo);
  } catch (e) {
    throw new ErrorVisible((e as Error).message);
  }
}
