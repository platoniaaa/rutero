import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Calificaciones"
      hito={6}
      descripcion="Calificación bidireccional ciega, que se revela cuando ambos califican o a los 7 días."
    />
  );
}
