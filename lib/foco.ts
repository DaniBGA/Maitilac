import { useEffect } from "react";

/**
 * Ventanas encima de la página (modal de producto, panel del gestor): con Tab el
 * foco da la vuelta adentro en lugar de irse a la página de atrás. Llamarla desde
 * el keydown de la ventana.
 */
export function atraparTab(e: KeyboardEvent, contenedor: HTMLElement | null) {
  if (e.key !== "Tab" || !contenedor) return;
  const enfocables = [
    ...contenedor.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])",
    ),
  ].filter((el) => el.offsetParent !== null);
  if (!enfocables.length) return;
  const primero = enfocables[0];
  const ultimo = enfocables[enfocables.length - 1];
  const activo = document.activeElement;
  if (e.shiftKey && (activo === primero || activo === contenedor || !contenedor.contains(activo))) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && (activo === ultimo || !contenedor.contains(activo))) {
    e.preventDefault();
    primero.focus();
  }
}

/** Al cerrarse la ventana, el foco vuelve adonde estaba antes de abrirla. */
export function useDevolverFoco() {
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    return () => {
      if (previo?.isConnected) previo.focus({ preventScroll: true });
    };
  }, []);
}
