import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Panel de la agencia"
      hito={3}
      descripcion="Viajes próximos, ofertas abiertas, respuestas sin revisar y pagos pendientes."
    />
  );
}
