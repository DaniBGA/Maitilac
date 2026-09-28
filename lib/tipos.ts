// Tipos de los datos del sitio (misma forma que las constantes del sitio viejo, ver data/*.json).

export type ColorAnuncio = "marron" | "naranja" | "verde";
export type Anuncio = { ver: boolean; texto: string; color: ColorAnuncio | string };
export type Anuncios = { barra: Anuncio; badge1: Anuncio; badge2: Anuncio };
export type Color = { nombre: string; fondo: string; texto: string };

export type Producto = {
  nombre: string;
  destacado?: boolean;
  tipo: string;
  activo: boolean;
  desc: string;
  precio: string;
  unidad: string;
  verPrecio?: boolean;
  badge: string;
  photos: string[];
  comida: string[];
  bebida: string[];
  presentaciones: string[];
  quesos: string[];
  premios: string;
};

export type Ocasion = { key: string; label: string; ver: boolean; match: string[] };

export type Hito = { anio: string; titulo: string; resumen: string; textos: string[] };

export type Local = {
  nombre: string;
  direccion: string;
  semana: string;
  domingo: string;
  foto: string;
  abre: string;
  cierra: string;
  domAbre: string | null;
  domCierra: string | null;
};

export type Paso = { titulo: string; desc: string };
export type Persona = { nombre: string; rol: string; area: string; foto: string; ver: boolean };
export type Premio = { anio: string; titulo: string; evento: string; detalle: string; foto: string; ver: boolean };
export type FotoInsta = { foto: string; alt: string };
export type Config = {
  whatsapp: string;
  whatsappMayorista: string;
  telefono: string;
  email: string;
  instagram: string;
};
