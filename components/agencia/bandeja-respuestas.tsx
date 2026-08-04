"use client";

import { useState } from "react";
import { Gavel, Star, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { ListaVacia } from "@/components/shared/estado-lista";
import { PlacaPatente } from "@/components/shared/placa-patente";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRutero } from "@/lib/mock/store";
import {
  conductor as buscarConductor,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
} from "@/lib/mock/selectores";
import type { Oferta, Respuesta } from "@/lib/mock/types";
import { useDatos } from "@/lib/mock/use-datos";
import { TONO_RESPUESTA } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_RESPUESTA,
  ETIQUETA_TIPO_VEHICULO,
  formatearCLP,
  formatearRelativo,
  montoPorPasajero,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Bandeja comparable: aceptaciones y contraofertas mezcladas, con monto total,
 * equivalente por pasajero, rating, vehículo propuesto y nota. Es la pantalla
 * donde la agencia decide.
 */
export function BandejaRespuestas({
  oferta,
  respuestas,
}: {
  oferta: Oferta;
  respuestas: Respuesta[];
}) {
  const router = useRouter();
  const { datos } = useDatos();
  const adjudicar = useRutero((s) => s.adjudicar);
  const [porAdjudicar, setPorAdjudicar] = useState<Respuesta | undefined>();

  const activas = respuestas.filter((r) => r.estado === "activa");
  const ganadora = respuestas.find((r) => r.estado === "ganadora");
  const decidible =
    oferta.estado === "publicada" || oferta.estado === "con_respuestas";

  if (respuestas.length === 0) {
    return (
      <ListaVacia
        titulo="Todavía no hay respuestas"
        detalle="Suben un 40% cuando el presupuesto referencial está a precio de mercado. Si en unas horas no llega nada, vale la pena revisar el monto."
      />
    );
  }

  const montoReferencia = oferta.presupuestoReferencial;
  const carrierDe = (r: Respuesta) => buscarTransportista(datos, r.carrierId);

  return (
    <>
      {/* En celular cada respuesta es una tarjeta. El monto y el equivalente
          por pasajero quedan juntos y alineados, que es contra lo que la
          agencia decide. */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {respuestas.map((r) => {
          const carrier = carrierDe(r);
          const vehiculo = buscarVehiculo(datos, r.vehiculoId);
          const conductor = buscarConductor(datos, r.conductorId);
          const diferencia = r.monto - montoReferencia;
          const inactiva = r.estado === "retirada" || r.estado === "rechazada";

          return (
            <li
              key={r.id}
              className={cn(
                "rounded-lg border bg-surface p-4",
                r.estado === "ganadora" ? "border-go/40 bg-go-soft" : "border-line",
                inactiva && "opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{carrier?.nombre}</p>
                  <p className="flex items-center gap-2 text-xs text-meta">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 text-signal" aria-hidden />
                      <span className="font-mono tabular-nums">
                        {carrier?.ratingPromedio.toFixed(1) ?? "—"}
                      </span>
                    </span>
                    <span className="font-mono tabular-nums">
                      {carrier?.viajesCompletados ?? 0}
                    </span>{" "}
                    viajes
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-lg font-medium tabular-nums text-ink">
                    {formatearCLP(r.monto)}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-meta">
                    {formatearCLP(
                      montoPorPasajero(r.monto, oferta.cantidadPasajeros),
                    )}
                    /pax
                  </p>
                  {diferencia !== 0 && (
                    <p
                      className={cn(
                        "flex items-center justify-end gap-1 font-mono text-xs tabular-nums",
                        diferencia > 0 ? "text-stop" : "text-go-ink",
                      )}
                    >
                      {diferencia > 0 ? (
                        <TrendingUp className="size-3" aria-hidden />
                      ) : (
                        <TrendingDown className="size-3" aria-hidden />
                      )}
                      {diferencia > 0 ? "+" : "−"}
                      {formatearCLP(Math.abs(diferencia))}
                    </p>
                  )}
                </div>
              </div>

              {vehiculo && (
                <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
                  <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                  <div className="min-w-0 text-xs text-meta">
                    <p className="truncate">
                      {vehiculo.marca} {vehiculo.modelo} ·{" "}
                      <span className="font-mono tabular-nums">
                        {vehiculo.capacidadPasajeros}
                      </span>{" "}
                      pax
                    </p>
                    <p className="truncate">
                      {conductor?.nombre} · {conductor?.licenciaClase}
                    </p>
                  </div>
                </div>
              )}

              {r.nota && (
                <p className="mt-2 text-sm text-ink/70">“{r.nota}”</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <BadgeEstado tono={TONO_RESPUESTA[r.estado]}>
                  {r.estado === "activa"
                    ? r.tipo === "aceptacion"
                      ? "Aceptó el precio"
                      : "Contraoferta"
                    : ETIQUETA_ESTADO_RESPUESTA[r.estado]}
                </BadgeEstado>
                <span className="text-xs text-meta">
                  {formatearRelativo(r.createdAt)}
                </span>
              </div>

              {decidible && r.estado === "activa" && (
                <Button
                  className="mt-3 w-full"
                  onClick={() => setPorAdjudicar(r)}
                >
                  <Gavel className="size-4" aria-hidden />
                  Adjudicar
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-line lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transportista</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Por pasajero</TableHead>
              <TableHead>Respuesta</TableHead>
              {decidible && <TableHead className="text-right">Acción</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {respuestas.map((r) => {
              const carrier = carrierDe(r);
              const vehiculo = buscarVehiculo(datos, r.vehiculoId);
              const conductor = buscarConductor(datos, r.conductorId);
              const diferencia = r.monto - montoReferencia;
              const inactiva = r.estado === "retirada" || r.estado === "rechazada";

              return (
                <TableRow
                  key={r.id}
                  className={cn(
                    inactiva && "opacity-50",
                    r.estado === "ganadora" && "bg-go-soft",
                  )}
                >
                  {/* whitespace-normal: la celda de shadcn viene con nowrap y la
                      nota se desbordaba sobre la columna del vehículo. */}
                  <TableCell className="max-w-xs align-top whitespace-normal">
                    <p className="font-medium text-ink">{carrier?.nombre}</p>
                    <p className="flex items-center gap-2 text-xs text-meta">
                      <span className="flex items-center gap-1">
                        <Star className="size-3 text-signal" aria-hidden />
                        <span className="font-mono tabular-nums">
                          {carrier?.ratingPromedio.toFixed(1) ?? "—"}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">
                        {carrier?.viajesCompletados ?? 0}
                      </span>{" "}
                      viajes
                    </p>
                    {r.nota && (
                      <p className="mt-1 text-xs text-balance text-ink/70">
                        “{r.nota}”
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="align-top">
                    {vehiculo && (
                      <div className="flex flex-col gap-1">
                        <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                        <span className="text-xs text-meta">
                          {vehiculo.marca} {vehiculo.modelo} ·{" "}
                          {ETIQUETA_TIPO_VEHICULO[vehiculo.tipo]} ·{" "}
                          <span className="font-mono tabular-nums">
                            {vehiculo.capacidadPasajeros}
                          </span>{" "}
                          pax
                        </span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="max-w-44 align-top text-sm whitespace-normal">
                    <p className="text-ink">{conductor?.nombre}</p>
                    <p className="text-xs text-meta">
                      {conductor?.licenciaClase} ·{" "}
                      {conductor?.idiomas.join(", ")}
                    </p>
                  </TableCell>

                  <TableCell className="text-right align-top">
                    <p className="font-mono font-medium tabular-nums text-ink">
                      {formatearCLP(r.monto)}
                    </p>
                    {diferencia !== 0 && (
                      <p
                        className={cn(
                          "flex items-center justify-end gap-1 font-mono text-xs tabular-nums",
                          diferencia > 0 ? "text-stop" : "text-go-ink",
                        )}
                      >
                        {diferencia > 0 ? (
                          <TrendingUp className="size-3" aria-hidden />
                        ) : (
                          <TrendingDown className="size-3" aria-hidden />
                        )}
                        {diferencia > 0 ? "+" : "−"}
                        {formatearCLP(Math.abs(diferencia))}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="text-right font-mono tabular-nums text-ink">
                    {formatearCLP(
                      montoPorPasajero(r.monto, oferta.cantidadPasajeros),
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <BadgeEstado tono={TONO_RESPUESTA[r.estado]}>
                        {r.estado === "activa"
                          ? r.tipo === "aceptacion"
                            ? "Aceptó el precio"
                            : "Contraoferta"
                          : ETIQUETA_ESTADO_RESPUESTA[r.estado]}
                      </BadgeEstado>
                      <span className="text-xs text-meta">
                        {formatearRelativo(r.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {decidible && (
                    <TableCell className="text-right">
                      {r.estado === "activa" && (
                        <Button size="sm" onClick={() => setPorAdjudicar(r)}>
                          <Gavel className="size-4" aria-hidden />
                          Adjudicar
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {ganadora && (
        <p className="text-sm text-meta">
          Adjudicado a{" "}
          <span className="font-medium text-ink">
            {carrierDe(ganadora)?.nombre}
          </span>{" "}
          por{" "}
          <span className="font-mono tabular-nums text-ink">
            {formatearCLP(ganadora.monto)}
          </span>
          . Las demás respuestas se rechazaron automáticamente.
        </p>
      )}

      {/* Se monta solo cuando hay una respuesta elegida: el contenido del
          diálogo se evalúa aunque esté cerrado. */}
      {porAdjudicar && (
        <AlertDialog
          open
          onOpenChange={(v) => !v && setPorAdjudicar(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-display-sm">
                ¿Adjudicar a {carrierDe(porAdjudicar)?.nombre}?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>
                    Cierras el trato por{" "}
                    <span className="font-mono tabular-nums">
                      {formatearCLP(porAdjudicar.monto)}
                    </span>
                    {activas.length > 1 && (
                      <>
                        . Las otras{" "}
                        {activas.length - 1 === 1
                          ? "1 respuesta se rechaza"
                          : `${activas.length - 1} respuestas se rechazan`}{" "}
                        automáticamente
                      </>
                    )}
                    .
                  </p>
                  <p>
                    Después tienes que pagar el escrow: recién ahí se revelan los
                    datos de contacto de ambas partes.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const viajeId = adjudicar(porAdjudicar.id);
                  setPorAdjudicar(undefined);
                  toast.success("Adjudicado", {
                    description: "Ahora paga el escrow para confirmar el viaje.",
                  });
                  if (viajeId) router.push(`/agencia/viajes/${viajeId}`);
                }}
              >
                Adjudicar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
