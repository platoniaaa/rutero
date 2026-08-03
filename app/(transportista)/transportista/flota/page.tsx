import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Flota y agenda"
      hito={2}
      descripcion="Vehículos, conductores, documentos con vencimientos y calendario de bloqueos."
    />
  );
}
