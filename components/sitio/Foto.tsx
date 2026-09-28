import { getImageProps } from "next/image";
import type { ComponentProps } from "react";
import { ruta } from "@/lib/util";

type Props = Omit<ComponentProps<"img">, "src" | "srcSet" | "sizes" | "alt"> & {
  src: string;
  alt: string;
  /** Ancho con que se ve la foto en cada pantalla, para que el navegador elija la versión justa. */
  sizes: string;
};

/**
 * El mismo <img> del sitio viejo (clase, alt, loading), pero servido por el optimizador
 * de Next: AVIF o WebP del ancho que hace falta, en lugar del JPG original.
 *
 * Sólo para imágenes con al menos una medida fijada por CSS (el ancho, el alto o los
 * dos): la versión elegida puede ser más chica que el original pero tiene la misma
 * proporción, así que ocupa la misma caja. Una imagen sin ninguna medida en el CSS
 * tomaría el tamaño del archivo y se vería de otro tamaño.
 *
 * Con una sola medida fija, la otra puede variar una fracción de píxel (la versión
 * reducida redondea su tamaño): controlarlo con los tests visuales. Por eso el logo
 * del Cluster, en Nosotros, sigue como <img> común.
 */
export function Foto({ src, sizes, alt, ...resto }: Props) {
  // Sin foto, sin src: React no admite src="" (igual que antes).
  if (!src) return <img alt={alt} {...resto} />;
  // width y height sólo los pide getImageProps; no pasan al <img> (el tamaño lo pone el CSS).
  // loading: el mismo del <img> (sin él, Next la registra como lazy y avisa en desarrollo).
  const { props } = getImageProps({
    src: ruta(src),
    alt: "",
    width: 1600,
    height: 1600,
    sizes,
    loading: resto.loading ?? "eager",
  });
  return <img alt={alt} {...resto} src={props.src} srcSet={props.srcSet} sizes={props.sizes} />;
}
