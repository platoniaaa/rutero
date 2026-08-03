import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Panel del transportista"
      hito={3}
      descripcion="Agenda de la semana, ofertas que calzan, postulaciones activas y próximo pago."
    />
  );
}
