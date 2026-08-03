"use client";

import { useState } from "react";

import { useHidratado, useRutero } from "@/lib/mock/store";
import type { Datos } from "@/lib/mock/types";

/**
 * Acceso a los datos de la demo. `cargando` es `true` hasta que el store lee
 * `localStorage`: las pantallas muestran su estado de carga mientras tanto en
 * vez de pintar el seed del servidor y reemplazarlo después.
 */
export function useDatos(): { datos: Datos; cargando: boolean } {
  const datos = useRutero((s) => s.datos);
  const hidratado = useHidratado();
  return { datos, cargando: !hidratado };
}

/** Las cuentas que se encarnan en la demo. */
export function useSesion() {
  return useRutero((s) => s.sesion);
}

/**
 * Una sola marca de tiempo por montaje. Evita que dos comparaciones dentro del
 * mismo render usen relojes distintos y que el servidor y el cliente difieran.
 */
export function useAhora(): Date {
  const [ahora] = useState(() => new Date());
  return ahora;
}
