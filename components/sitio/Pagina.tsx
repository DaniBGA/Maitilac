import { Suspense } from "react";
import { MarcaHidratado } from "./MarcaHidratado";

/**
 * Envoltorio de cada página: el contenido que lee datos va dentro de un Suspense
 * (lo exige Cache Components para las partes que se arman en cada pedido). El
 * fallback vacío no llega a verse: el HTML se envía completo en la misma respuesta.
 * La marca de hidratación va adentro para que se ponga cuando el contenido ya hidrató.
 */
export function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      {children}
      <MarcaHidratado />
    </Suspense>
  );
}
