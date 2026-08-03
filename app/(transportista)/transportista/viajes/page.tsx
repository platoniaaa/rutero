import { PantallaPendiente } from "@/components/shared/pantalla-pendiente";

export default function Page() {
  return (
    <PantallaPendiente
      titulo="Viajes adjudicados"
      hito={5}
      descripcion="Hoja de ruta con lista de embarque imprimible, chat y marcado de en curso y finalizado."
    />
  );
}
