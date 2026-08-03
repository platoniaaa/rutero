import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Publicar grupo"
      hito={7}
      descripcion="Publicación de un grupo de pasajeros con ticket estimado y comisión solicitada."
    />
  );
}
