/**
 * Consultas derivadas sobre el dataset. Son funciones puras que reciben
 * `Datos`: la UI las llama con lo que saca del store y no duplica lógica de
 * filtrado en cada pantalla.
 */

import { parseISO } from "date-fns";

import type {
  Calificacion,
  Datos,
  Documento,
  Id,
  Oferta,
  Respuesta,
  Viaje,
} from "@/lib/mock/types";
import {
  chocaConBloqueo,
  documentosBloqueantes,
  estadoEfectivoDocumento,
  franjaDeOferta,
  seSolapan,
  vigenciaDocumento,
  type Franja,
} from "@/lib/utils/rules";

// ---------------------------------------------------------------------------
// Cuentas
// ---------------------------------------------------------------------------

export function agencia(datos: Datos, id: Id) {
  return datos.agencias.find((a) => a.id === id);
}

export function transportista(datos: Datos, id: Id) {
  return datos.transportistas.find((t) => t.id === id);
}

export function vehiculo(datos: Datos, id: Id) {
  return datos.vehiculos.find((v) => v.id === id);
}

export function conductor(datos: Datos, id: Id) {
  return datos.conductores.find((c) => c.id === id);
}

export function flotaDe(datos: Datos, carrierId: Id) {
  return datos.vehiculos.filter((v) => v.carrierId === carrierId);
}

export function conductoresDe(datos: Datos, carrierId: Id) {
  return datos.conductores.filter((c) => c.carrierId === carrierId);
}

export function bloqueosDe(datos: Datos, carrierId: Id) {
  return datos.bloqueosAgenda.filter((b) => b.carrierId === carrierId);
}

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

export function documentosDe(datos: Datos, propietarioId: Id): Documento[] {
  return datos.documentos.filter((d) => d.propietarioId === propietarioId);
}

/** Todos los documentos que cuelgan de una cuenta: la suya, su flota y sus conductores. */
export function documentosDelTransportista(datos: Datos, carrierId: Id): Documento[] {
  const propios = documentosDe(datos, carrierId);
  const deFlota = flotaDe(datos, carrierId).flatMap((v) => documentosDe(datos, v.id));
  const deConductores = conductoresDe(datos, carrierId).flatMap((c) =>
    documentosDe(datos, c.id),
  );
  return [...propios, ...deFlota, ...deConductores];
}

export type ResumenDocumentos = {
  total: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
  porVencer: number;
  vencidos: number;
};

export function resumirDocumentos(
  documentos: Documento[],
  ahora: Date,
): ResumenDocumentos {
  const resumen: ResumenDocumentos = {
    total: documentos.length,
    aprobados: 0,
    pendientes: 0,
    rechazados: 0,
    porVencer: 0,
    vencidos: 0,
  };

  for (const doc of documentos) {
    const estado = estadoEfectivoDocumento(doc, ahora);
    if (estado === "vencido") resumen.vencidos += 1;
    else if (estado === "pendiente") resumen.pendientes += 1;
    else if (estado === "rechazado") resumen.rechazados += 1;
    else {
      resumen.aprobados += 1;
      if (vigenciaDocumento(doc, ahora) === "por_vencer") resumen.porVencer += 1;
    }
  }

  return resumen;
}

/**
 * ¿Este transportista puede postular hoy? Mira su cuenta y los documentos que
 * dependen del vehículo y el conductor que quiera usar.
 */
export function impedimentosDeCuenta(
  datos: Datos,
  carrierId: Id,
  ahora: Date,
): { verificada: boolean; documentosVencidos: Documento[] } {
  const cuenta = transportista(datos, carrierId);
  return {
    verificada: cuenta?.estadoVerificacion === "verificada",
    documentosVencidos: documentosBloqueantes(documentosDe(datos, carrierId), ahora),
  };
}

// ---------------------------------------------------------------------------
// Ofertas y respuestas
// ---------------------------------------------------------------------------

export function oferta(datos: Datos, id: Id) {
  return datos.ofertas.find((o) => o.id === id);
}

export function ofertaPorCodigo(datos: Datos, codigo: string) {
  return datos.ofertas.find((o) => o.codigo === codigo);
}

export function ofertasDeAgencia(datos: Datos, agenciaId: Id): Oferta[] {
  return [...datos.ofertas]
    .filter((o) => o.agenciaId === agenciaId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Lo que un transportista ve en su feed: publicadas y vigentes. */
export function ofertasAbiertas(datos: Datos, ahora: Date): Oferta[] {
  return datos.ofertas
    .filter(
      (o) =>
        (o.estado === "publicada" || o.estado === "con_respuestas") &&
        parseISO(o.expiraEn) > ahora,
    )
    .sort((a, b) => a.fechaHoraSalida.localeCompare(b.fechaHoraSalida));
}

export function respuestasDeOferta(datos: Datos, ofertaId: Id): Respuesta[] {
  return datos.respuestas
    .filter((r) => r.ofertaId === ofertaId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function respuestasActivasDeOferta(datos: Datos, ofertaId: Id): Respuesta[] {
  return respuestasDeOferta(datos, ofertaId).filter((r) => r.estado === "activa");
}

export function respuestasDeCarrier(datos: Datos, carrierId: Id): Respuesta[] {
  return [...datos.respuestas]
    .filter((r) => r.carrierId === carrierId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function respuestaDeCarrierEnOferta(
  datos: Datos,
  ofertaId: Id,
  carrierId: Id,
): Respuesta | undefined {
  return datos.respuestas.find(
    (r) =>
      r.ofertaId === ofertaId &&
      r.carrierId === carrierId &&
      (r.estado === "activa" || r.estado === "ganadora"),
  );
}

export function contraofertasDeCarrierEnOferta(
  datos: Datos,
  ofertaId: Id,
  carrierId: Id,
): number {
  return datos.respuestas.filter(
    (r) =>
      r.ofertaId === ofertaId &&
      r.carrierId === carrierId &&
      r.tipo === "contraoferta" &&
      r.estado !== "retirada",
  ).length;
}

/** Cuánto se demoró la primera respuesta, en horas. Alimenta las métricas del admin. */
export function horasHastaPrimeraRespuesta(
  datos: Datos,
  ofertaId: Id,
): number | null {
  const o = oferta(datos, ofertaId);
  if (!o?.publicadaEn) return null;
  const primera = respuestasDeOferta(datos, ofertaId)[0];
  if (!primera) return null;
  return (
    (parseISO(primera.createdAt).getTime() - parseISO(o.publicadaEn).getTime()) /
    3_600_000
  );
}

// ---------------------------------------------------------------------------
// Viajes
// ---------------------------------------------------------------------------

export function viaje(datos: Datos, id: Id) {
  return datos.viajes.find((v) => v.id === id);
}

export function viajePorOferta(datos: Datos, ofertaId: Id) {
  return datos.viajes.find((v) => v.ofertaId === ofertaId);
}

export function viajesDeAgencia(datos: Datos, agenciaId: Id): Viaje[] {
  return [...datos.viajes]
    .filter((v) => v.agenciaId === agenciaId)
    .sort((a, b) => b.adjudicadoEn.localeCompare(a.adjudicadoEn));
}

export function viajesDeCarrier(datos: Datos, carrierId: Id): Viaje[] {
  return [...datos.viajes]
    .filter((v) => v.carrierId === carrierId)
    .sort((a, b) => b.adjudicadoEn.localeCompare(a.adjudicadoEn));
}

const ESTADOS_VIGENTES: Viaje["estado"][] = [
  "confirmada",
  "pago_retenido",
  "en_curso",
];

/** Franjas que ya ocupan los vehículos de un carrier, para detectar solapamiento. */
export function franjasOcupadas(
  datos: Datos,
  carrierId: Id,
  vehiculoId?: Id,
): { viajeId: Id; vehiculoId: Id; franja: Franja }[] {
  return datos.viajes
    .filter(
      (v) =>
        v.carrierId === carrierId &&
        ESTADOS_VIGENTES.includes(v.estado) &&
        (!vehiculoId || v.vehiculoId === vehiculoId),
    )
    .flatMap((v) => {
      const o = oferta(datos, v.ofertaId);
      if (!o) return [];
      return [{ viajeId: v.id, vehiculoId: v.vehiculoId, franja: franjaDeOferta(o) }];
    });
}

export function vehiculoOcupadoEn(
  datos: Datos,
  carrierId: Id,
  vehiculoId: Id,
  franja: Franja,
): boolean {
  return franjasOcupadas(datos, carrierId, vehiculoId).some((ocupada) =>
    seSolapan(franja, ocupada.franja),
  );
}

export type EvaluacionOfertaParaCarrier = {
  /** null = puede postular con al menos un vehículo. */
  motivoAtenuada: string | null;
  /** Vehículos del carrier que cumplen capacidad para esta oferta. */
  vehiculosAptos: Id[];
};

/**
 * Por qué una oferta se muestra atenuada en el feed de este transportista.
 * Devuelve el primer motivo en orden de gravedad; la pantalla de postulación
 * usa `evaluarPostulacion` con el detalle completo.
 */
export function evaluarOfertaParaCarrier(
  datos: Datos,
  ofertaId: Id,
  carrierId: Id,
): EvaluacionOfertaParaCarrier {
  const o = oferta(datos, ofertaId);
  if (!o) return { motivoAtenuada: "La oferta ya no existe.", vehiculosAptos: [] };

  const flota = flotaDe(datos, carrierId);
  const franja = franjaDeOferta(o);

  const conCapacidad = flota.filter(
    (v) => v.capacidadPasajeros >= o.cantidadPasajeros,
  );
  if (conCapacidad.length === 0) {
    const mayor = Math.max(0, ...flota.map((v) => v.capacidadPasajeros));
    return {
      motivoAtenuada: `Piden ${o.cantidadPasajeros} pasajeros y tu vehículo más grande lleva ${mayor}.`,
      vehiculosAptos: [],
    };
  }

  const bloqueos = bloqueosDe(datos, carrierId);
  const libresDeBloqueo = conCapacidad.filter(
    (v) => !bloqueos.some((b) => chocaConBloqueo(franja, b, v.id)),
  );
  if (libresDeBloqueo.length === 0) {
    const bloqueo = bloqueos.find((b) =>
      conCapacidad.some((v) => chocaConBloqueo(franja, b, v.id)),
    );
    return {
      motivoAtenuada: `Choca con un bloqueo de tu agenda: ${bloqueo?.motivo ?? "recorrido propio"}.`,
      vehiculosAptos: [],
    };
  }

  const disponibles = libresDeBloqueo.filter(
    (v) => !vehiculoOcupadoEn(datos, carrierId, v.id, franja),
  );
  if (disponibles.length === 0) {
    return {
      motivoAtenuada:
        "Ya tienes un viaje adjudicado que se cruza con estas fechas.",
      vehiculosAptos: [],
    };
  }

  return { motivoAtenuada: null, vehiculosAptos: disponibles.map((v) => v.id) };
}

export function pasajerosDeViaje(datos: Datos, viajeId: Id) {
  return datos.pasajeros.filter((p) => p.viajeId === viajeId);
}

export function mensajesDeViaje(datos: Datos, viajeId: Id) {
  return datos.mensajes
    .filter((m) => m.viajeId === viajeId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function pagoDeViaje(datos: Datos, viajeId: Id) {
  return datos.pagos.find((p) => p.viajeId === viajeId);
}

// ---------------------------------------------------------------------------
// Calificaciones
// ---------------------------------------------------------------------------

export function calificacionesDeViaje(datos: Datos, viajeId: Id): Calificacion[] {
  return datos.calificaciones.filter((c) => c.viajeId === viajeId);
}

export function calificacionesRecibidas(datos: Datos, cuentaId: Id): Calificacion[] {
  return [...datos.calificaciones]
    .filter((c) => c.destinatarioId === cuentaId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function yaCalifico(datos: Datos, viajeId: Id, autorId: Id): boolean {
  return datos.calificaciones.some(
    (c) => c.viajeId === viajeId && c.autorId === autorId,
  );
}

/** Viajes cerrados que todavía esperan la calificación de esta cuenta. */
export function viajesPorCalificar(
  datos: Datos,
  cuentaId: Id,
  rol: "agencia" | "transportista",
): Viaje[] {
  return datos.viajes.filter((v) => {
    const esSuyo = rol === "agencia" ? v.agenciaId === cuentaId : v.carrierId === cuentaId;
    if (!esSuyo) return false;
    if (v.estado !== "finalizada" && v.estado !== "liberada") return false;
    return !yaCalifico(datos, v.id, cuentaId);
  });
}

// ---------------------------------------------------------------------------
// Grupos de pasajeros
// ---------------------------------------------------------------------------

export function grupo(datos: Datos, id: Id) {
  return datos.grupos.find((g) => g.id === id);
}

export function gruposDeCarrier(datos: Datos, carrierId: Id) {
  return [...datos.grupos]
    .filter((g) => g.carrierId === carrierId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function gruposAbiertos(datos: Datos, ahora: Date) {
  return datos.grupos
    .filter(
      (g) =>
        (g.estado === "publicado" || g.estado === "con_ofertas") &&
        parseISO(g.expiraEn) > ahora,
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function ofertasDeGrupo(datos: Datos, grupoId: Id) {
  return datos.ofertasGrupo
    .filter((o) => o.grupoId === grupoId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ofertasGrupoDeAgencia(datos: Datos, agenciaId: Id) {
  return datos.ofertasGrupo.filter((o) => o.agenciaId === agenciaId);
}

export function referidosDeAgencia(datos: Datos, agenciaId: Id) {
  return datos.referidos.filter((r) => r.agenciaId === agenciaId);
}

export function referidosDeCarrier(datos: Datos, carrierId: Id) {
  return datos.referidos.filter((r) => r.carrierId === carrierId);
}

export function referidoDeGrupo(datos: Datos, grupoId: Id) {
  return datos.referidos.find((r) => r.grupoId === grupoId);
}

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

export function notificacionesDe(datos: Datos, destinatarioId: Id) {
  return [...datos.notificaciones]
    .filter((n) => n.destinatarioId === destinatarioId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sinLeer(datos: Datos, destinatarioId: Id): number {
  return datos.notificaciones.filter(
    (n) => n.destinatarioId === destinatarioId && !n.leida,
  ).length;
}
