import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Perfil de la agencia"
      hito={2}
      descripcion="Datos de empresa, contacto y estado de verificación."
    />
  );
}
