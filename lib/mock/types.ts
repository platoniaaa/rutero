/**
 * Entidades del dominio — sección 5 de SPEC.md.
 *
 * Las relaciones se guardan por id, no anidadas, para que el store pueda
 * mutar una entidad sin tener que sincronizar copias. Las fechas viajan como
 * string ISO 8601 porque `localStorage` no serializa `Date`.
 */

export type Id = string;
export type FechaISO = string;

// ---------------------------------------------------------------------------
// Estados
// ---------------------------------------------------------------------------

export type EstadoVerificacion =
  | "sin_enviar"
  | "en_revision"
  | "verificada"
  | "rechazada";

export type EstadoDocumento =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "vencido";

export type EstadoOferta =
  | "borrador"
  | "publicada"
  | "con_respuestas"
  | "adjudicada"
  | "cerrada"
  | "expirada"
  | "sin_respuestas"
  | "cancelada";

export type EstadoRespuesta = "activa" | "retirada" | "rechazada" | "ganadora";

export type EstadoViaje =
  | "confirmada"
  | "pago_retenido"
  | "en_curso"
  | "finalizada"
  | "liberada"
  | "cancelada_agencia"
  | "cancelada_transportista"
  | "no_show"
  | "en_disputa";

export type EstadoPago =
  | "pendiente"
  | "retenido"
  | "liberado"
  | "reembolsado"
  | "en_disputa";

export type EstadoGrupo =
  | "publicado"
  | "con_ofertas"
  | "adjudicado"
  | "cerrado"
  | "expirado"
  | "cancelado";

export type EstadoOfertaGrupo = "activa" | "retirada" | "rechazada" | "ganadora";

// ---------------------------------------------------------------------------
// Vocabulario del negocio
// ---------------------------------------------------------------------------

/** La unidad de precio es la jornada, no el kilómetro. */
export type BloqueServicio =
  | "transfer"
  | "medio_dia"
  | "dia_completo"
  | "multi_dia";

export type TipoServicio =
  | "traslado_aeropuerto"
  | "tour"
  | "transfer_hotel"
  | "evento_corporativo"
  | "otro";

export type ModoAdjudicacion = "yo_elijo" | "automatico_primero";

/** Horas de vigencia de una oferta publicada. */
export type VentanaCierre = 6 | 24 | 72;

export type TipoVehiculo = "van" | "minibus" | "sprinter" | "bus";

/** A2 habilita hasta 17 asientos; A3 no tiene límite de capacidad. */
export type ClaseLicencia = "A2" | "A3";

export type Equipamiento =
  | "aire_acondicionado"
  | "portaequipaje"
  | "cadenas"
  | "wifi"
  | "rampa_accesibilidad";

export type Requerimiento =
  | "aire_acondicionado"
  | "portaequipaje"
  | "cadenas"
  | "wifi"
  | "rampa_accesibilidad"
  | "conductor_bilingue"
  | "segundo_conductor"
  | "silla_infantil";

export type Rol = "agencia" | "transportista" | "admin";

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

export type TipoDocumentoCuenta =
  | "rut_erut"
  | "inicio_actividades"
  | "inscripcion_ds80_servicio"
  | "seguro_responsabilidad_civil"
  | "seguro_personal_conduccion";

export type TipoDocumentoVehiculo =
  | "inscripcion_ds80_vehiculo"
  | "permiso_circulacion"
  | "revision_tecnica"
  | "soap"
  | "certificado_emisiones"
  | "tacografo";

export type TipoDocumentoConductor =
  | "licencia_profesional"
  | "certificado_antecedentes"
  | "hoja_vida_conductor";

export type TipoDocumento =
  | TipoDocumentoCuenta
  | TipoDocumentoVehiculo
  | TipoDocumentoConductor;

export type Documento = {
  id: Id;
  /** Cuenta, vehículo o conductor al que pertenece. */
  propietarioId: Id;
  tipo: TipoDocumento;
  /** URL local mockeada de la foto o el PDF. */
  archivo: string;
  fechaEmision: FechaISO;
  /** Los documentos sin vencimiento (inicio de actividades) van sin fecha. */
  fechaVencimiento?: FechaISO;
  estado: EstadoDocumento;
  motivoRechazo?: string;
};

// ---------------------------------------------------------------------------
// Cuentas
// ---------------------------------------------------------------------------

export type Contacto = {
  nombre: string;
  telefono: string;
  email: string;
};

export type Agencia = {
  id: Id;
  razonSocial: string;
  rut: string;
  giro: string;
  logo: string;
  contacto: Contacto;
  direccion: string;
  estadoVerificacion: EstadoVerificacion;
  ratingPromedio: number;
  viajesCompletados: number;
};

/**
 * Franja en la que el transportista no está disponible por recorridos propios:
 * escolar, contratos de empresa, circuitos propios.
 */
type BloqueoBase = {
  id: Id;
  carrierId: Id;
  motivo: string;
  /** Vehículo específico, o toda la flota si no se indica. */
  vehiculoId?: Id;
};

export type BloqueoRecurrente = BloqueoBase & {
  tipo: "recurrente";
  /** 0 = domingo, 6 = sábado. */
  diasSemana: number[];
  horaInicio: string;
  horaFin: string;
  desde: FechaISO;
  hasta?: FechaISO;
};

export type BloqueoPuntual = BloqueoBase & {
  tipo: "puntual";
  inicio: FechaISO;
  fin: FechaISO;
};

export type BloqueoAgenda = BloqueoRecurrente | BloqueoPuntual;

/** `Omit` sobre una unión la colapsa, así que se distribuye a mano. */
export type NuevoBloqueo =
  | Omit<BloqueoRecurrente, "id">
  | Omit<BloqueoPuntual, "id">;

/**
 * Una sola cuenta cubre al furgonero independiente y a la empresa con flota.
 * La diferencia es cuántos vehículos tiene, no el tipo de cuenta.
 */
export type Transportista = {
  id: Id;
  nombre: string;
  rut: string;
  esEmpresa: boolean;
  zonasOperacion: string[];
  estadoVerificacion: EstadoVerificacion;
  ratingPromedio: number;
  viajesCompletados: number;
  contacto: Contacto;
};

export type Vehiculo = {
  id: Id;
  carrierId: Id;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: TipoVehiculo;
  capacidadPasajeros: number;
  capacidadEquipaje: number;
  fotos: string[];
  equipamiento: Equipamiento[];
  /** Solo para servicios interurbanos; determina si se exige tacógrafo. */
  interurbano: boolean;
};

export type Conductor = {
  id: Id;
  carrierId: Id;
  nombre: string;
  rut: string;
  foto: string;
  telefono: string;
  licenciaClase: ClaseLicencia;
  licenciaVencimiento: FechaISO;
  idiomas: string[];
};

// ---------------------------------------------------------------------------
// Flujo 1 — viaje
// ---------------------------------------------------------------------------

export type Parada = {
  nombre: string;
  hora?: string;
};

/**
 * Documento que la agencia adjunta al brief: el itinerario en PDF, el programa
 * del tour, un plano del punto de encuentro. En la demo el contenido viaja como
 * data URL dentro de `localStorage`, así que hay tope de tamaño.
 */
export type Adjunto = {
  id: Id;
  nombre: string;
  /** MIME del archivo original. */
  tipo: string;
  /** Bytes del archivo original, para mostrarle el peso al usuario. */
  tamano: number;
  /** Data URL. Las imágenes se comprimen antes de guardarse. */
  contenido: string;
};

export type Oferta = {
  id: Id;
  codigo: string;
  agenciaId: Id;
  titulo: string;
  bloqueServicio: BloqueServicio;
  tipoServicio: TipoServicio;
  origen: string;
  destino: string;
  paradas: Parada[];
  zona: string;
  fechaHoraSalida: FechaISO;
  fechaHoraRetorno?: FechaISO;
  esIdaYVuelta: boolean;
  horasEstimadas: number;
  cantidadPasajeros: number;
  requerimientos: Requerimiento[];
  /** Monto total en CLP, sin decimales. */
  presupuestoReferencial: number;
  tarifaHoraExtra?: number;
  modoAdjudicacion: ModoAdjudicacion;
  ventanaCierreHoras: VentanaCierre;
  expiraEn: FechaISO;
  /** Detalles del servicio en texto libre, escritos por la agencia. */
  notas: string;
  /** Itinerarios y programas que la agencia sube junto al brief. */
  adjuntos: Adjunto[];
  estado: EstadoOferta;
  publicadaEn?: FechaISO;
  createdAt: FechaISO;
};

export type TipoRespuesta = "aceptacion" | "contraoferta";

export type Respuesta = {
  id: Id;
  ofertaId: Id;
  carrierId: Id;
  vehiculoId: Id;
  conductorId: Id;
  tipo: TipoRespuesta;
  monto: number;
  nota: string;
  estado: EstadoRespuesta;
  createdAt: FechaISO;
};

export type Viaje = {
  id: Id;
  ofertaId: Id;
  respuestaGanadoraId: Id;
  agenciaId: Id;
  carrierId: Id;
  vehiculoId: Id;
  conductorId: Id;
  montoFinal: number;
  comision: number;
  montoTransportista: number;
  estado: EstadoViaje;
  codigoAbordaje: string;
  adjudicadoEn: FechaISO;
  iniciadoEn?: FechaISO;
  finalizadoEn?: FechaISO;
  canceladoEn?: FechaISO;
  motivoCancelacion?: string;
  /** Se revelan recién cuando el pago entra al escrow. */
  contactosRevelados: boolean;
};

/**
 * Lista de embarque. La carga la agencia después de adjudicar; el transportista
 * la ve en la hoja de ruta y la imprime.
 */
export type Pasajero = {
  id: Id;
  viajeId: Id;
  nombreCompleto: string;
  /** RUT o pasaporte. */
  documento: string;
  telefono: string;
  puntoRecogida: string;
  observaciones: string;
};

export type Pago = {
  id: Id;
  viajeId: Id;
  montoBruto: number;
  comisionPlataforma: number;
  montoNeto: number;
  estado: EstadoPago;
  fechaRetencion?: FechaISO;
  fechaLiberacion?: FechaISO;
};

// ---------------------------------------------------------------------------
// Flujo 2 — referido
// ---------------------------------------------------------------------------

export type Grupo = {
  id: Id;
  codigo: string;
  carrierId: Id;
  titulo: string;
  origen: string;
  destinoOTour: string;
  zona: string;
  fecha: FechaISO;
  cantidadPasajeros: number;
  ticketEstimadoPorPasajero: number;
  comisionSolicitadaPct: number;
  notas: string;
  estado: EstadoGrupo;
  expiraEn: FechaISO;
  createdAt: FechaISO;
};

export type OfertaGrupo = {
  id: Id;
  grupoId: Id;
  agenciaId: Id;
  ticketPropuestoPorPasajero: number;
  comisionOfrecidaPct: number;
  nota: string;
  estado: EstadoOfertaGrupo;
  createdAt: FechaISO;
};

export type Referido = {
  id: Id;
  grupoId: Id;
  ofertaGrupoId: Id;
  agenciaId: Id;
  carrierId: Id;
  /** Ticket por pasajero × cantidad de pasajeros. */
  ticketTotal: number;
  /** Lo que la agencia le paga al transportista por traerle el grupo. */
  comisionTransportista: number;
  /** El 5% que retiene Rutero de esa comisión. */
  comisionPlataforma: number;
  montoTransportista: number;
  estado: EstadoViaje;
  /** Un grupo suele quedarse también con el viaje: acá se enlazan. */
  viajeId?: Id;
  adjudicadoEn: FechaISO;
};

// ---------------------------------------------------------------------------
// Conversación y calificaciones
// ---------------------------------------------------------------------------

export type Mensaje = {
  id: Id;
  viajeId: Id;
  autorRol: Exclude<Rol, "admin">;
  autorId: Id;
  texto: string;
  createdAt: FechaISO;
  /** Se marca cuando el texto trae un patrón de número telefónico. */
  avisoFugaMostrado: boolean;
};

export type DimensionesAgencia = {
  claridadBrief: number;
  puntualidadPasajeros: number;
  pago: number;
};

export type DimensionesTransportista = {
  puntualidad: number;
  estadoVehiculo: number;
  trato: number;
  comunicacion: number;
};

/** Bidireccional y ciega: se revela cuando ambos califican o pasan 7 días. */
export type Calificacion = {
  id: Id;
  viajeId: Id;
  autorRol: Exclude<Rol, "admin">;
  autorId: Id;
  destinatarioId: Id;
  puntuacionGeneral: number;
  dimensiones: DimensionesAgencia | DimensionesTransportista;
  comentario: string;
  createdAt: FechaISO;
};

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

export type TipoNotificacion =
  | "oferta_calza"
  | "respuesta_recibida"
  | "adjudicacion"
  | "recordatorio_viaje"
  | "pago_liberado"
  | "calificacion_pendiente"
  | "documento_por_vencer";

export type Notificacion = {
  id: Id;
  destinatarioRol: Rol;
  destinatarioId: Id;
  tipo: TipoNotificacion;
  titulo: string;
  detalle: string;
  href: string;
  leida: boolean;
  createdAt: FechaISO;
};

// ---------------------------------------------------------------------------
// Configuración de la plataforma
// ---------------------------------------------------------------------------

export type ConfiguracionComisiones = {
  /** 5% del total del viaje, descontado al transportista al liberar. */
  viajePct: number;
  /** 5% de la comisión de referido que la agencia le paga a la van. */
  referidoPct: number;
};

// ---------------------------------------------------------------------------
// Dataset completo
// ---------------------------------------------------------------------------

export type Datos = {
  agencias: Agencia[];
  transportistas: Transportista[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  documentos: Documento[];
  bloqueosAgenda: BloqueoAgenda[];
  ofertas: Oferta[];
  respuestas: Respuesta[];
  viajes: Viaje[];
  pasajeros: Pasajero[];
  pagos: Pago[];
  grupos: Grupo[];
  ofertasGrupo: OfertaGrupo[];
  referidos: Referido[];
  mensajes: Mensaje[];
  calificaciones: Calificacion[];
  notificaciones: Notificacion[];
  comisiones: ConfiguracionComisiones;
};

/** Quién está encarnado en la demo. No hay login. */
export type Sesion = {
  agenciaId: Id;
  carrierId: Id;
};
