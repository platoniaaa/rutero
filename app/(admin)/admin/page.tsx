import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Métricas"
      hito={8}
      descripcion="Ofertas publicadas, tasa de adjudicación, tiempo hasta primera respuesta, GMV y comisión generada."
    />
  );
}
