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
 * Sólo para fotos con el tamaño fijado por CSS (ancho y alto, o proporción, con
 * object-fit). Una imagen que toma su tamaño del archivo (logos, ilustraciones) se
 * vería de otro tamaño, porque la versión elegida puede ser más chica que el original.
 */
export function Foto({ src, sizes, alt, ...resto }: Props) {
  // Sin foto, sin src: React no admite src="" (igual que antes).
  if (!src) return <img alt={alt} {...resto} />;
  // width y height sólo los pide getImageProps; no pasan al <img> (el tamaño lo pone el CSS).
  const { props } = getImageProps({ src: ruta(src), alt: "", width: 1600, height: 1600, sizes });
  return <img alt={alt} {...resto} src={props.src} srcSet={props.srcSet} sizes={props.sizes} />;
}
