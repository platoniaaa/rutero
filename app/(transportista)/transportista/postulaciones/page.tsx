import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Mis postulaciones"
      hito={4}
      descripcion="Aceptaciones y contraofertas enviadas, con su estado."
    />
  );
}
