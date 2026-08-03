/**
 * Reglas de negocio de la sección 8 de SPEC.md, como funciones puras.
 * Cuando exista backend se reusan tal cual, así que no tocan el store ni el DOM.
 */

import { addDays, differenceInHours, differenceInDays, parseISO } from "date-fns";

import type {
  BloqueoAgenda,
  Calificacion,
  ClaseLicencia,
  Conductor,
  Documento,
  EstadoDocumento,
  Oferta,
  Respuesta,
  TipoDocumento,
  Vehiculo,
  Viaje,
} from "@/lib/mock/types";

// ---------------------------------------------------------------------------
// Comisión
// ---------------------------------------------------------------------------

/** 5% plano, igual para los dos flujos. Configurable desde el panel admin. */
export const COMISION_VIAJE_PCT = 5;
export const COMISION_REFERIDO_PCT = 5;

export type DesgloseMonto = {
  bruto: number;
  comision: number;
  neto: number;
};

/**
 * La agencia paga el total; la comisión se le descuenta al transportista al
 * liberar. El desglose se muestra siempre: bruto, comisión, neto.
 */
export function desglosarViaje(
  montoBruto: number,
  comisionPct: number = COMISION_VIAJE_PCT,
): DesgloseMonto {
  const comision = Math.round((montoBruto * comisionPct) / 100);
  return { bruto: montoBruto, comision, neto: montoBruto - comision };
}

/**
 * En el referido, Rutero cobra sobre la comisión que la agencia le paga al
 * transportista, no sobre el ticket completo del tour.
 */
export function desglosarReferido(
  ticketTotal: number,
  comisionSolicitadaPct: number,
  comisionPlataformaPct: number = COMISION_REFERIDO_PCT,
): DesgloseMonto & { comisionTransportista: number } {
  const comisionTransportista = Math.round(
    (ticketTotal * comisionSolicitadaPct) / 100,
  );
  const comision = Math.round(
    (comisionTransportista * comisionPlataformaPct) / 100,
  );
  return {
    comisionTransportista,
    bruto: comisionTransportista,
    comision,
    neto: comisionTransportista - comision,
  };
}

// ---------------------------------------------------------------------------
// Anti-fuga
// ---------------------------------------------------------------------------

/**
 * Detecta que alguien está pasando un teléfono por el chat. Busca secuencias de
 * ocho o más dígitos, incluso separadas por espacios, puntos o guiones, que es
 * como se escriben los números en la práctica.
 */
export function contieneTelefono(texto: string): boolean {
  const soloDigitosYSeparadores = texto.replace(/[^\d\s.\-+()]/g, " ");
  return /(?:\+?56[\s.-]*)?(?:\(?9\)?[\s.-]*)?(?:\d[\s.-]*){8,}/.test(
    soloDigitosYSeparadores,
  );
}

export const AVISO_FUGA =
  "Recuerda que el respaldo del viaje solo aplica dentro de Rutero.";

// ---------------------------------------------------------------------------
// Cancelaciones
// ---------------------------------------------------------------------------

export type ResultadoCancelacion = {
  reembolsoAgencia: number;
  pagoTransportista: number;
  comisionPlataforma: number;
  descripcion: string;
  penalizaScore: boolean;
  reabreOferta: boolean;
};

/**
 * Reparte la plata según quién cancela y con cuánta anticipación.
 * `horasAntes` se mide contra la salida del viaje.
 */
export function calcularCancelacion(
  quienCancela: "agencia" | "transportista",
  horasAntes: number,
  montoFinal: number,
  comisionPct: number = COMISION_VIAJE_PCT,
): ResultadoCancelacion {
  if (quienCancela === "transportista") {
    return {
      reembolsoAgencia: montoFinal,
      pagoTransportista: 0,
      comisionPlataforma: 0,
      descripcion:
        "Reembolso total a la agencia. El transportista recibe penalidad en su score y la oferta se reabre como urgente.",
      penalizaScore: true,
      reabreOferta: true,
    };
  }

  if (horasAntes > 72) {
    return {
      reembolsoAgencia: montoFinal,
      pagoTransportista: 0,
      comisionPlataforma: 0,
      descripcion: "Cancelación con más de 72 h: reembolso del 100%.",
      penalizaScore: false,
      reabreOferta: false,
    };
  }

  if (horasAntes >= 24) {
    const pagoTransportista = Math.round(montoFinal / 2);
    return {
      reembolsoAgencia: montoFinal - pagoTransportista,
      pagoTransportista,
      comisionPlataforma: 0,
      descripcion:
        "Cancelación entre 72 h y 24 h: el 50% queda para el transportista.",
      penalizaScore: false,
      reabreOferta: false,
    };
  }

  const { comision, neto } = desglosarViaje(montoFinal, comisionPct);
  return {
    reembolsoAgencia: 0,
    pagoTransportista: neto,
    comisionPlataforma: comision,
    descripcion:
      "Cancelación con menos de 24 h: el total queda para el transportista, menos la comisión.",
    penalizaScore: false,
    reabreOferta: false,
  };
}

/** Tres cancelaciones del transportista en 90 días significan suspensión. */
export const CANCELACIONES_PARA_SUSPENSION = 3;
export const VENTANA_CANCELACIONES_DIAS = 90;

export function debeSuspenderse(
  cancelacionesDelTransportista: string[],
  ahora: Date,
): boolean {
  const limite = addDays(ahora, -VENTANA_CANCELACIONES_DIAS);
  const recientes = cancelacionesDelTransportista.filter(
    (fecha) => parseISO(fecha) >= limite,
  );
  return recientes.length >= CANCELACIONES_PARA_SUSPENSION;
}

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

export type Vigencia = "sin_vencimiento" | "vigente" | "por_vencer" | "vencido";

export const DIAS_AVISO_VENCIMIENTO = 30;

/** Verde sobre 30 días, ámbar bajo 30, rojo vencido. */
export function vigenciaDocumento(doc: Documento, ahora: Date): Vigencia {
  if (!doc.fechaVencimiento) return "sin_vencimiento";

  const dias = differenceInDays(parseISO(doc.fechaVencimiento), ahora);
  if (dias < 0) return "vencido";
  if (dias <= DIAS_AVISO_VENCIMIENTO) return "por_vencer";
  return "vigente";
}

/** Se avisa a los 30, 15 y 3 días antes del vencimiento. */
export const DIAS_RECORDATORIO_VENCIMIENTO = [30, 15, 3];

/**
 * Documentos sin los cuales no se puede operar legalmente. Su vencimiento
 * bloquea la postulación; el resto solo muestra advertencia.
 */
export const DOCUMENTOS_CRITICOS: TipoDocumento[] = [
  "inscripcion_ds80_servicio",
  "seguro_responsabilidad_civil",
  "seguro_personal_conduccion",
  "inscripcion_ds80_vehiculo",
  "permiso_circulacion",
  "revision_tecnica",
  "soap",
  "licencia_profesional",
];

export function esDocumentoCritico(
  tipo: TipoDocumento,
  interurbano = false,
): boolean {
  if (tipo === "tacografo") return interurbano;
  return DOCUMENTOS_CRITICOS.includes(tipo);
}

/** El estado que corresponde mostrar hoy, considerando el vencimiento. */
export function estadoEfectivoDocumento(
  doc: Documento,
  ahora: Date,
): EstadoDocumento {
  if (doc.estado === "aprobado" && vigenciaDocumento(doc, ahora) === "vencido") {
    return "vencido";
  }
  return doc.estado;
}

export function documentosBloqueantes(
  documentos: Documento[],
  ahora: Date,
  interurbano = false,
): Documento[] {
  return documentos.filter((doc) => {
    if (!esDocumentoCritico(doc.tipo, interurbano)) return false;
    const estado = estadoEfectivoDocumento(doc, ahora);
    return estado !== "aprobado";
  });
}

// ---------------------------------------------------------------------------
// Licencias y capacidad
// ---------------------------------------------------------------------------

/** A2 habilita vehículos de 10 a 17 asientos; A3 no tiene límite. */
export const CAPACIDAD_MAXIMA_A2 = 17;

export function licenciaCubreCapacidad(
  clase: ClaseLicencia,
  capacidadPasajeros: number,
): boolean {
  if (clase === "A3") return true;
  return capacidadPasajeros <= CAPACIDAD_MAXIMA_A2;
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

export type Franja = { inicio: Date; fin: Date };

/** Ventana que ocupa un viaje: del inicio al retorno, o a las horas estimadas. */
export function franjaDeOferta(oferta: Oferta): Franja {
  const inicio = parseISO(oferta.fechaHoraSalida);
  const fin = oferta.fechaHoraRetorno
    ? parseISO(oferta.fechaHoraRetorno)
    : new Date(inicio.getTime() + oferta.horasEstimadas * 3_600_000);
  return { inicio, fin };
}

export function seSolapan(a: Franja, b: Franja): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}

/** ¿La franja cae dentro de un bloqueo de agenda del transportista? */
export function chocaConBloqueo(
  franja: Franja,
  bloqueo: BloqueoAgenda,
  vehiculoId?: string,
): boolean {
  // Un bloqueo de un vehículo puntual no afecta al resto de la flota.
  if (bloqueo.vehiculoId && vehiculoId && bloqueo.vehiculoId !== vehiculoId) {
    return false;
  }

  if (bloqueo.tipo === "puntual") {
    return seSolapan(franja, {
      inicio: parseISO(bloqueo.inicio),
      fin: parseISO(bloqueo.fin),
    });
  }

  const desde = parseISO(bloqueo.desde);
  const hasta = bloqueo.hasta ? parseISO(bloqueo.hasta) : null;
  if (franja.fin < desde) return false;
  if (hasta && franja.inicio > hasta) return false;

  // Se revisa día por día porque una jornada puede cruzar la medianoche.
  const cursor = new Date(franja.inicio);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= franja.fin) {
    if (bloqueo.diasSemana.includes(cursor.getDay())) {
      const [hi, mi] = bloqueo.horaInicio.split(":").map(Number);
      const [hf, mf] = bloqueo.horaFin.split(":").map(Number);

      const inicioBloqueo = new Date(cursor);
      inicioBloqueo.setHours(hi, mi, 0, 0);
      const finBloqueo = new Date(cursor);
      finBloqueo.setHours(hf, mf, 0, 0);

      if (seSolapan(franja, { inicio: inicioBloqueo, fin: finBloqueo })) {
        return true;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Postulación
// ---------------------------------------------------------------------------

/** Esto no es un mercado persa. */
export const MAXIMO_CONTRAOFERTAS = 2;

export type MotivoBloqueo =
  | "cuenta_no_verificada"
  | "documentos_vencidos"
  | "capacidad_insuficiente"
  | "licencia_insuficiente"
  | "vehiculo_ocupado"
  | "bloqueo_agenda"
  | "limite_contraofertas"
  | "oferta_no_disponible"
  | "oferta_expirada";

export type Impedimento = {
  motivo: MotivoBloqueo;
  detalle: string;
};

export type ContextoPostulacion = {
  oferta: Oferta;
  vehiculo: Vehiculo;
  conductor: Conductor;
  cuentaVerificada: boolean;
  documentos: Documento[];
  bloqueos: BloqueoAgenda[];
  /** Viajes vigentes del transportista, para detectar solapamiento. */
  viajesDelVehiculo: { franja: Franja }[];
  contraofertasPrevias: number;
  ahora: Date;
};

/**
 * Junta todas las condiciones de la sección 8. Devuelve todos los impedimentos,
 * no solo el primero, porque la UI muestra el motivo completo.
 */
export function evaluarPostulacion(ctx: ContextoPostulacion): Impedimento[] {
  const impedimentos: Impedimento[] = [];
  const {
    oferta,
    vehiculo,
    conductor,
    cuentaVerificada,
    documentos,
    bloqueos,
    viajesDelVehiculo,
    contraofertasPrevias,
    ahora,
  } = ctx;

  if (!["publicada", "con_respuestas"].includes(oferta.estado)) {
    impedimentos.push({
      motivo: "oferta_no_disponible",
      detalle: "Esta oferta ya no está recibiendo respuestas.",
    });
  }

  if (parseISO(oferta.expiraEn) <= ahora) {
    impedimentos.push({
      motivo: "oferta_expirada",
      detalle: "La ventana de cierre de esta oferta ya pasó.",
    });
  }

  if (!cuentaVerificada) {
    impedimentos.push({
      motivo: "cuenta_no_verificada",
      detalle:
        "Tu cuenta todavía no está verificada. Completa los documentos para postular.",
    });
  }

  const vencidos = documentosBloqueantes(documentos, ahora, vehiculo.interurbano);
  if (vencidos.length > 0) {
    impedimentos.push({
      motivo: "documentos_vencidos",
      detalle: `Tienes ${vencidos.length} ${
        vencidos.length === 1
          ? "documento crítico sin vigencia"
          : "documentos críticos sin vigencia"
      }. Actualízalos para poder postular.`,
    });
  }

  if (vehiculo.capacidadPasajeros < oferta.cantidadPasajeros) {
    impedimentos.push({
      motivo: "capacidad_insuficiente",
      detalle: `El vehículo lleva hasta ${vehiculo.capacidadPasajeros} pasajeros y la oferta pide ${oferta.cantidadPasajeros}.`,
    });
  }

  if (!licenciaCubreCapacidad(conductor.licenciaClase, vehiculo.capacidadPasajeros)) {
    impedimentos.push({
      motivo: "licencia_insuficiente",
      detalle: `La licencia ${conductor.licenciaClase} habilita hasta ${CAPACIDAD_MAXIMA_A2} asientos y este vehículo tiene ${vehiculo.capacidadPasajeros}. Asigna un conductor con licencia A3.`,
    });
  }

  const franja = franjaDeOferta(oferta);

  if (viajesDelVehiculo.some((v) => seSolapan(franja, v.franja))) {
    impedimentos.push({
      motivo: "vehiculo_ocupado",
      detalle: "Este vehículo ya tiene un viaje adjudicado que se cruza con estas fechas.",
    });
  }

  const bloqueo = bloqueos.find((b) => chocaConBloqueo(franja, b, vehiculo.id));
  if (bloqueo) {
    impedimentos.push({
      motivo: "bloqueo_agenda",
      detalle: `Choca con un bloqueo de tu agenda: ${bloqueo.motivo}.`,
    });
  }

  if (contraofertasPrevias >= MAXIMO_CONTRAOFERTAS) {
    impedimentos.push({
      motivo: "limite_contraofertas",
      detalle: `Ya enviaste ${MAXIMO_CONTRAOFERTAS} contraofertas en este viaje.`,
    });
  }

  return impedimentos;
}

export function puedePostular(ctx: ContextoPostulacion): boolean {
  return evaluarPostulacion(ctx).length === 0;
}

// ---------------------------------------------------------------------------
// Ofertas
// ---------------------------------------------------------------------------

export function ofertaExpirada(oferta: Oferta, ahora: Date): boolean {
  return parseISO(oferta.expiraEn) <= ahora;
}

export function horasHastaSalida(oferta: Oferta, ahora: Date): number {
  return differenceInHours(parseISO(oferta.fechaHoraSalida), ahora);
}

/** Con adjudicación automática, la primera aceptación al precio cierra el trato. */
export function adjudicaAutomatico(
  oferta: Oferta,
  respuesta: Respuesta,
): boolean {
  return (
    oferta.modoAdjudicacion === "automatico_primero" &&
    respuesta.tipo === "aceptacion"
  );
}

// ---------------------------------------------------------------------------
// Pagos
// ---------------------------------------------------------------------------

/** El pago se libera 24 h después de finalizado si nadie abre disputa. */
export const HORAS_LIBERACION_PAGO = 24;
/** La agencia tiene 48 h para confirmar o abrir disputa. */
export const HORAS_VENTANA_DISPUTA = 48;

export function puedeLiberarsePago(viaje: Viaje, ahora: Date): boolean {
  if (viaje.estado !== "finalizada" || !viaje.finalizadoEn) return false;
  return differenceInHours(ahora, parseISO(viaje.finalizadoEn)) >= HORAS_LIBERACION_PAGO;
}

export function ventanaDisputaAbierta(viaje: Viaje, ahora: Date): boolean {
  if (!viaje.finalizadoEn) return false;
  return (
    differenceInHours(ahora, parseISO(viaje.finalizadoEn)) < HORAS_VENTANA_DISPUTA
  );
}

// ---------------------------------------------------------------------------
// Calificaciones
// ---------------------------------------------------------------------------

/** Ciega: cada uno ve la del otro cuando ambos calificaron o pasan 7 días. */
export const DIAS_REVELACION_CALIFICACION = 7;

export function calificacionesVisibles(
  calificacionesDelViaje: Calificacion[],
  finalizadoEn: string | undefined,
  ahora: Date,
): boolean {
  if (calificacionesDelViaje.length >= 2) return true;
  if (!finalizadoEn) return false;
  return (
    differenceInDays(ahora, parseISO(finalizadoEn)) >=
    DIAS_REVELACION_CALIFICACION
  );
}

export function promedio(valores: number[]): number {
  if (valores.length === 0) return 0;
  const suma = valores.reduce((acc, v) => acc + v, 0);
  return Math.round((suma / valores.length) * 10) / 10;
}
