import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import type {
  BloqueServicio,
  ClaseLicencia,
  Equipamiento,
  EstadoDocumento,
  EstadoGrupo,
  EstadoOferta,
  EstadoPago,
  EstadoRespuesta,
  EstadoVerificacion,
  EstadoViaje,
  Requerimiento,
  TipoDocumento,
  TipoServicio,
  TipoVehiculo,
} from "@/lib/mock/types";

// ---------------------------------------------------------------------------
// Montos
// ---------------------------------------------------------------------------

/** `$1.250.000` — punto como separador de miles, sin decimales. */
export function formatearCLP(monto: number): string {
  return `$${Math.round(monto).toLocaleString("es-CL", {
    maximumFractionDigits: 0,
  })}`;
}

/** Solo el número, para inputs y celdas que ya tienen el signo aparte. */
export function formatearNumero(valor: number): string {
  return Math.round(valor).toLocaleString("es-CL", {
    maximumFractionDigits: 0,
  });
}

/** Lee un monto escrito a mano: `$280.000`, `280000`, `280 000`. */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.replace(/[^\d]/g, "");
  if (!limpio) return null;
  return Number(limpio);
}

/**
 * La agencia piensa por pasajero y el transportista por jornada. Se redondea a
 * la centena para no mostrar cifras con precisión falsa.
 */
export function montoPorPasajero(total: number, pasajeros: number): number {
  if (pasajeros <= 0) return 0;
  return Math.round(total / pasajeros / 100) * 100;
}

/** `$280.000 · ≈ $18.700/pax con 15 pasajeros` */
export function formatearDobleLectura(
  total: number,
  pasajeros: number,
): string {
  const porPax = montoPorPasajero(total, pasajeros);
  return `${formatearCLP(total)} · ≈ ${formatearCLP(porPax)}/pax con ${pasajeros} pasajeros`;
}

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------

function aDate(fecha: string | Date): Date {
  return typeof fecha === "string" ? parseISO(fecha) : fecha;
}

/** `sáb 14 mar, 08:30` */
export function formatearFecha(fecha: string | Date): string {
  return format(aDate(fecha), "EEE d MMM, HH:mm", { locale: es });
}

/** `sáb 14 mar` */
export function formatearFechaCorta(fecha: string | Date): string {
  return format(aDate(fecha), "EEE d MMM", { locale: es });
}

/** `14 mar 2026` */
export function formatearFechaLarga(fecha: string | Date): string {
  return format(aDate(fecha), "d MMM yyyy", { locale: es });
}

/** `08:30` */
export function formatearHora(fecha: string | Date): string {
  return format(aDate(fecha), "HH:mm");
}

/** `en 3 días`, `hace 2 horas` */
export function formatearRelativo(fecha: string | Date): string {
  return formatDistanceToNowStrict(aDate(fecha), {
    locale: es,
    addSuffix: true,
  });
}

/** Cuánto queda para que expire una oferta: `2 d 4 h`, `5 h`, `Expirada`. */
export function formatearCuentaRegresiva(
  expiraEn: string | Date,
  ahora: Date,
): string {
  const restanteMs = aDate(expiraEn).getTime() - ahora.getTime();
  if (restanteMs <= 0) return "Expirada";

  const horas = Math.floor(restanteMs / 3_600_000);
  const dias = Math.floor(horas / 24);
  if (dias >= 1) return `${dias} d ${horas % 24} h`;

  const minutos = Math.floor((restanteMs % 3_600_000) / 60_000);
  if (horas >= 1) return `${horas} h ${minutos} min`;
  return `${minutos} min`;
}

// ---------------------------------------------------------------------------
// Patentes
// ---------------------------------------------------------------------------

/**
 * Normaliza una patente chilena al formato de placa: `BCDF·12` para las de
 * cuatro letras y `AB·1234` para las antiguas de dos. Si no reconoce el
 * formato devuelve el original en mayúsculas, sin inventar separadores.
 */
export function formatearPatente(patente: string): string {
  const limpia = patente.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const moderna = /^([A-Z]{4})(\d{2})$/.exec(limpia);
  if (moderna) return `${moderna[1]}·${moderna[2]}`;

  const antigua = /^([A-Z]{2})(\d{4})$/.exec(limpia);
  if (antigua) return `${antigua[1]}·${antigua[2]}`;

  return patente.toUpperCase();
}

/**
 * Las patentes chilenas modernas no usan vocales ni las letras M, N, Q para
 * evitar palabras y confusiones de lectura.
 */
const LETRAS_PATENTE = /^[BCDFGHJKLPRSTVWXYZ]+$/;

export function esPatenteValida(patente: string): boolean {
  const limpia = patente.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const moderna = /^([A-Z]{4})(\d{2})$/.exec(limpia);
  if (moderna) return LETRAS_PATENTE.test(moderna[1]);

  return /^[A-Z]{2}\d{4}$/.test(limpia);
}

// ---------------------------------------------------------------------------
// RUT
// ---------------------------------------------------------------------------

/** Dígito verificador por módulo 11. */
export function calcularDigitoVerificador(cuerpo: number): string {
  let suma = 0;
  let multiplo = 2;
  let resto = cuerpo;

  while (resto > 0) {
    suma += (resto % 10) * multiplo;
    resto = Math.floor(resto / 10);
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dv = 11 - (suma % 11);
  if (dv === 11) return "0";
  if (dv === 10) return "K";
  return String(dv);
}

/** `76.543.210-K` */
export function formatearRut(rut: string): string {
  const limpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length < 2) return rut;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const conPuntos = Number(cuerpo).toLocaleString("es-CL");
  return `${conPuntos}-${dv}`;
}

export function esRutValido(rut: string): boolean {
  const limpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length < 2) return false;

  const cuerpo = Number(limpio.slice(0, -1));
  if (!Number.isInteger(cuerpo) || cuerpo <= 0) return false;

  return calcularDigitoVerificador(cuerpo) === limpio.slice(-1);
}

// ---------------------------------------------------------------------------
// Teléfono
// ---------------------------------------------------------------------------

/** `+56 9 8765 4321` */
export function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/[^\d]/g, "");
  const movil = /^56(9)(\d{4})(\d{4})$/.exec(limpio);
  if (movil) return `+56 ${movil[1]} ${movil[2]} ${movil[3]}`;

  const fijo = /^56(\d{1,2})(\d{3,4})(\d{4})$/.exec(limpio);
  if (fijo) return `+56 ${fijo[1]} ${fijo[2]} ${fijo[3]}`;

  return telefono;
}

// ---------------------------------------------------------------------------
// Etiquetas del vocabulario del negocio
// ---------------------------------------------------------------------------

export const ETIQUETA_BLOQUE: Record<BloqueServicio, string> = {
  transfer: "Transfer punto a punto",
  medio_dia: "Medio día",
  dia_completo: "Día completo",
  multi_dia: "Multi-día",
};

export const DETALLE_BLOQUE: Record<BloqueServicio, string> = {
  transfer: "Traslado directo, sin espera",
  medio_dia: "Hasta 5 horas",
  dia_completo: "Hasta 12 horas",
  multi_dia: "Dos días o más",
};

export const ETIQUETA_TIPO_SERVICIO: Record<TipoServicio, string> = {
  traslado_aeropuerto: "Traslado aeropuerto",
  tour: "Tour",
  transfer_hotel: "Transfer hotel",
  evento_corporativo: "Evento corporativo",
  otro: "Otro",
};

export const ETIQUETA_TIPO_VEHICULO: Record<TipoVehiculo, string> = {
  van: "Van",
  minibus: "Minibús",
  sprinter: "Sprinter",
  bus: "Bus",
};

export const ETIQUETA_EQUIPAMIENTO: Record<Equipamiento, string> = {
  aire_acondicionado: "Aire acondicionado",
  portaequipaje: "Portaequipaje",
  cadenas: "Cadenas",
  wifi: "WiFi",
  rampa_accesibilidad: "Rampa de accesibilidad",
};

export const ETIQUETA_REQUERIMIENTO: Record<Requerimiento, string> = {
  aire_acondicionado: "Aire acondicionado",
  portaequipaje: "Portaequipaje",
  cadenas: "Cadenas",
  wifi: "WiFi",
  rampa_accesibilidad: "Rampa de accesibilidad",
  conductor_bilingue: "Conductor bilingüe",
  segundo_conductor: "Segundo conductor",
  silla_infantil: "Silla infantil",
};

export const ETIQUETA_ESTADO_OFERTA: Record<EstadoOferta, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  con_respuestas: "Con respuestas",
  adjudicada: "Adjudicada",
  cerrada: "Cerrada",
  expirada: "Expirada",
  sin_respuestas: "Sin respuestas",
  cancelada: "Cancelada",
};

export const ETIQUETA_ESTADO_RESPUESTA: Record<EstadoRespuesta, string> = {
  activa: "Activa",
  retirada: "Retirada",
  rechazada: "Rechazada",
  ganadora: "Ganadora",
};

export const ETIQUETA_ESTADO_VIAJE: Record<EstadoViaje, string> = {
  confirmada: "Confirmada",
  pago_retenido: "Pago retenido",
  en_curso: "En curso",
  finalizada: "Finalizada",
  liberada: "Pago liberado",
  cancelada_agencia: "Cancelada por la agencia",
  cancelada_transportista: "Cancelada por el transportista",
  no_show: "No show",
  en_disputa: "En disputa",
};

export const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  retenido: "Retenido",
  liberado: "Liberado",
  reembolsado: "Reembolsado",
  en_disputa: "En disputa",
};

export const ETIQUETA_ESTADO_GRUPO: Record<EstadoGrupo, string> = {
  publicado: "Publicado",
  con_ofertas: "Con ofertas",
  adjudicado: "Adjudicado",
  cerrado: "Cerrado",
  expirado: "Expirado",
  cancelado: "Cancelado",
};

export const ETIQUETA_ESTADO_DOCUMENTO: Record<EstadoDocumento, string> = {
  pendiente: "Pendiente de revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  vencido: "Vencido",
};

export const ETIQUETA_ESTADO_VERIFICACION: Record<EstadoVerificacion, string> = {
  sin_enviar: "Sin enviar",
  en_revision: "En revisión",
  verificada: "Verificada",
  rechazada: "Rechazada",
};

export const ETIQUETA_DOCUMENTO: Record<TipoDocumento, string> = {
  rut_erut: "RUT / e-RUT",
  inicio_actividades: "Inicio de actividades",
  inscripcion_ds80_servicio: "Inscripción DS 80 del servicio",
  seguro_responsabilidad_civil: "Seguro de responsabilidad civil",
  seguro_personal_conduccion: "Seguro del personal de conducción",
  inscripcion_ds80_vehiculo: "Inscripción DS 80 del vehículo",
  permiso_circulacion: "Permiso de circulación",
  revision_tecnica: "Revisión técnica",
  soap: "SOAP",
  certificado_emisiones: "Certificado de emisiones",
  tacografo: "Tacógrafo",
  licencia_profesional: "Licencia profesional",
  certificado_antecedentes: "Certificado de antecedentes",
  hoja_vida_conductor: "Hoja de vida del conductor",
};

export const ETIQUETA_LICENCIA: Record<ClaseLicencia, string> = {
  A2: "Clase A2 — hasta 17 asientos",
  A3: "Clase A3 — sin límite de capacidad",
};
