import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Feed de ofertas"
      hito={3}
      descripcion="Ofertas filtrables por fecha, zona, pasajeros, monto mínimo y bloque de servicio."
    />
  );
}
