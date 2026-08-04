"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  contieneTelefono,
  desglosarReferido,
  desglosarViaje,
} from "@/lib/utils/rules";
import { SESION_DEMO, crearSeed } from "@/lib/mock/fixtures";
import type {
  Calificacion,
  Conductor,
  Datos,
  Documento,
  Grupo,
  Id,
  NuevoBloqueo,
  Oferta,
  OfertaGrupo,
  Pasajero,
  Respuesta,
  Sesion,
  TipoRespuesta,
  Vehiculo,
  Viaje,
} from "@/lib/mock/types";

/** Súbela cada vez que cambien las fixtures: regenera el seed guardado. */
const VERSION_SEED = 3;

/** Ids incrementales sobre el prefijo de cada colección. */
function nuevoId(prefijo: string, existentes: { id: string }[]): string {
  const maximo = existentes.reduce((mayor, item) => {
    const n = Number(item.id.split("-").pop());
    return Number.isFinite(n) && n > mayor ? n : mayor;
  }, 0);
  return `${prefijo}-${maximo + 1}`;
}

function ahora(): string {
  return new Date().toISOString();
}

/** `RT-0026` a partir del último código usado. */
function siguienteCodigo(prefijo: string, codigos: string[]): string {
  const maximo = codigos.reduce((mayor, codigo) => {
    const n = Number(codigo.split("-").pop());
    return Number.isFinite(n) && n > mayor ? n : mayor;
  }, 0);
  return `${prefijo}-${String(maximo + 1).padStart(4, "0")}`;
}

/** Código de abordaje de seis caracteres, legible en voz alta. */
function codigoAbordaje(semilla: string): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  for (let i = 0; i < semilla.length; i += 1) {
    hash = (hash * 31 + semilla.charCodeAt(i)) >>> 0;
  }
  let codigo = "RT";
  let resto = hash;
  for (let i = 0; i < 4; i += 1) {
    codigo += alfabeto[resto % alfabeto.length];
    resto = Math.floor(resto / alfabeto.length);
  }
  return codigo;
}

type Acciones = {
  // --- Ofertas ---
  crearOferta: (
    borrador: Omit<Oferta, "id" | "codigo" | "createdAt" | "estado">,
  ) => Id;
  actualizarOferta: (ofertaId: Id, cambios: Partial<Oferta>) => void;
  publicarOferta: (ofertaId: Id) => void;
  cancelarOferta: (ofertaId: Id) => void;

  // --- Respuestas ---
  responder: (entrada: {
    ofertaId: Id;
    carrierId: Id;
    vehiculoId: Id;
    conductorId: Id;
    tipo: TipoRespuesta;
    monto: number;
    nota: string;
  }) => Id;
  retirarRespuesta: (respuestaId: Id) => void;

  // --- Adjudicación y viaje ---
  adjudicar: (respuestaId: Id) => Id | null;
  pagarEscrow: (viajeId: Id) => void;
  marcarEnCurso: (viajeId: Id) => void;
  marcarFinalizada: (viajeId: Id) => void;
  confirmarViaje: (viajeId: Id) => void;
  abrirDisputa: (viajeId: Id, motivo: string) => void;
  liberarPago: (viajeId: Id) => void;
  cancelarViaje: (
    viajeId: Id,
    quien: "agencia" | "transportista",
    motivo: string,
  ) => void;

  // --- Lista de embarque ---
  agregarPasajeros: (viajeId: Id, pasajeros: Omit<Pasajero, "id" | "viajeId">[]) => void;
  eliminarPasajero: (pasajeroId: Id) => void;

  // --- Chat ---
  enviarMensaje: (entrada: {
    viajeId: Id;
    autorRol: "agencia" | "transportista";
    autorId: Id;
    texto: string;
  }) => void;

  // --- Calificaciones ---
  calificar: (calificacion: Omit<Calificacion, "id" | "createdAt">) => void;

  // --- Flota y agenda ---
  agregarVehiculo: (vehiculo: Omit<Vehiculo, "id">) => Id;
  actualizarVehiculo: (vehiculoId: Id, cambios: Partial<Vehiculo>) => void;
  eliminarVehiculo: (vehiculoId: Id) => void;
  agregarConductor: (conductor: Omit<Conductor, "id">) => Id;
  actualizarConductor: (conductorId: Id, cambios: Partial<Conductor>) => void;
  eliminarConductor: (conductorId: Id) => void;
  agregarBloqueo: (bloqueo: NuevoBloqueo) => void;
  eliminarBloqueo: (bloqueoId: Id) => void;

  // --- Documentos ---
  subirDocumento: (documento: Omit<Documento, "id" | "estado">) => void;
  aprobarDocumento: (documentoId: Id) => void;
  rechazarDocumento: (documentoId: Id, motivo: string) => void;

  // --- Grupos de pasajeros ---
  publicarGrupo: (
    grupo: Omit<Grupo, "id" | "codigo" | "createdAt" | "estado">,
  ) => Id;
  responderGrupo: (oferta: Omit<OfertaGrupo, "id" | "createdAt" | "estado">) => void;
  adjudicarGrupo: (ofertaGrupoId: Id) => void;
  /** La agencia deposita la comisión del transportista en escrow. */
  pagarEscrowReferido: (referidoId: Id) => void;
  /** Tour completado: se libera la comisión menos el fee de Rutero. */
  liberarReferido: (referidoId: Id) => void;
  enlazarGrupoConViaje: (referidoId: Id, viajeId: Id) => void;

  // --- Verificación y configuración ---
  actualizarVerificacion: (
    tipo: "agencia" | "transportista",
    cuentaId: Id,
    estado: Datos["agencias"][number]["estadoVerificacion"],
  ) => void;
  actualizarComisiones: (cambios: Partial<Datos["comisiones"]>) => void;

  // --- Notificaciones ---
  marcarNotificacionLeida: (notificacionId: Id) => void;
  marcarTodasLeidas: (destinatarioId: Id) => void;

  // --- Demo ---
  reiniciarDemo: () => void;
};

export type RuteroState = {
  datos: Datos;
  sesion: Sesion;
} & Acciones;

export const useRutero = create<RuteroState>()(
  persist(
    (set, get) => ({
      datos: crearSeed(new Date()),
      sesion: SESION_DEMO,

      // ---------------------------------------------------------------------
      // Ofertas
      // ---------------------------------------------------------------------
      crearOferta: (borrador) => {
        const { ofertas } = get().datos;
        const id = nuevoId("of", ofertas);
        const oferta: Oferta = {
          ...borrador,
          id,
          codigo: siguienteCodigo(
            "RT",
            ofertas.map((o) => o.codigo),
          ),
          estado: "borrador",
          createdAt: ahora(),
        };
        set((s) => ({ datos: { ...s.datos, ofertas: [...s.datos.ofertas, oferta] } }));
        return id;
      },

      actualizarOferta: (ofertaId, cambios) =>
        set((s) => ({
          datos: {
            ...s.datos,
            ofertas: s.datos.ofertas.map((o) =>
              o.id === ofertaId ? { ...o, ...cambios } : o,
            ),
          },
        })),

      publicarOferta: (ofertaId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            ofertas: s.datos.ofertas.map((o) => {
              if (o.id !== ofertaId) return o;
              const publicadaEn = ahora();
              return {
                ...o,
                estado: "publicada" as const,
                publicadaEn,
                expiraEn: new Date(
                  Date.now() + o.ventanaCierreHoras * 3_600_000,
                ).toISOString(),
              };
            }),
          },
        })),

      cancelarOferta: (ofertaId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            ofertas: s.datos.ofertas.map((o) =>
              o.id === ofertaId ? { ...o, estado: "cancelada" as const } : o,
            ),
            respuestas: s.datos.respuestas.map((r) =>
              r.ofertaId === ofertaId && r.estado === "activa"
                ? { ...r, estado: "rechazada" as const }
                : r,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Respuestas
      // ---------------------------------------------------------------------
      responder: (entrada) => {
        const id = nuevoId("re", get().datos.respuestas);
        const respuesta: Respuesta = {
          ...entrada,
          id,
          estado: "activa",
          createdAt: ahora(),
        };

        set((s) => ({
          datos: {
            ...s.datos,
            respuestas: [...s.datos.respuestas, respuesta],
            // La primera respuesta mueve la oferta a "con respuestas".
            ofertas: s.datos.ofertas.map((o) =>
              o.id === entrada.ofertaId && o.estado === "publicada"
                ? { ...o, estado: "con_respuestas" as const }
                : o,
            ),
          },
        }));

        // Con adjudicación automática, la primera aceptación al precio cierra.
        const oferta = get().datos.ofertas.find((o) => o.id === entrada.ofertaId);
        if (
          oferta?.modoAdjudicacion === "automatico_primero" &&
          entrada.tipo === "aceptacion"
        ) {
          get().adjudicar(id);
        }

        return id;
      },

      retirarRespuesta: (respuestaId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            respuestas: s.datos.respuestas.map((r) =>
              r.id === respuestaId ? { ...r, estado: "retirada" as const } : r,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Adjudicación
      // ---------------------------------------------------------------------
      adjudicar: (respuestaId) => {
        const { datos } = get();
        const respuesta = datos.respuestas.find((r) => r.id === respuestaId);
        if (!respuesta) return null;

        const oferta = datos.ofertas.find((o) => o.id === respuesta.ofertaId);
        if (!oferta) return null;

        const viajeId = nuevoId("vi", datos.viajes);
        const { comision, neto } = desglosarViaje(
          respuesta.monto,
          datos.comisiones.viajePct,
        );

        const viaje: Viaje = {
          id: viajeId,
          ofertaId: oferta.id,
          respuestaGanadoraId: respuesta.id,
          agenciaId: oferta.agenciaId,
          carrierId: respuesta.carrierId,
          vehiculoId: respuesta.vehiculoId,
          conductorId: respuesta.conductorId,
          montoFinal: respuesta.monto,
          comision,
          montoTransportista: neto,
          estado: "confirmada",
          codigoAbordaje: codigoAbordaje(`${oferta.id}-${respuesta.id}`),
          adjudicadoEn: ahora(),
          // Los contactos se revelan recién cuando entra el pago al escrow.
          contactosRevelados: false,
        };

        set((s) => ({
          datos: {
            ...s.datos,
            viajes: [...s.datos.viajes, viaje],
            pagos: [
              ...s.datos.pagos,
              {
                id: `pa-${viajeId}`,
                viajeId,
                montoBruto: respuesta.monto,
                comisionPlataforma: comision,
                montoNeto: neto,
                estado: "pendiente" as const,
              },
            ],
            ofertas: s.datos.ofertas.map((o) =>
              o.id === oferta.id ? { ...o, estado: "adjudicada" as const } : o,
            ),
            // Adjudicar rechaza automáticamente el resto de las respuestas.
            respuestas: s.datos.respuestas.map((r) => {
              if (r.id === respuestaId) return { ...r, estado: "ganadora" as const };
              if (r.ofertaId === oferta.id && r.estado === "activa") {
                return { ...r, estado: "rechazada" as const };
              }
              return r;
            }),
          },
        }));

        return viajeId;
      },

      pagarEscrow: (viajeId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId
                ? { ...v, estado: "pago_retenido" as const, contactosRevelados: true }
                : v,
            ),
            pagos: s.datos.pagos.map((p) =>
              p.viajeId === viajeId
                ? { ...p, estado: "retenido" as const, fechaRetencion: ahora() }
                : p,
            ),
          },
        })),

      marcarEnCurso: (viajeId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId
                ? { ...v, estado: "en_curso" as const, iniciadoEn: ahora() }
                : v,
            ),
          },
        })),

      marcarFinalizada: (viajeId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId
                ? { ...v, estado: "finalizada" as const, finalizadoEn: ahora() }
                : v,
            ),
          },
        })),

      confirmarViaje: (viajeId) => get().liberarPago(viajeId),

      abrirDisputa: (viajeId, motivo) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId
                ? { ...v, estado: "en_disputa" as const, motivoCancelacion: motivo }
                : v,
            ),
            pagos: s.datos.pagos.map((p) =>
              p.viajeId === viajeId ? { ...p, estado: "en_disputa" as const } : p,
            ),
          },
        })),

      liberarPago: (viajeId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId ? { ...v, estado: "liberada" as const } : v,
            ),
            pagos: s.datos.pagos.map((p) =>
              p.viajeId === viajeId
                ? { ...p, estado: "liberado" as const, fechaLiberacion: ahora() }
                : p,
            ),
            ofertas: s.datos.ofertas.map((o) => {
              const viaje = s.datos.viajes.find((v) => v.id === viajeId);
              return viaje && o.id === viaje.ofertaId
                ? { ...o, estado: "cerrada" as const }
                : o;
            }),
          },
        })),

      cancelarViaje: (viajeId, quien, motivo) =>
        set((s) => ({
          datos: {
            ...s.datos,
            viajes: s.datos.viajes.map((v) =>
              v.id === viajeId
                ? {
                    ...v,
                    estado:
                      quien === "agencia"
                        ? ("cancelada_agencia" as const)
                        : ("cancelada_transportista" as const),
                    canceladoEn: ahora(),
                    motivoCancelacion: motivo,
                  }
                : v,
            ),
            pagos: s.datos.pagos.map((p) =>
              p.viajeId === viajeId ? { ...p, estado: "reembolsado" as const } : p,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Lista de embarque
      // ---------------------------------------------------------------------
      agregarPasajeros: (viajeId, pasajeros) =>
        set((s) => {
          const existentes = s.datos.pasajeros;
          const nuevos = pasajeros.map((pasajero, indice) => ({
            ...pasajero,
            id: `pax-${viajeId}-${existentes.filter((p) => p.viajeId === viajeId).length + indice + 1}`,
            viajeId,
          }));
          return { datos: { ...s.datos, pasajeros: [...existentes, ...nuevos] } };
        }),

      eliminarPasajero: (pasajeroId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            pasajeros: s.datos.pasajeros.filter((p) => p.id !== pasajeroId),
          },
        })),

      // ---------------------------------------------------------------------
      // Chat
      // ---------------------------------------------------------------------
      enviarMensaje: ({ viajeId, autorRol, autorId, texto }) =>
        set((s) => ({
          datos: {
            ...s.datos,
            mensajes: [
              ...s.datos.mensajes,
              {
                id: nuevoId("me", s.datos.mensajes),
                viajeId,
                autorRol,
                autorId,
                texto,
                createdAt: ahora(),
                avisoFugaMostrado: contieneTelefono(texto),
              },
            ],
          },
        })),

      // ---------------------------------------------------------------------
      // Calificaciones
      // ---------------------------------------------------------------------
      calificar: (calificacion) =>
        set((s) => ({
          datos: {
            ...s.datos,
            calificaciones: [
              ...s.datos.calificaciones,
              {
                ...calificacion,
                id: nuevoId("ca", s.datos.calificaciones),
                createdAt: ahora(),
              },
            ],
          },
        })),

      // ---------------------------------------------------------------------
      // Flota y agenda
      // ---------------------------------------------------------------------
      agregarVehiculo: (vehiculo) => {
        const id = nuevoId("ve", get().datos.vehiculos);
        set((s) => ({
          datos: { ...s.datos, vehiculos: [...s.datos.vehiculos, { ...vehiculo, id }] },
        }));
        return id;
      },

      actualizarVehiculo: (vehiculoId, cambios) =>
        set((s) => ({
          datos: {
            ...s.datos,
            vehiculos: s.datos.vehiculos.map((v) =>
              v.id === vehiculoId ? { ...v, ...cambios } : v,
            ),
          },
        })),

      eliminarVehiculo: (vehiculoId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            vehiculos: s.datos.vehiculos.filter((v) => v.id !== vehiculoId),
            documentos: s.datos.documentos.filter(
              (d) => d.propietarioId !== vehiculoId,
            ),
          },
        })),

      agregarConductor: (conductor) => {
        const id = nuevoId("co", get().datos.conductores);
        set((s) => ({
          datos: {
            ...s.datos,
            conductores: [...s.datos.conductores, { ...conductor, id }],
          },
        }));
        return id;
      },

      actualizarConductor: (conductorId, cambios) =>
        set((s) => ({
          datos: {
            ...s.datos,
            conductores: s.datos.conductores.map((c) =>
              c.id === conductorId ? { ...c, ...cambios } : c,
            ),
          },
        })),

      eliminarConductor: (conductorId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            conductores: s.datos.conductores.filter((c) => c.id !== conductorId),
            documentos: s.datos.documentos.filter(
              (d) => d.propietarioId !== conductorId,
            ),
          },
        })),

      agregarBloqueo: (bloqueo) =>
        set((s) => ({
          datos: {
            ...s.datos,
            bloqueosAgenda: [
              ...s.datos.bloqueosAgenda,
              { ...bloqueo, id: nuevoId("bl", s.datos.bloqueosAgenda) },
            ],
          },
        })),

      eliminarBloqueo: (bloqueoId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            bloqueosAgenda: s.datos.bloqueosAgenda.filter((b) => b.id !== bloqueoId),
          },
        })),

      // ---------------------------------------------------------------------
      // Documentos
      // ---------------------------------------------------------------------
      subirDocumento: (documento) =>
        set((s) => ({
          datos: {
            ...s.datos,
            documentos: [
              // Subir de nuevo un tipo reemplaza el anterior.
              ...s.datos.documentos.filter(
                (d) =>
                  !(
                    d.propietarioId === documento.propietarioId &&
                    d.tipo === documento.tipo
                  ),
              ),
              {
                ...documento,
                id: `doc-${documento.propietarioId}-${documento.tipo}`,
                estado: "pendiente" as const,
              },
            ],
          },
        })),

      aprobarDocumento: (documentoId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            documentos: s.datos.documentos.map((d) =>
              d.id === documentoId
                ? { ...d, estado: "aprobado" as const, motivoRechazo: undefined }
                : d,
            ),
          },
        })),

      rechazarDocumento: (documentoId, motivo) =>
        set((s) => ({
          datos: {
            ...s.datos,
            documentos: s.datos.documentos.map((d) =>
              d.id === documentoId
                ? { ...d, estado: "rechazado" as const, motivoRechazo: motivo }
                : d,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Grupos de pasajeros
      // ---------------------------------------------------------------------
      publicarGrupo: (grupo) => {
        const { grupos } = get().datos;
        const id = nuevoId("gr", grupos);
        set((s) => ({
          datos: {
            ...s.datos,
            grupos: [
              ...s.datos.grupos,
              {
                ...grupo,
                id,
                codigo: siguienteCodigo(
                  "GP",
                  grupos.map((g) => g.codigo),
                ),
                estado: "publicado" as const,
                createdAt: ahora(),
              },
            ],
          },
        }));
        return id;
      },

      responderGrupo: (oferta) =>
        set((s) => ({
          datos: {
            ...s.datos,
            ofertasGrupo: [
              ...s.datos.ofertasGrupo,
              {
                ...oferta,
                id: nuevoId("og", s.datos.ofertasGrupo),
                estado: "activa" as const,
                createdAt: ahora(),
              },
            ],
            grupos: s.datos.grupos.map((g) =>
              g.id === oferta.grupoId && g.estado === "publicado"
                ? { ...g, estado: "con_ofertas" as const }
                : g,
            ),
          },
        })),

      adjudicarGrupo: (ofertaGrupoId) => {
        const { datos } = get();
        const oferta = datos.ofertasGrupo.find((o) => o.id === ofertaGrupoId);
        if (!oferta) return;

        const grupo = datos.grupos.find((g) => g.id === oferta.grupoId);
        if (!grupo) return;

        const ticketTotal =
          oferta.ticketPropuestoPorPasajero * grupo.cantidadPasajeros;
        const { comisionTransportista, comision, neto } = desglosarReferido(
          ticketTotal,
          oferta.comisionOfrecidaPct,
          datos.comisiones.referidoPct,
        );

        set((s) => ({
          datos: {
            ...s.datos,
            referidos: [
              ...s.datos.referidos,
              {
                id: nuevoId("rf", s.datos.referidos),
                grupoId: grupo.id,
                ofertaGrupoId: oferta.id,
                agenciaId: oferta.agenciaId,
                carrierId: grupo.carrierId,
                ticketTotal,
                comisionTransportista,
                comisionPlataforma: comision,
                montoTransportista: neto,
                estado: "confirmada" as const,
                adjudicadoEn: ahora(),
              },
            ],
            grupos: s.datos.grupos.map((g) =>
              g.id === grupo.id ? { ...g, estado: "adjudicado" as const } : g,
            ),
            ofertasGrupo: s.datos.ofertasGrupo.map((o) => {
              if (o.id === ofertaGrupoId) return { ...o, estado: "ganadora" as const };
              if (o.grupoId === grupo.id && o.estado === "activa") {
                return { ...o, estado: "rechazada" as const };
              }
              return o;
            }),
          },
        }));
      },

      pagarEscrowReferido: (referidoId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            referidos: s.datos.referidos.map((r) =>
              r.id === referidoId ? { ...r, estado: "pago_retenido" as const } : r,
            ),
          },
        })),

      liberarReferido: (referidoId) =>
        set((s) => {
          const referido = s.datos.referidos.find((r) => r.id === referidoId);
          return {
            datos: {
              ...s.datos,
              referidos: s.datos.referidos.map((r) =>
                r.id === referidoId ? { ...r, estado: "liberada" as const } : r,
              ),
              grupos: s.datos.grupos.map((g) =>
                g.id === referido?.grupoId ? { ...g, estado: "cerrado" as const } : g,
              ),
            },
          };
        }),

      enlazarGrupoConViaje: (referidoId, viajeId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            referidos: s.datos.referidos.map((r) =>
              r.id === referidoId ? { ...r, viajeId } : r,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Verificación y configuración
      // ---------------------------------------------------------------------
      actualizarVerificacion: (tipo, cuentaId, estado) =>
        set((s) => ({
          datos: {
            ...s.datos,
            agencias:
              tipo === "agencia"
                ? s.datos.agencias.map((a) =>
                    a.id === cuentaId ? { ...a, estadoVerificacion: estado } : a,
                  )
                : s.datos.agencias,
            transportistas:
              tipo === "transportista"
                ? s.datos.transportistas.map((t) =>
                    t.id === cuentaId ? { ...t, estadoVerificacion: estado } : t,
                  )
                : s.datos.transportistas,
          },
        })),

      actualizarComisiones: (cambios) =>
        set((s) => ({
          datos: { ...s.datos, comisiones: { ...s.datos.comisiones, ...cambios } },
        })),

      // ---------------------------------------------------------------------
      // Notificaciones
      // ---------------------------------------------------------------------
      marcarNotificacionLeida: (notificacionId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            notificaciones: s.datos.notificaciones.map((n) =>
              n.id === notificacionId ? { ...n, leida: true } : n,
            ),
          },
        })),

      marcarTodasLeidas: (destinatarioId) =>
        set((s) => ({
          datos: {
            ...s.datos,
            notificaciones: s.datos.notificaciones.map((n) =>
              n.destinatarioId === destinatarioId ? { ...n, leida: true } : n,
            ),
          },
        })),

      // ---------------------------------------------------------------------
      // Demo
      // ---------------------------------------------------------------------
      reiniciarDemo: () =>
        set({ datos: crearSeed(new Date()), sesion: SESION_DEMO }),
    }),
    {
      name: "rutero-datos",
      version: VERSION_SEED,
      // Un seed viejo en el navegador se descarta en vez de intentar migrarlo:
      // es data de demo, no del usuario.
      migrate: () => ({ datos: crearSeed(new Date()), sesion: SESION_DEMO }),
    },
  ),
);

/**
 * `true` cuando el store ya leyó `localStorage`. Los componentes lo usan para
 * no renderizar el seed del servidor y después reemplazarlo, que rompería la
 * hidratación.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    (onCambio) => useRutero.persist.onFinishHydration(onCambio),
    () => useRutero.persist.hasHydrated(),
    () => false,
  );
}
