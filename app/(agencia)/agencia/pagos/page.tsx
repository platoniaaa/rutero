import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Pagos e historial"
      hito={6}
      descripcion="Pagos retenidos en escrow, liberados y el historial completo con su desglose."
    />
  );
}
