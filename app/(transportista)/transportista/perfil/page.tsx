import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Perfil y calificaciones"
      hito={2}
      descripcion="Datos de la cuenta, zonas de operación, verificación y calificaciones recibidas."
    />
  );
}
