import { rangoIds } from "@/lib/mock/rutas-estaticas";

import { VistaOfertaTransportista } from "./vista";

/** El sitio se sirve estático: solo existen los ids prerenderizados. */
export const dynamicParams = false;

export function generateStaticParams() {
  return rangoIds("of");
}

export default async function DetalleOfertaTransportistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VistaOfertaTransportista id={id} />;
}
