"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { authCliente } from "@/lib/auth-cliente";
import type { DatosGestor, Resultado } from "@/lib/gestor/tipos";
import { BloqueAnuncios } from "./Anuncios";
import { Mas } from "./comun";
import { BloqueEquipo, BloquePremios } from "./Listas";
import { BloqueOcasiones } from "./Ocasiones";
import { PanelProducto } from "./PanelProducto";
import { BloqueProductos } from "./Productos";

/**
 * Gestor del catálogo: markup de referencia/index.html:1106-1279, con la misma
 * organización y estilos (.g-*). A diferencia del gestor viejo, cada cambio se
 * guarda en la base y se ve al instante en el sitio, desde cualquier dispositivo.
 */
export function Gestor({ inicial }: { inicial: DatosGestor }) {
  const router = useRouter();
  const [datos, setDatos] = useState(inicial);
  const [aviso, setAviso] = useState("");
  const [verAviso, setVerAviso] = useState(false);
  const [panel, setPanel] = useState<{ id: string | null } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    setVerAviso(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setVerAviso(false), 2800);
  }, []);

  const correr = useCallback(
    async (accion: Promise<Resultado>) => {
      let r: Resultado;
      try {
        r = await accion;
      } catch {
        r = { ok: false, error: "No se pudo guardar. Revisá la conexión y probá de nuevo." };
      }
      if (r.ok) {
        setDatos(r.datos);
        if (r.aviso) avisar(r.aviso);
      } else avisar(r.error);
      return r.ok;
    },
    [avisar],
  );

  // "Exportar": descarga la copia de seguridad (app/api/gestor/copia)
  const descargarCopia = () => {
    const a = document.createElement("a");
    a.href = "/api/gestor/copia";
    a.download = "";
    a.click();
    avisar("Catálogo exportado");
  };

  const salir = async () => {
    await authCliente.signOut();
    router.push("/gestor/ingresar");
  };

  return (
    <main id="page-gestor" className="page">
      <div className="g-hdr">
        <div className="g-hdr-in">
          <h1 className="serif">Gestor del Catálogo</h1>
          <div className="ges-1"></div>
          <button className="g-bt g-bt-naranja" id="g-nuevo" onClick={() => setPanel({ id: null })}>
            <Mas tam={16} />
            Nuevo producto
          </button>
          <button
            className="g-bt g-bt-verde"
            id="g-exportar"
            title="Descarga una copia de seguridad con todos los datos"
            onClick={descargarCopia}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <path d="M7 10l5 5 5-5"></path>
              <path d="M12 15V3"></path>
            </svg>
            Exportar
          </button>
          <Link className="g-bt g-bt-claro" href="/catalogo" data-go="catalogo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Ver el catálogo
          </Link>
          <button className="g-bt g-bt-claro" id="g-salir" onClick={salir}>
            Salir
          </button>
        </div>
      </div>

      <div className="g-wrap">
        <BloqueAnuncios anuncios={datos.anuncios} correr={correr} />
        <BloqueOcasiones ocasiones={datos.ocasiones} productos={datos.productos} correr={correr} />
        <BloquePremios premios={datos.premios} correr={correr} />
        <BloqueEquipo equipo={datos.equipo} correr={correr} />
        <BloqueProductos productos={datos.productos} correr={correr} alEditar={(id) => setPanel({ id })} />
      </div>

      {panel ? (
        <PanelProducto
          key={panel.id ?? "nuevo"}
          id={panel.id}
          productos={datos.productos}
          correr={correr}
          avisar={avisar}
          alCerrar={() => setPanel(null)}
        />
      ) : null}

      <div className={`g-aviso${verAviso ? " ver" : ""}`} id="g-aviso">
        {aviso}
      </div>
    </main>
  );
}
