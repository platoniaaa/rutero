import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Mis ofertas"
      hito={3}
      descripcion="Lista de ofertas publicadas con filtros por estado, y el wizard para crear una nueva."
    />
  );
}
