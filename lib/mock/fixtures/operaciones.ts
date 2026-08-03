import type {
  Calificacion,
  Mensaje,
  Pago,
  Pasajero,
  Respuesta,
  Viaje,
} from "@/lib/mock/types";
import { desglosarViaje } from "@/lib/utils/rules";

import { dias, horas, minutos } from "./tiempo";

/**
 * Respuestas de los transportistas: aceptaciones al precio publicado y
 * contraofertas con su nota. La capacidad del vehículo cubre siempre los
 * pasajeros de la oferta, y la licencia del conductor cubre la capacidad del
 * vehículo — si no, la postulación habría quedado bloqueada.
 */
export function crearRespuestas(hoy: Date): Respuesta[] {
  return [
    // --- of-9: Farellones día completo, 15 pax, $280.000 ---
    {
      id: "re-1",
      ofertaId: "of-9",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      tipo: "aceptacion",
      monto: 280000,
      nota: "Disponible. Llevo cadenas y portaequipaje para 15 pares de esquíes.",
      estado: "activa",
      createdAt: horas(hoy, -26),
    },
    {
      id: "re-2",
      ofertaId: "of-9",
      carrierId: "tr-3",
      vehiculoId: "ve-3",
      conductorId: "co-3",
      tipo: "contraoferta",
      monto: 295000,
      nota: "Sprinter 2022 con calefacción reforzada. El monto incluye cadenas y peaje de la cuesta.",
      estado: "activa",
      createdAt: horas(hoy, -24),
    },
    {
      id: "re-3",
      ofertaId: "of-9",
      carrierId: "tr-10",
      vehiculoId: "ve-11",
      conductorId: "co-11",
      tipo: "contraoferta",
      monto: 305000,
      nota: "Con niños en el grupo mandamos conductor con experiencia en la subida. Incluye sillas si hacen falta.",
      estado: "activa",
      createdAt: horas(hoy, -20),
    },
    {
      id: "re-4",
      ofertaId: "of-9",
      carrierId: "tr-11",
      vehiculoId: "ve-15",
      conductorId: "co-15",
      tipo: "aceptacion",
      monto: 280000,
      nota: "",
      estado: "activa",
      createdAt: horas(hoy, -9),
    },

    // --- of-10: Viña y Valparaíso, 19 pax, $340.000 ---
    {
      id: "re-5",
      ofertaId: "of-10",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      tipo: "contraoferta",
      monto: 365000,
      nota: "Son 12 horas de servicio con espera en los dos cerros. Incluye estacionamientos.",
      estado: "activa",
      createdAt: horas(hoy, -34),
    },
    {
      id: "re-6",
      ofertaId: "of-10",
      carrierId: "tr-10",
      vehiculoId: "ve-10",
      conductorId: "co-10",
      tipo: "aceptacion",
      monto: 340000,
      nota: "Conductor con inglés fluido.",
      estado: "activa",
      createdAt: horas(hoy, -30),
    },
    {
      id: "re-7",
      ofertaId: "of-10",
      carrierId: "tr-10",
      vehiculoId: "ve-12",
      conductorId: "co-13",
      tipo: "contraoferta",
      monto: 355000,
      nota: "Alternativa con minibús de 25 asientos por si el grupo crece.",
      estado: "activa",
      createdAt: horas(hoy, -28),
    },

    // --- of-11: Cajón del Maipo, 15 pax, $265.000 ---
    {
      id: "re-8",
      ofertaId: "of-11",
      carrierId: "tr-11",
      vehiculoId: "ve-16",
      conductorId: "co-16",
      tipo: "aceptacion",
      monto: 265000,
      nota: "Hacemos ese circuito todas las semanas.",
      estado: "activa",
      createdAt: horas(hoy, -18),
    },
    {
      id: "re-9",
      ofertaId: "of-11",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      tipo: "contraoferta",
      monto: 285000,
      nota: "El ripio hasta el embalse castiga la suspensión, por eso el ajuste.",
      estado: "activa",
      createdAt: horas(hoy, -15),
    },

    // --- of-12: Torres del Paine, 3 días, 17 pax, $860.000 ---
    {
      id: "re-10",
      ofertaId: "of-12",
      carrierId: "tr-9",
      vehiculoId: "ve-9",
      conductorId: "co-9",
      tipo: "contraoferta",
      monto: 920000,
      nota: "Tres jornadas completas con el conductor pernoctando en el parque.",
      estado: "retirada",
      createdAt: horas(hoy, -38),
    },
    {
      id: "re-11",
      ofertaId: "of-12",
      carrierId: "tr-9",
      vehiculoId: "ve-9",
      conductorId: "co-9",
      tipo: "contraoferta",
      monto: 890000,
      nota: "Ajusto a $890.000 si confirman antes del viernes.",
      estado: "activa",
      createdAt: horas(hoy, -16),
    },

    // --- of-13: Lagunas Altiplánicas, 12 pax, $285.000 ---
    {
      id: "re-12",
      ofertaId: "of-13",
      carrierId: "tr-12",
      vehiculoId: "ve-19",
      conductorId: "co-20",
      tipo: "aceptacion",
      monto: 285000,
      nota: "Salimos a esa hora todos los días, sin problema con la altura.",
      estado: "activa",
      createdAt: horas(hoy, -26),
    },

    // --- of-14: Isla Negra, 14 pax, $300.000 ---
    {
      id: "re-13",
      ofertaId: "of-14",
      carrierId: "tr-10",
      vehiculoId: "ve-13",
      conductorId: "co-12",
      tipo: "aceptacion",
      monto: 300000,
      nota: "",
      estado: "activa",
      createdAt: horas(hoy, -8),
    },
    {
      id: "re-14",
      ofertaId: "of-14",
      carrierId: "tr-11",
      vehiculoId: "ve-15",
      conductorId: "co-15",
      tipo: "contraoferta",
      monto: 315000,
      nota: "Desde Viña son dos horas de posicionamiento antes de empezar.",
      estado: "activa",
      createdAt: horas(hoy, -6),
    },

    // --- of-15: Frutillar medio día, 14 pax, $170.000 ---
    {
      id: "re-15",
      ofertaId: "of-15",
      carrierId: "tr-4",
      vehiculoId: "ve-4",
      conductorId: "co-4",
      tipo: "aceptacion",
      monto: 170000,
      nota: "Tengo la tarde libre ese día.",
      estado: "activa",
      createdAt: horas(hoy, -11),
    },

    // --- of-16: transfer aeropuerto, adjudicación automática ---
    {
      id: "re-16",
      ofertaId: "of-16",
      carrierId: "tr-3",
      vehiculoId: "ve-3",
      conductorId: "co-3",
      tipo: "aceptacion",
      monto: 75000,
      nota: "",
      estado: "ganadora",
      createdAt: horas(hoy, -44),
    },

    // --- of-17: El Colorado, adjudicada a tr-1 ---
    {
      id: "re-17",
      ofertaId: "of-17",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      tipo: "aceptacion",
      monto: 280000,
      nota: "Confirmo con cadenas y portaequipaje.",
      estado: "ganadora",
      createdAt: dias(hoy, -6, "12:20"),
    },
    {
      id: "re-18",
      ofertaId: "of-17",
      carrierId: "tr-11",
      vehiculoId: "ve-16",
      conductorId: "co-16",
      tipo: "contraoferta",
      monto: 290000,
      nota: "Incluye parada en Farellones para el arriendo de equipos.",
      estado: "rechazada",
      createdAt: dias(hoy, -6, "15:40"),
    },

    // --- of-18: Casapiedra, en curso ---
    {
      id: "re-19",
      ofertaId: "of-18",
      carrierId: "tr-10",
      vehiculoId: "ve-12",
      conductorId: "co-13",
      tipo: "aceptacion",
      monto: 120000,
      nota: "Minibús de 25 asientos, queda justo para el grupo.",
      estado: "ganadora",
      createdAt: dias(hoy, -4, "13:00"),
    },

    // --- of-19: Huerquehue, finalizado ayer ---
    {
      id: "re-20",
      ofertaId: "of-19",
      carrierId: "tr-5",
      vehiculoId: "ve-5",
      conductorId: "co-5",
      tipo: "aceptacion",
      monto: 270000,
      nota: "",
      estado: "ganadora",
      createdAt: dias(hoy, -7, "10:30"),
    },

    // --- of-20: Calama a San Pedro, pago liberado ---
    {
      id: "re-21",
      ofertaId: "of-20",
      carrierId: "tr-12",
      vehiculoId: "ve-19",
      conductorId: "co-20",
      tipo: "aceptacion",
      monto: 175000,
      nota: "",
      estado: "ganadora",
      createdAt: dias(hoy, -5, "15:20"),
    },

    // --- of-21: Pomaire, cerrado y calificado ---
    {
      id: "re-22",
      ofertaId: "of-21",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      tipo: "aceptacion",
      monto: 180000,
      nota: "",
      estado: "ganadora",
      createdAt: dias(hoy, -18, "09:00"),
    },
    {
      id: "re-23",
      ofertaId: "of-21",
      carrierId: "tr-3",
      vehiculoId: "ve-3",
      conductorId: "co-3",
      tipo: "contraoferta",
      monto: 195000,
      nota: "Incluye espera en el pueblo.",
      estado: "rechazada",
      createdAt: dias(hoy, -18, "11:15"),
    },

    // --- of-22: Puerto Montt a Puerto Varas, cerrado ---
    {
      id: "re-24",
      ofertaId: "of-22",
      carrierId: "tr-4",
      vehiculoId: "ve-4",
      conductorId: "co-4",
      tipo: "aceptacion",
      monto: 80000,
      nota: "",
      estado: "ganadora",
      createdAt: dias(hoy, -20, "17:10"),
    },
  ];
}

type SemillaViaje = {
  id: string;
  ofertaId: string;
  respuestaGanadoraId: string;
  agenciaId: string;
  carrierId: string;
  vehiculoId: string;
  conductorId: string;
  monto: number;
  estado: Viaje["estado"];
  codigoAbordaje: string;
  adjudicadoDiasAtras: number;
  iniciadoEn?: string;
  finalizadoEn?: string;
};

/** Un viaje por cada oferta adjudicada o cerrada, en distintos puntos de la máquina de estados. */
export function crearViajes(hoy: Date): Viaje[] {
  const semillas: SemillaViaje[] = [
    {
      id: "vi-1",
      ofertaId: "of-16",
      respuestaGanadoraId: "re-16",
      agenciaId: "ag-1",
      carrierId: "tr-3",
      vehiculoId: "ve-3",
      conductorId: "co-3",
      monto: 75000,
      estado: "pago_retenido",
      codigoAbordaje: "RT7K2M",
      adjudicadoDiasAtras: 2,
    },
    {
      id: "vi-2",
      ofertaId: "of-17",
      respuestaGanadoraId: "re-17",
      agenciaId: "ag-1",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      monto: 280000,
      estado: "pago_retenido",
      codigoAbordaje: "RT4XB9",
      adjudicadoDiasAtras: 5,
    },
    {
      id: "vi-3",
      ofertaId: "of-18",
      respuestaGanadoraId: "re-19",
      agenciaId: "ag-2",
      carrierId: "tr-10",
      vehiculoId: "ve-12",
      conductorId: "co-13",
      monto: 120000,
      estado: "en_curso",
      codigoAbordaje: "RT9PL3",
      adjudicadoDiasAtras: 4,
      iniciadoEn: horas(hoy, -3),
    },
    {
      id: "vi-4",
      ofertaId: "of-19",
      respuestaGanadoraId: "re-20",
      agenciaId: "ag-8",
      carrierId: "tr-5",
      vehiculoId: "ve-5",
      conductorId: "co-5",
      monto: 270000,
      estado: "finalizada",
      codigoAbordaje: "RT2VD8",
      adjudicadoDiasAtras: 7,
      iniciadoEn: dias(hoy, -1, "08:05"),
      finalizadoEn: dias(hoy, -1, "18:40"),
    },
    {
      id: "vi-5",
      ofertaId: "of-20",
      respuestaGanadoraId: "re-21",
      agenciaId: "ag-7",
      carrierId: "tr-12",
      vehiculoId: "ve-19",
      conductorId: "co-20",
      monto: 175000,
      estado: "liberada",
      codigoAbordaje: "RT6HS1",
      adjudicadoDiasAtras: 5,
      iniciadoEn: dias(hoy, -2, "12:00"),
      finalizadoEn: dias(hoy, -2, "14:50"),
    },
    {
      id: "vi-6",
      ofertaId: "of-21",
      respuestaGanadoraId: "re-22",
      agenciaId: "ag-1",
      carrierId: "tr-1",
      vehiculoId: "ve-1",
      conductorId: "co-1",
      monto: 180000,
      estado: "liberada",
      codigoAbordaje: "RT3JW5",
      adjudicadoDiasAtras: 17,
      iniciadoEn: dias(hoy, -12, "09:05"),
      finalizadoEn: dias(hoy, -12, "14:10"),
    },
    {
      id: "vi-7",
      ofertaId: "of-22",
      respuestaGanadoraId: "re-24",
      agenciaId: "ag-6",
      carrierId: "tr-4",
      vehiculoId: "ve-4",
      conductorId: "co-4",
      monto: 80000,
      estado: "liberada",
      codigoAbordaje: "RT8QN4",
      adjudicadoDiasAtras: 20,
      iniciadoEn: dias(hoy, -18, "13:35"),
      finalizadoEn: dias(hoy, -18, "15:20"),
    },
  ];

  return semillas.map((s) => {
    const { comision, neto } = desglosarViaje(s.monto);
    return {
      id: s.id,
      ofertaId: s.ofertaId,
      respuestaGanadoraId: s.respuestaGanadoraId,
      agenciaId: s.agenciaId,
      carrierId: s.carrierId,
      vehiculoId: s.vehiculoId,
      conductorId: s.conductorId,
      montoFinal: s.monto,
      comision,
      montoTransportista: neto,
      estado: s.estado,
      codigoAbordaje: s.codigoAbordaje,
      adjudicadoEn: dias(hoy, -s.adjudicadoDiasAtras, "12:00"),
      iniciadoEn: s.iniciadoEn,
      finalizadoEn: s.finalizadoEn,
      // Se revelan al entrar el pago al escrow; todos estos ya pagaron.
      contactosRevelados: true,
    } satisfies Viaje;
  });
}

/** El pago sigue al viaje: se retiene al confirmar y se libera 24 h después de finalizado. */
export function crearPagos(hoy: Date, viajes: Viaje[]): Pago[] {
  return viajes.map((viaje) => {
    const liberado = viaje.estado === "liberada";
    return {
      id: `pa-${viaje.id}`,
      viajeId: viaje.id,
      montoBruto: viaje.montoFinal,
      comisionPlataforma: viaje.comision,
      montoNeto: viaje.montoTransportista,
      estado: liberado ? "liberado" : "retenido",
      fechaRetencion: viaje.adjudicadoEn,
      fechaLiberacion:
        liberado && viaje.finalizadoEn
          ? horas(new Date(viaje.finalizadoEn), 24)
          : undefined,
    } satisfies Pago;
  });
}

/**
 * Lista de embarque. La agencia la carga después de adjudicar; el conductor la
 * imprime y la lleva en la mano.
 */
export function crearPasajeros(): Pasajero[] {
  const grupoColorado: Omit<Pasajero, "id" | "viajeId">[] = [
    {
      nombreCompleto: "Andrea Solís Bravo",
      documento: "16552398-9",
      telefono: "56961234567",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "",
    },
    {
      nombreCompleto: "Tomás Solís Herrera",
      documento: "12907441-8",
      telefono: "56961234567",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "Menor de edad, 9 años",
    },
    {
      nombreCompleto: "Emilia Solís Herrera",
      documento: "18334025-5",
      telefono: "56961234567",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "Menor de edad, 12 años",
    },
    {
      nombreCompleto: "Ricardo Herrera Pinto",
      documento: "14776680-7",
      telefono: "56962345678",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "",
    },
    {
      nombreCompleto: "Sofía Mendoza Cruz",
      documento: "AR 38.442.109",
      telefono: "5491145678900",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "Pasaporte argentino",
    },
    {
      nombreCompleto: "Diego Mendoza Ruiz",
      documento: "AR 22.115.804",
      telefono: "5491145678900",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Claudia Ortega Vidal",
      documento: "10558214-5",
      telefono: "56963456789",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "Alergia a los frutos secos",
    },
    {
      nombreCompleto: "Nicolás Ortega Fuentes",
      documento: "19221507-2",
      telefono: "56963456789",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Javiera Paredes Lira",
      documento: "13065972-1",
      telefono: "56964567890",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Felipe Paredes Lira",
      documento: "17849336-1",
      telefono: "56964567890",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Marcia Bustamante Rojas",
      documento: "15334782-4",
      telefono: "56965678901",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "",
    },
    {
      nombreCompleto: "Ernesto Bustamante Silva",
      documento: "11220945-6",
      telefono: "56965678901",
      puntoRecogida: "Hotel Plaza San Francisco",
      observaciones: "Usa bastón, requiere asiento delantero",
    },
    {
      nombreCompleto: "Laura Vergara Peña",
      documento: "18775430-1",
      telefono: "56966789012",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Sebastián Vergara Peña",
      documento: "20114563-8",
      telefono: "56966789012",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
    {
      nombreCompleto: "Ignacia Fuenzalida Toro",
      documento: "16998231-5",
      telefono: "56967890123",
      puntoRecogida: "Apumanque, Las Condes",
      observaciones: "",
    },
  ];

  return grupoColorado.map((pasajero, indice) => ({
    id: `pax-vi-2-${indice + 1}`,
    viajeId: "vi-2",
    ...pasajero,
  }));
}

/** Chat del viaje. El aviso suave salta cuando alguien pasa un teléfono. */
export function crearMensajes(hoy: Date): Mensaje[] {
  return [
    {
      id: "me-1",
      viajeId: "vi-2",
      autorRol: "agencia",
      autorId: "ag-1",
      texto:
        "Hola Juan Carlos, confirmamos el grupo para el sábado. Son 15 personas, cuatro niños entre ellos.",
      createdAt: dias(hoy, -5, "13:10"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-2",
      viajeId: "vi-2",
      autorRol: "transportista",
      autorId: "tr-1",
      texto:
        "Perfecto. Salgo a las 07:30 desde el hotel y paso por Apumanque a las 08:00. Llevo cadenas y portaequipaje.",
      createdAt: dias(hoy, -5, "13:35"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-3",
      viajeId: "vi-2",
      autorRol: "agencia",
      autorId: "ag-1",
      texto: "¿Hay espacio para 15 pares de esquíes o conviene arrendar arriba?",
      createdAt: dias(hoy, -4, "09:20"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-4",
      viajeId: "vi-2",
      autorRol: "transportista",
      autorId: "tr-1",
      texto:
        "Caben los 15 sin problema en el portaequipaje. Si quieren arrendar igual, en Farellones hay una parada de 20 minutos.",
      createdAt: dias(hoy, -4, "09:44"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-5",
      viajeId: "vi-2",
      autorRol: "agencia",
      autorId: "ag-1",
      texto:
        "Dale. Cualquier cosa el día del viaje me llamas al 9 6123 4567 que ando con el grupo.",
      createdAt: dias(hoy, -3, "17:02"),
      avisoFugaMostrado: true,
    },
    {
      id: "me-6",
      viajeId: "vi-2",
      autorRol: "transportista",
      autorId: "tr-1",
      texto: "Anotado. Nos vemos el sábado a las 07:30.",
      createdAt: minutos(hoy, -180),
      avisoFugaMostrado: false,
    },
    {
      id: "me-7",
      viajeId: "vi-1",
      autorRol: "agencia",
      autorId: "ag-1",
      texto:
        "Marcela, el vuelo llega 16:30 pero puede atrasarse. ¿Cuánto rato pueden esperar?",
      createdAt: dias(hoy, -2, "10:15"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-8",
      viajeId: "vi-1",
      autorRol: "transportista",
      autorId: "tr-3",
      texto: "Esperamos hasta una hora sin costo. Después se cobra hora extra.",
      createdAt: dias(hoy, -2, "10:31"),
      avisoFugaMostrado: false,
    },
    {
      id: "me-9",
      viajeId: "vi-3",
      autorRol: "transportista",
      autorId: "tr-10",
      texto: "Grupo arriba, salimos a Casapiedra.",
      createdAt: horas(hoy, -3),
      avisoFugaMostrado: false,
    },
  ];
}

/**
 * Calificaciones bidireccionales. En vi-6 y vi-7 calificaron los dos lados; en
 * vi-5 solo la agencia, así que la del transportista sigue oculta.
 */
export function crearCalificaciones(hoy: Date): Calificacion[] {
  return [
    {
      id: "ca-1",
      viajeId: "vi-6",
      autorRol: "agencia",
      autorId: "ag-1",
      destinatarioId: "tr-1",
      puntuacionGeneral: 5,
      dimensiones: {
        puntualidad: 5,
        estadoVehiculo: 5,
        trato: 5,
        comunicacion: 4,
      },
      comentario:
        "Juan Carlos llegó antes de la hora y la van impecable. Lo pedimos de nuevo.",
      createdAt: dias(hoy, -11, "10:00"),
    },
    {
      id: "ca-2",
      viajeId: "vi-6",
      autorRol: "transportista",
      autorId: "tr-1",
      destinatarioId: "ag-1",
      puntuacionGeneral: 5,
      dimensiones: {
        claridadBrief: 5,
        puntualidadPasajeros: 4,
        pago: 5,
      },
      comentario: "Brief claro y el pago se liberó al tiro. Todo bien.",
      createdAt: dias(hoy, -11, "18:30"),
    },
    {
      id: "ca-3",
      viajeId: "vi-7",
      autorRol: "agencia",
      autorId: "ag-6",
      destinatarioId: "tr-4",
      puntuacionGeneral: 4,
      dimensiones: {
        puntualidad: 4,
        estadoVehiculo: 4,
        trato: 5,
        comunicacion: 4,
      },
      comentario: "Buen servicio. El vehículo podría estar un poco más nuevo.",
      createdAt: dias(hoy, -17, "11:20"),
    },
    {
      id: "ca-4",
      viajeId: "vi-7",
      autorRol: "transportista",
      autorId: "tr-4",
      destinatarioId: "ag-6",
      puntuacionGeneral: 5,
      dimensiones: {
        claridadBrief: 5,
        puntualidadPasajeros: 5,
        pago: 5,
      },
      comentario: "",
      createdAt: dias(hoy, -17, "20:05"),
    },
    {
      id: "ca-5",
      viajeId: "vi-5",
      autorRol: "agencia",
      autorId: "ag-7",
      destinatarioId: "tr-12",
      puntuacionGeneral: 5,
      dimensiones: {
        puntualidad: 5,
        estadoVehiculo: 5,
        trato: 5,
        comunicacion: 5,
      },
      comentario: "Recogida puntual en el aeropuerto pese al atraso del vuelo.",
      createdAt: dias(hoy, -1, "09:30"),
    },
  ];
}
