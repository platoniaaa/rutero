import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Viajes adjudicados"
      hito={5}
      descripcion="Detalle del viaje con chat, documentos del transportista, código de abordaje y lista de embarque."
    />
  );
}
