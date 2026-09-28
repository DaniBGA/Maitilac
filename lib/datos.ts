/**
 * Acceso a los datos del sitio.
 * Etapa 2: salen de data/*.json (extraídos del sitio viejo con `pnpm datos:extraer`).
 * Etapa 3: estas mismas funciones pasan a leer de PostgreSQL, sin cambiar las páginas.
 */
import anuncios from "@/data/anuncios.json";
import colores from "@/data/colores.json";
import config from "@/data/config.json";
import equipo from "@/data/equipo.json";
import fotosHistoria from "@/data/fotos-historia.json";
import fotosHoy from "@/data/fotos-hoy.json";
import historia from "@/data/historia.json";
import insta from "@/data/insta.json";
import locales from "@/data/locales.json";
import ocasiones from "@/data/ocasiones.json";
import pasos from "@/data/pasos.json";
import premios from "@/data/premios.json";
import productos from "@/data/productos.json";
import type {
  Anuncios,
  Color,
  Config,
  FotoInsta,
  Hito,
  Local,
  Ocasion,
  Paso,
  Persona,
  Premio,
  Producto,
} from "./tipos";
import { slug } from "./util";

export const getConfig = (): Config => config;
export const getAnuncios = (): Anuncios => anuncios;
/** Color de un anuncio; si no existe, marrón (como `col()` del sitio viejo). */
export const getColor = (clave: string): Color => (colores as Record<string, Color>)[clave] ?? colores.marron;

export const getProductos = (): Producto[] => productos as Producto[];
export const getProductosVisibles = () => getProductos().filter((p) => p.activo !== false);
export const getProductosDestacados = () => getProductos().filter((p) => p.destacado && p.activo !== false);

export const getOcasiones = (): Ocasion[] => ocasiones;
export const getHistoria = (): Hito[] => historia;
export const getFotosHistoria = (): string[] => fotosHistoria;
export const getFotosHoy = (): string[] => fotosHoy;
export const getLocales = (): Local[] => locales;
export const getPasos = (): Paso[] => pasos;
export const getEquipoVisible = (): Persona[] => equipo.filter((p) => p.ver !== false);
export const getPremiosVisibles = (): Premio[] => premios.filter((p) => p.ver !== false);
export const getInsta = (): FotoInsta[] => insta;

/** Producto visible por su slug (URL /catalogo/<slug>). */
export const getProductoPorSlug = (s: string) => getProductosVisibles().find((p) => slug(p.nombre) === s);
