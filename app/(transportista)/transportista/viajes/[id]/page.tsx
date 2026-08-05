import { rangoIds } from "@/lib/mock/rutas-estaticas";

import { VistaViajeTransportista } from "./vista";

/** El sitio se sirve estático: solo existen los ids prerenderizados. */
export const dynamicParams = false;

export function generateStaticParams() {
  return rangoIds("vi");
}

export default async function DetalleViajeTransportistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VistaViajeTransportista id={id} />;
}
