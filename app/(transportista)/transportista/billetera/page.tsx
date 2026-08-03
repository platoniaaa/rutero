"use client";

import Link from "next/link";
import { Lock, Wallet } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  agencia as buscarAgencia,
  oferta as buscarOferta,
  pagoDeViaje,
  referidosDeCarrier,
  viajesDeCarrier,
} from "@/lib/mock/selectores";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_PAGO } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_PAGO,
  formatearCLP,
  formatearFechaLarga,
} from "@/lib/utils/format";
import { COMISION_VIAJE_PCT } from "@/lib/utils/rules";

export default function BilleteraPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Billetera" />
        <ListaCargando filas={4} />
      </div>
    );
  }

  const viajes = viajesDeCarrier(datos, carrierId);
  const conPago = viajes
    .map((v) => ({ viaje: v, pago: pagoDeViaje(datos, v.id) }))
    .filter((x) => x.pago);

  const retenido = conPago
    .filter((x) => x.pago!.estado === "retenido")
    .reduce((s, x) => s + x.pago!.montoNeto, 0);
  const liberado = conPago
    .filter((x) => x.pago!.estado === "liberado")
    .reduce((s, x) => s + x.pago!.montoNeto, 0);
  const enDisputa = conPago
    .filter((x) => x.pago!.estado === "en_disputa")
    .reduce((s, x) => s + x.pago!.montoNeto, 0);
  const comisionPagada = conPago
    .filter((x) => x.pago!.estado === "liberado")
    .reduce((s, x) => s + x.pago!.comisionPlataforma, 0);

  // Los referidos del flujo 2 también pasan por la billetera.
  const referidos = referidosDeCarrier(datos, carrierId);
  const netoReferidos = referidos
    .filter((r) => r.estado === "liberada")
    .reduce((s, r) => s + r.montoTransportista, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Billetera"
        descripcion={`Rutero descuenta ${COMISION_VIAJE_PCT}% al liberar el pago. El resto es tuyo.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="Retenido en escrow"
          valor={formatearCLP(retenido)}
          detalle="Se libera 24 h después de finalizado"
          tono="signal"
        />
        <Metrica
          etiqueta="Liberado"
          valor={formatearCLP(liberado)}
          detalle="Total histórico de viajes"
          tono="go"
        />
        <Metrica
          etiqueta="Comisión Rutero pagada"
          valor={formatearCLP(comisionPagada)}
          detalle={`${COMISION_VIAJE_PCT}% de lo liberado`}
        />
        <Metrica
          etiqueta="Por referidos"
          valor={formatearCLP(netoReferidos)}
          detalle="Comisiones de grupos entregados"
          tono={netoReferidos > 0 ? "go" : "neutro"}
        />
      </div>

      {enDisputa > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-stop/40 bg-stop-soft p-4 text-sm text-ink"
        >
          Tienes{" "}
          <span className="font-mono font-medium tabular-nums">
            {formatearCLP(enDisputa)}
          </span>{" "}
          congelados por una disputa abierta. El equipo de Rutero está revisando.
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-display-sm text-ink">
          Historial de liquidaciones
        </h2>

        {conPago.length === 0 ? (
          <ListaVacia
            icono={Wallet}
            titulo="Todavía no tienes movimientos"
            detalle="Cuando te adjudiquen un viaje y la agencia pague el escrow, el monto aparece acá retenido hasta que el viaje se complete."
            accion={
              <Button asChild>
                <Link href="/transportista/ofertas">Ver el feed de ofertas</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Viaje</TableHead>
                  <TableHead>Agencia</TableHead>
                  <TableHead className="text-right">Bruto</TableHead>
                  <TableHead className="text-right">Comisión</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Liberado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conPago.map(({ viaje, pago }) => {
                  const oferta = buscarOferta(datos, viaje.ofertaId);
                  const agencia = buscarAgencia(datos, viaje.agenciaId);
                  return (
                    <TableRow key={viaje.id}>
                      <TableCell>
                        <Link
                          href={`/transportista/viajes/${viaje.id}`}
                          className="font-medium text-ink underline-offset-4 hover:underline"
                        >
                          {oferta?.titulo}
                        </Link>
                        <p className="font-mono text-xs text-meta">
                          {oferta?.codigo}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {agencia?.razonSocial}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatearCLP(pago!.montoBruto)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-stop">
                        −{formatearCLP(pago!.comisionPlataforma)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium tabular-nums text-ink">
                        {formatearCLP(pago!.montoNeto)}
                      </TableCell>
                      <TableCell>
                        <BadgeEstado tono={TONO_PAGO[pago!.estado]}>
                          {pago!.estado === "retenido" && (
                            <Lock className="size-3.5" aria-hidden />
                          )}
                          {ETIQUETA_ESTADO_PAGO[pago!.estado]}
                        </BadgeEstado>
                      </TableCell>
                      <TableCell className="text-sm text-meta">
                        {pago!.fechaLiberacion
                          ? formatearFechaLarga(pago!.fechaLiberacion)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
