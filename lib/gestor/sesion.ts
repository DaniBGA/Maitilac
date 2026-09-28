import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Sesión actual del gestor, o null. */
export async function sesionActual() {
  return auth.api.getSession({ headers: await headers() });
}

/** Para páginas del gestor: sin sesión, al login. */
export async function exigirSesionPagina() {
  const sesion = await sesionActual();
  if (!sesion) redirect("/gestor/ingresar");
  return sesion;
}

/**
 * Para Server Actions: se llama en la PRIMERA línea de cada una. Las acciones son
 * endpoints públicos aunque no se vean en la interfaz: sin esto, cualquiera podría
 * llamarlas.
 */
export async function requerirSesion() {
  const sesion = await sesionActual();
  if (!sesion) throw new Error("Tenés que iniciar sesión para hacer cambios.");
  return sesion;
}
