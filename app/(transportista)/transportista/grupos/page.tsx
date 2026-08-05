"use client";

import { useState } from "react";
import { Check, Link2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaGrupo } from "@/components/shared/tarjeta-grupo";
import { DialogoGrupo } from "@/components/transportista/dialogo-grupo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRutero } from "@/lib/mock/store";
import {
  agencia as buscarAgencia,
  gruposDeCarrier,
  oferta as buscarOferta,
  ofertasDeGrupo,
  referidoDeGrupo,
  viajesDeCarrier,
} from "@/lib/mock/selectores";
import type { OfertaGrupo } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearCLP, formatearRelativo } from "@/lib/utils/format";
import { desglosarReferido } from "@/lib/utils/rules";

export default function GruposTransportistaPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();
  const adjudicarGrupo = useRutero((s) => s.adjudicarGrupo);
  const enlazarGrupoConViaje = useRutero((s) => s.enlazarGrupoConViaje);

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [porAdjudicar, setPorAdjudicar] = useState<OfertaGrupo | undefined>();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Mis grupos" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const grupos = gruposDeCarrier(datos, carrierId);
  const abiertos = grupos.filter((g) =>
    ["publicado", "con_ofertas"].includes(g.estado),
  );
  const adjudicados = grupos.filter((g) => g.estado === "adjudicado");
  const ganado = adjudicados.reduce((suma, g) => {
    const ref = referidoDeGrupo(datos, g.id);
    return suma + (ref?.montoTransportista ?? 0);
  }, 0);

  // Viajes propios que pueden enlazarse a un grupo: la misma operación.
  const misViajes = viajesDeCarrier(datos, carrierId).filter((v) =>
    ["confirmada", "pago_retenido", "en_curso"].includes(v.estado),
  );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Mis grupos"
        descripcion="Tienes pasajeros pero no eres agencia. Publica el grupo, una agencia se lo lleva y te paga comisión."
        acciones={
          <Button onClick={() => setDialogoAbierto(true)}>
            <Plus className="size-4" aria-hidden />
            Publicar grupo
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Grupos abiertos" valor={abiertos.length} />
        <Metrica etiqueta="Adjudicados" valor={adjudicados.length} tono="go" />
        <Metrica
          etiqueta="Ganado por referidos"
          valor={formatearCLP(ganado)}
          detalle="Neto después de la comisión de Rutero"
          tono="signal"
        />
      </div>

      {grupos.length === 0 ? (
        <ListaVacia
          icono={Users}
          titulo="Todavía no publicas grupos"
          detalle="Si te llega gente que quiere hacer un tour y tú solo haces el transporte, publica el grupo acá: una agencia lo toma y te paga comisión por el dato."
          accion={
            <Button onClick={() => setDialogoAbierto(true)}>
              Publicar el primero
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {grupos.map((grupo) => {
            const ofertas = ofertasDeGrupo(datos, grupo.id);
            const activas = ofertas.filter((o) => o.estado === "activa");
            const ganadora = ofertas.find((o) => o.estado === "ganadora");
            const referido = referidoDeGrupo(datos, grupo.id);
            const decidible =
              grupo.estado === "publicado" || grupo.estado === "con_ofertas";

            return (
              <li key={grupo.id}>
                <TarjetaGrupo
                  grupo={grupo}
                  ahora={ahora}
                  pie={
                    <div className="flex flex-col gap-3">
                      {ofertas.length === 0 ? (
                        <p className="text-sm text-meta">
                          Todavía ninguna agencia responde. Las agencias con
                          operación en {grupo.zona} lo ven en su bandeja.
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-ink">
                            {activas.length > 0
                              ? `${activas.length} ${activas.length === 1 ? "agencia interesada" : "agencias interesadas"}`
                              : "Respuestas"}
                          </p>
                          <ul className="flex flex-col gap-2">
                            {ofertas.map((o) => {
                              const ag = buscarAgencia(datos, o.agenciaId);
                              const total =
                                o.ticketPropuestoPorPasajero *
                                grupo.cantidadPasajeros;
                              const d = desglosarReferido(
                                total,
                                o.comisionOfrecidaPct,
                                datos.comisiones.referidoPct,
                              );
                              return (
                                <li
                                  key={o.id}
                                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                                    o.estado === "ganadora"
                                      ? "border-go/40 bg-go-soft"
                                      : o.estado === "rechazada"
                                        ? "border-line opacity-60"
                                        : "border-line"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-ink">
                                      {ag?.razonSocial}
                                    </p>
                                    <p className="text-sm text-meta">
                                      Ticket{" "}
                                      <span className="font-mono tabular-nums">
                                        {formatearCLP(
                                          o.ticketPropuestoPorPasajero,
                                        )}
                                      </span>
                                      /pax · comisión{" "}
                                      <span className="font-mono tabular-nums">
                                        {o.comisionOfrecidaPct}%
                                      </span>{" "}
                                      · {formatearRelativo(o.createdAt)}
                                    </p>
                                    {o.nota && (
                                      <p className="mt-1 text-sm text-ink/70">
                                        “{o.nota}”
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="font-mono font-medium tabular-nums text-ink">
                                        {formatearCLP(d.neto)}
                                      </p>
                                      <p className="text-xs text-meta">
                                        recibes tú
                                      </p>
                                    </div>
                                    {decidible && o.estado === "activa" && (
                                      <Button
                                        size="sm"
                                        onClick={() => setPorAdjudicar(o)}
                                      >
                                        <Check className="size-4" aria-hidden />
                                        Adjudicar
                                      </Button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}

                      {/* Enlazar con un viaje propio: una sola operación */}
                      {referido && ganadora && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-muted p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Link2 className="size-4 text-meta" aria-hidden />
                            {referido.viajeId ? (
                              <span className="text-ink">
                                Enlazado con el viaje{" "}
                                <span className="font-mono">
                                  {buscarOferta(
                                    datos,
                                    datos.viajes.find(
                                      (v) => v.id === referido.viajeId,
                                    )?.ofertaId ?? "",
                                  )?.codigo ?? referido.viajeId}
                                </span>
                              </span>
                            ) : (
                              <span className="text-meta">
                                ¿También haces tú el transporte? Enlaza el grupo
                                con tu viaje.
                              </span>
                            )}
                          </div>

                          {!referido.viajeId && misViajes.length > 0 && (
                            <Select
                              onValueChange={(viajeId) => {
                                enlazarGrupoConViaje(referido.id, viajeId);
                                toast.success("Grupo enlazado con el viaje");
                              }}
                            >
                              <SelectTrigger size="sm" className="w-64">
                                <SelectValue placeholder="Elegir viaje" />
                              </SelectTrigger>
                              <SelectContent>
                                {misViajes.map((v) => {
                                  const of = buscarOferta(datos, v.ofertaId);
                                  return (
                                    <SelectItem key={v.id} value={v.id}>
                                      {of?.codigo} · {of?.titulo}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      <DialogoGrupo
        abierto={dialogoAbierto}
        onAbrirCambio={setDialogoAbierto}
        carrierId={carrierId}
        comisionPlataformaPct={datos.comisiones.referidoPct}
      />

      {porAdjudicar && (
        <AlertDialog open onOpenChange={(v) => !v && setPorAdjudicar(undefined)}>
          <AlertDialogContent>
            <AlertDialogTitle className="font-display text-display-sm">
              ¿Adjudicar a {buscarAgencia(datos, porAdjudicar.agenciaId)?.razonSocial}?
            </AlertDialogTitle>
            <AlertDialogHeader>
              <AlertDialogDescription>
                La agencia se lleva el grupo y deposita tu comisión en escrow. Las
                otras respuestas se rechazan automáticamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  adjudicarGrupo(porAdjudicar.id);
                  setPorAdjudicar(undefined);
                  toast.success("Grupo adjudicado", {
                    description: "La comisión queda en escrow hasta el tour.",
                  });
                }}
              >
                Adjudicar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
