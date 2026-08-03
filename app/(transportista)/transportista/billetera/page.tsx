import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Billetera"
      hito={6}
      descripcion="Montos retenidos, liberados e historial de liquidaciones."
    />
  );
}
