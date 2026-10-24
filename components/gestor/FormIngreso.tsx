"use client";

import { useState } from "react";
import { authCliente } from "@/lib/auth-cliente";

/**
 * Pantalla de ingreso al gestor (nueva: el gestor viejo no tenía contraseña).
 * Usa los mismos colores y estilos que el gestor (.g-*).
 */
export function FormIngreso() {
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ingresar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setEnviando(true);
    setError("");
    const r = await authCliente.signIn.email({
      email: String(d.get("email") ?? "").trim(),
      password: String(d.get("clave") ?? ""),
    });
    setEnviando(false);
    if (r.error) {
      setError(
        r.error.status === 429
          ? "Demasiados intentos. Esperá un minuto y probá de nuevo."
          : "El email o la contraseña no son correctos.",
      );
      return;
    }
    // Navegación completa, no router.push: si se llegó acá con un enlace, el navegador
    // tiene guardado que /gestor (sin sesión) lleva al login, y volvía acá en blanco.
    window.location.replace("/gestor");
  };

  return (
    <main id="page-gestor" className="page">
      <div className="g-hdr">
        <div className="g-hdr-in">
          <h1 className="serif">Gestor del Catálogo</h1>
        </div>
      </div>
      <div className="g-wrap">
        <form className="g-bloque gi-caja" onSubmit={ingresar}>
          <div className="g-bloque-hdr">
            <h2 className="serif">Ingresar</h2>
          </div>
          <div className="g-campo">
            <label htmlFor="gi-email">Email</label>
            <input
              type="text"
              id="gi-email"
              name="email"
              autoComplete="username"
              inputMode="email"
              required
            />
          </div>
          <div className="g-campo">
            <label htmlFor="gi-clave">Contraseña</label>
            <input
              type="password"
              id="gi-clave"
              name="clave"
              autoComplete="current-password"
              required
              className="gi-clave"
            />
          </div>
          {error ? <div className="g-ayuda gi-error">{error}</div> : null}
          <button className="g-bt g-bt-verde gi-boton" type="submit" disabled={enviando}>
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
