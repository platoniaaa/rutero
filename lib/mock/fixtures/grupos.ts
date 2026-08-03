import type { Grupo, Notificacion, OfertaGrupo, Referido } from "@/lib/mock/types";
import { desglosarReferido } from "@/lib/utils/rules";

import { dias, horas } from "./tiempo";

/**
 * Flujo inverso: el transportista tiene el grupo armado y busca agencia que se
 * lo tome. Va en su propia bandeja, no mezclado con las ofertas de viaje.
 */
export function crearGrupos(hoy: Date): Grupo[] {
  return [
    {
      id: "gr-1",
      codigo: "GP-0001",
      carrierId: "tr-1",
      titulo: "14 personas al Valle Nevado el sábado",
      origen: "Santiago Centro",
      destinoOTour: "Valle Nevado, día de nieve",
      zona: "Cordillera",
      fecha: dias(hoy, 5, "08:00"),
      cantidadPasajeros: 14,
      ticketEstimadoPorPasajero: 45000,
      comisionSolicitadaPct: 10,
      notas:
        "Son pasajeros que me contactaron directo por el recorrido escolar. Necesitan entrada y clase de ski.",
      estado: "con_ofertas",
      expiraEn: horas(hoy, 40),
      createdAt: horas(hoy, -20),
    },
    {
      id: "gr-2",
      codigo: "GP-0002",
      carrierId: "tr-5",
      titulo: "12 personas a Huerquehue",
      origen: "Pucón",
      destinoOTour: "Parque Nacional Huerquehue, trekking",
      zona: "Araucanía",
      fecha: dias(hoy, 8, "08:30"),
      cantidadPasajeros: 12,
      ticketEstimadoPorPasajero: 38000,
      comisionSolicitadaPct: 10,
      notas: "Grupo de mochileros alojando en el centro de Pucón.",
      estado: "publicado",
      expiraEn: dias(hoy, 6, "12:00"),
      createdAt: horas(hoy, -9),
    },
    {
      id: "gr-3",
      codigo: "GP-0003",
      carrierId: "tr-12",
      titulo: "9 personas al Valle de la Luna",
      origen: "San Pedro de Atacama",
      destinoOTour: "Valle de la Luna, atardecer",
      zona: "Antofagasta",
      fecha: dias(hoy, 3, "15:30"),
      cantidadPasajeros: 9,
      ticketEstimadoPorPasajero: 28000,
      comisionSolicitadaPct: 12,
      notas: "Pasajeros del transfer de la mañana que quedaron sin tour.",
      estado: "publicado",
      expiraEn: horas(hoy, 30),
      createdAt: horas(hoy, -5),
    },
    {
      id: "gr-4",
      codigo: "GP-0004",
      carrierId: "tr-3",
      titulo: "16 personas al Cajón del Maipo",
      origen: "Providencia",
      destinoOTour: "Cajón del Maipo y Embalse El Yeso",
      zona: "Santiago",
      fecha: dias(hoy, -9, "07:30"),
      cantidadPasajeros: 16,
      ticketEstimadoPorPasajero: 32000,
      comisionSolicitadaPct: 10,
      notas: "",
      estado: "adjudicado",
      expiraEn: dias(hoy, -12, "12:00"),
      createdAt: dias(hoy, -15, "10:00"),
    },
    {
      id: "gr-5",
      codigo: "GP-0005",
      carrierId: "tr-9",
      titulo: "11 personas a Torres del Paine",
      origen: "Puerto Natales",
      destinoOTour: "Torres del Paine, día completo",
      zona: "Magallanes",
      fecha: dias(hoy, 12, "07:00"),
      cantidadPasajeros: 11,
      ticketEstimadoPorPasajero: 95000,
      comisionSolicitadaPct: 8,
      notas: "Grupo europeo que llega en el bus de la mañana.",
      estado: "publicado",
      expiraEn: dias(hoy, 9, "18:00"),
      createdAt: horas(hoy, -16),
    },
  ];
}

export function crearOfertasGrupo(hoy: Date): OfertaGrupo[] {
  return [
    {
      id: "og-1",
      grupoId: "gr-1",
      agenciaId: "ag-1",
      ticketPropuestoPorPasajero: 48000,
      comisionOfrecidaPct: 10,
      nota: "Tomamos el grupo con entrada y clase incluidas. Mantenemos tu 10%.",
      estado: "activa",
      createdAt: horas(hoy, -14),
    },
    {
      id: "og-2",
      grupoId: "gr-1",
      agenciaId: "ag-2",
      ticketPropuestoPorPasajero: 45000,
      comisionOfrecidaPct: 8,
      nota: "Podemos tomarlo al ticket que propones, pero con 8% de comisión.",
      estado: "activa",
      createdAt: horas(hoy, -10),
    },
    {
      id: "og-3",
      grupoId: "gr-4",
      agenciaId: "ag-1",
      ticketPropuestoPorPasajero: 32000,
      comisionOfrecidaPct: 10,
      nota: "Lo tomamos tal cual.",
      estado: "ganadora",
      createdAt: dias(hoy, -14, "11:00"),
    },
  ];
}

/** El grupo adjudicado, con su comisión ya liquidada. */
export function crearReferidos(hoy: Date): Referido[] {
  const ticketTotal = 16 * 32000;
  const { comisionTransportista, comision, neto } = desglosarReferido(
    ticketTotal,
    10,
  );

  return [
    {
      id: "rf-1",
      grupoId: "gr-4",
      ofertaGrupoId: "og-3",
      agenciaId: "ag-1",
      carrierId: "tr-3",
      ticketTotal,
      comisionTransportista,
      comisionPlataforma: comision,
      montoTransportista: neto,
      estado: "liberada",
      adjudicadoEn: dias(hoy, -14, "15:00"),
    },
  ];
}

/**
 * Bandeja de notificaciones. Cubre los eventos de la sección 8 para las dos
 * cuentas que se encarnan en la demo.
 */
export function crearNotificaciones(hoy: Date): Notificacion[] {
  return [
    {
      id: "no-1",
      destinatarioRol: "agencia",
      destinatarioId: "ag-1",
      tipo: "respuesta_recibida",
      titulo: "4 respuestas en Farellones día completo",
      detalle: "Dos aceptaciones al precio y dos contraofertas. La ventana cierra en menos de dos días.",
      href: "/agencia/ofertas",
      leida: false,
      createdAt: horas(hoy, -9),
    },
    {
      id: "no-2",
      destinatarioRol: "agencia",
      destinatarioId: "ag-1",
      tipo: "respuesta_recibida",
      titulo: "3 respuestas en Viña del Mar y Valparaíso",
      detalle: "Una aceptación al precio y dos contraofertas.",
      href: "/agencia/ofertas",
      leida: false,
      createdAt: horas(hoy, -28),
    },
    {
      id: "no-3",
      destinatarioRol: "agencia",
      destinatarioId: "ag-1",
      tipo: "recordatorio_viaje",
      titulo: "El Colorado con clases de ski sale en 2 días",
      detalle: "Falta cargar la lista de embarque del grupo.",
      href: "/agencia/viajes",
      leida: false,
      createdAt: horas(hoy, -6),
    },
    {
      id: "no-4",
      destinatarioRol: "agencia",
      destinatarioId: "ag-1",
      tipo: "pago_liberado",
      titulo: "Pago liberado del viaje a Pomaire",
      detalle: "Se liberaron $171.000 a Juan Carlos Miranda Soto.",
      href: "/agencia/pagos",
      leida: true,
      createdAt: dias(hoy, -11, "14:10"),
    },
    {
      id: "no-5",
      destinatarioRol: "transportista",
      destinatarioId: "tr-1",
      tipo: "oferta_calza",
      titulo: "Nueva oferta que calza con tu perfil",
      detalle: "Valle Nevado día completo, 15 pasajeros, $310.000 referenciales.",
      href: "/transportista/ofertas",
      leida: false,
      createdAt: horas(hoy, -12),
    },
    {
      id: "no-6",
      destinatarioRol: "transportista",
      destinatarioId: "tr-1",
      tipo: "adjudicacion",
      titulo: "Te adjudicaron El Colorado con clases de ski",
      detalle: "Turismo Aconcagua adjudicó tu aceptación por $280.000. Recibes $266.000.",
      href: "/transportista/viajes",
      leida: true,
      createdAt: dias(hoy, -5, "12:05"),
    },
    {
      id: "no-7",
      destinatarioRol: "transportista",
      destinatarioId: "tr-1",
      tipo: "recordatorio_viaje",
      titulo: "Tu viaje a El Colorado sale en 2 días",
      detalle: "Salida 07:30 desde Hotel Plaza San Francisco. Código RT4XB9.",
      href: "/transportista/viajes",
      leida: false,
      createdAt: horas(hoy, -5),
    },
    {
      id: "no-8",
      destinatarioRol: "transportista",
      destinatarioId: "tr-5",
      tipo: "documento_por_vencer",
      titulo: "Tu licencia profesional vence en 21 días",
      detalle: "Renuévala antes del vencimiento o no vas a poder postular a nuevas ofertas.",
      href: "/transportista/flota",
      leida: false,
      createdAt: horas(hoy, -48),
    },
    {
      id: "no-9",
      destinatarioRol: "transportista",
      destinatarioId: "tr-7",
      tipo: "documento_por_vencer",
      titulo: "Tu inscripción DS 80 está vencida",
      detalle: "Mientras esté vencida no puedes postular a ofertas.",
      href: "/transportista/flota",
      leida: false,
      createdAt: dias(hoy, -23, "09:00"),
    },
    {
      id: "no-10",
      destinatarioRol: "admin",
      destinatarioId: "admin",
      tipo: "documento_por_vencer",
      titulo: "6 documentos esperando revisión",
      detalle: "Patricia Núñez Cortés y Vans del Maipo tienen documentos en cola.",
      href: "/admin/verificacion",
      leida: false,
      createdAt: horas(hoy, -20),
    },
  ];
}
