import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Grupos disponibles"
      hito={7}
      descripcion="Bandeja separada con los grupos de pasajeros que publican los transportistas."
    />
  );
}
