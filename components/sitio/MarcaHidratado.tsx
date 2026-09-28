"use client";

import { useEffect } from "react";

/**
 * Marca <html data-hidratado="si"> cuando React terminó de hidratar la página.
 * No se ve ni cambia nada: la usan los tests visuales para no capturar antes de
 * que corran los efectos (carruseles, "Abierto ahora").
 */
export function MarcaHidratado() {
  useEffect(() => {
    document.documentElement.dataset.hidratado = "si";
  }, []);
  return null;
}
