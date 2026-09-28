import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Control rápido del gestor: sin cookie de sesión, al login antes de armar nada.
 * Es sólo una primera barrera: la verificación real de la sesión está en la
 * página (exigirSesionPagina) y en cada Server Action (requerirSesion).
 */
export function proxy(request: NextRequest) {
  // Sólo las visitas a la página. Las Server Actions (POST) siguen de largo: las
  // rechaza requerirSesion() con un mensaje que el gestor muestra.
  if (request.method === "GET" && !getSessionCookie(request)) return NextResponse.redirect(new URL("/gestor/ingresar", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/gestor"] };
