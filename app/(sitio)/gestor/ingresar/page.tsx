import { redirect } from "next/navigation";
import { FormIngreso } from "@/components/gestor/FormIngreso";
import { sesionActual } from "@/lib/gestor/sesion";
import { Pagina } from "@/components/sitio/Pagina";

export const metadata = { title: "Ingresar — Gestor del Catálogo", robots: { index: false, follow: false } };

async function IngresarContenido() {
  if (await sesionActual()) redirect("/gestor");
  return <FormIngreso />;
}

export default function Ingresar() {
  return (
    <Pagina>
      <IngresarContenido />
    </Pagina>
  );
}
