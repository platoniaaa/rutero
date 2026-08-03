import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Cola de verificación"
      hito={8}
      descripcion="Revisión de documentos con aprobación y rechazo con motivo."
    />
  );
}
