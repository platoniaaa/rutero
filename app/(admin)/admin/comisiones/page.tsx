import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Configuración de comisiones"
      hito={8}
      descripcion="Comisión de viaje y de referido, hoy en 5% para ambos flujos."
    />
  );
}
