import type { Datos, Sesion } from "@/lib/mock/types";
import { COMISION_REFERIDO_PCT, COMISION_VIAJE_PCT } from "@/lib/utils/rules";

import { AGENCIAS, TRANSPORTISTAS, VEHICULOS, crearConductores } from "./cuentas";
import { crearDocumentos } from "./documentos";
import {
  crearGrupos,
  crearNotificaciones,
  crearOfertasGrupo,
  crearReferidos,
} from "./grupos";
import { crearBloqueosAgenda, crearOfertas } from "./ofertas";
import {
  crearCalificaciones,
  crearMensajes,
  crearPagos,
  crearPasajeros,
  crearRespuestas,
  crearViajes,
} from "./operaciones";

/** Cuentas que se encarnan en la demo al cambiar de rol. */
export const SESION_DEMO: Sesion = {
  agenciaId: "ag-1",
  carrierId: "tr-1",
};

/**
 * Arma el dataset completo anclado a una fecha. Es determinista: el mismo
 * `hoy` produce siempre el mismo seed, sin `Math.random`.
 */
export function crearSeed(hoy: Date): Datos {
  const viajes = crearViajes(hoy);

  return {
    agencias: AGENCIAS,
    transportistas: TRANSPORTISTAS,
    vehiculos: VEHICULOS,
    conductores: crearConductores(hoy),
    documentos: crearDocumentos(hoy),
    bloqueosAgenda: crearBloqueosAgenda(hoy),
    ofertas: crearOfertas(hoy),
    respuestas: crearRespuestas(hoy),
    viajes,
    pasajeros: crearPasajeros(),
    pagos: crearPagos(hoy, viajes),
    grupos: crearGrupos(hoy),
    ofertasGrupo: crearOfertasGrupo(hoy),
    referidos: crearReferidos(hoy),
    mensajes: crearMensajes(hoy),
    calificaciones: crearCalificaciones(hoy),
    notificaciones: crearNotificaciones(hoy),
    comisiones: {
      viajePct: COMISION_VIAJE_PCT,
      referidoPct: COMISION_REFERIDO_PCT,
    },
  };
}
