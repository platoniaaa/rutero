import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Cuentas"
      hito={8}
      descripcion="Listado de agencias y transportistas con su estado de verificación."
    />
  );
}
