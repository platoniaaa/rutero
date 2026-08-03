import type { TonoEstado } from "@/components/shared/badge-estado";
import type {
  EstadoDocumento,
  EstadoGrupo,
  EstadoOferta,
  EstadoPago,
  EstadoRespuesta,
  EstadoVerificacion,
  EstadoViaje,
} from "@/lib/mock/types";
import type { Vigencia } from "@/lib/utils/rules";

/** Mapeo de cada estado del negocio al tono con que se pinta su badge. */

export const TONO_OFERTA: Record<EstadoOferta, TonoEstado> = {
  borrador: "neutro",
  publicada: "espera",
  con_respuestas: "activo",
  adjudicada: "listo",
  cerrada: "neutro",
  expirada: "alerta",
  sin_respuestas: "alerta",
  cancelada: "alerta",
};

export const TONO_RESPUESTA: Record<EstadoRespuesta, TonoEstado> = {
  activa: "espera",
  retirada: "neutro",
  rechazada: "neutro",
  ganadora: "listo",
};

export const TONO_VIAJE: Record<EstadoViaje, TonoEstado> = {
  confirmada: "espera",
  pago_retenido: "activo",
  en_curso: "activo",
  finalizada: "espera",
  liberada: "listo",
  cancelada_agencia: "alerta",
  cancelada_transportista: "alerta",
  no_show: "alerta",
  en_disputa: "alerta",
};

export const TONO_PAGO: Record<EstadoPago, TonoEstado> = {
  pendiente: "espera",
  retenido: "activo",
  liberado: "listo",
  reembolsado: "neutro",
  en_disputa: "alerta",
};

export const TONO_GRUPO: Record<EstadoGrupo, TonoEstado> = {
  publicado: "espera",
  con_ofertas: "activo",
  adjudicado: "listo",
  cerrado: "neutro",
  expirado: "alerta",
  cancelado: "alerta",
};

export const TONO_DOCUMENTO: Record<EstadoDocumento, TonoEstado> = {
  pendiente: "espera",
  aprobado: "listo",
  rechazado: "alerta",
  vencido: "alerta",
};

export const TONO_VERIFICACION: Record<EstadoVerificacion, TonoEstado> = {
  sin_enviar: "neutro",
  en_revision: "espera",
  verificada: "listo",
  rechazada: "alerta",
};

/** Verde sobre 30 días, ámbar bajo 30, rojo vencido — sección 7.3. */
export const TONO_VIGENCIA: Record<Vigencia, TonoEstado> = {
  sin_vencimiento: "neutro",
  vigente: "listo",
  por_vencer: "activo",
  vencido: "alerta",
};

export const ETIQUETA_VIGENCIA: Record<Vigencia, string> = {
  sin_vencimiento: "Sin vencimiento",
  vigente: "Vigente",
  por_vencer: "Por vencer",
  vencido: "Vencido",
};
