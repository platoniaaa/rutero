import { rangoIds } from "@/lib/mock/rutas-estaticas";

import { VistaViajeAgencia } from "./vista";

/** El sitio se sirve estático: solo existen los ids prerenderizados. */
export const dynamicParams = false;

export function generateStaticParams() {
  return rangoIds("vi");
}

export default async function DetalleViajeAgenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VistaViajeAgencia id={id} />;
}
