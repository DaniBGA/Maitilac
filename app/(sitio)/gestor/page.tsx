import { Gestor } from "@/components/gestor/Gestor";
import { leerDatosGestor } from "@/lib/gestor/datos";
import { exigirSesionPagina } from "@/lib/gestor/sesion";
import { Pagina } from "@/components/sitio/Pagina";

export const metadata = { robots: { index: false, follow: false } };

// Gestor del catálogo. Sin sesión, redirige al login.
async function PaginaGestorContenido() {
  await exigirSesionPagina();
  return <Gestor inicial={await leerDatosGestor()} />;
}

export default function PaginaGestor() {
  return (
    <Pagina>
      <PaginaGestorContenido />
    </Pagina>
  );
}
