"use client";

import Link from "next/link";
import { Lock, Receipt } from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import {
  FilaTarjeta,
  ListaTarjetas,
  TablaEscritorio,
} from "@/components/shared/tabla-responsiva";
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
  oferta as buscarOferta,
  pagoDeViaje,
  referidosDeAgencia,
  transportista as buscarTransportista,
  viajesDeAgencia,
} from "@/lib/mock/selectores";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_PAGO } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_PAGO,
  formatearCLP,
  formatearFechaLarga,
} from "@/lib/utils/format";

export default function PagosAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const pagarEscrow = useRutero((s) => s.pagarEscrow);

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Pagos e historial" />
        <ListaCargando filas={4} />
      </div>
    );
  }

  const viajes = viajesDeAgencia(datos, agenciaId);
  const conPago = viajes
    .map((v) => ({ viaje: v, pago: pagoDeViaje(datos, v.id) }))
    .filter((x) => x.pago);

  const porPagar = conPago.filter((x) => x.pago!.estado === "pendiente");
  const retenido = conPago
    .filter((x) => x.pago!.estado === "retenido")
    .reduce((s, x) => s + x.pago!.montoBruto, 0);
  const pagadoTotal = conPago
    .filter((x) => x.pago!.estado === "liberado")
    .reduce((s, x) => s + x.pago!.montoBruto, 0);

  const referidos = referidosDeAgencia(datos, agenciaId);
  const comisionesReferido = referidos.reduce(
    (s, r) => s + r.comisionTransportista,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Pagos e historial"
        descripcion="La agencia no paga fee de plataforma: pagas el monto del viaje y Rutero le descuenta su comisión al transportista."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="Esperando tu pago"
          valor={porPagar.length}
          detalle={
            porPagar.length > 0
              ? formatearCLP(porPagar.reduce((s, x) => s + x.pago!.montoBruto, 0))
              : "Nada pendiente"
          }
          tono={porPagar.length > 0 ? "signal" : "neutro"}
        />
        <Metrica
          etiqueta="Retenido en escrow"
          valor={formatearCLP(retenido)}
          detalle="Se libera al completarse el viaje"
        />
        <Metrica
          etiqueta="Pagado histórico"
          valor={formatearCLP(pagadoTotal)}
          tono="go"
        />
        <Metrica
          etiqueta="Comisiones de referido"
          valor={formatearCLP(comisionesReferido)}
          detalle="Pagadas a transportistas por grupos"
        />
      </div>

      {porPagar.length > 0 && (
        <section className="rounded-lg border border-signal/40 bg-signal-soft p-4">
          <h2 className="font-display text-display-sm text-ink">
            {porPagar.length === 1
              ? "Un viaje espera tu pago"
              : `${porPagar.length} viajes esperan tu pago`}
          </h2>
          <p className="mt-1 text-sm text-ink/80">
            Hasta que no deposites, no se revelan los contactos ni se abre el chat
            con el transportista.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {porPagar.map(({ viaje, pago }) => {
              const oferta = buscarOferta(datos, viaje.ofertaId);
              return (
                <li
                  key={viaje.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3"
                >
                  <div>
                    <p className="font-medium text-ink">{oferta?.titulo}</p>
                    <p className="text-sm text-meta">
                      {buscarTransportista(datos, viaje.carrierId)?.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium tabular-nums text-ink">
                      {formatearCLP(pago!.montoBruto)}
                    </span>
                    <Button
                      onClick={() => {
                        pagarEscrow(viaje.id);
                        toast.success("Pago retenido en escrow");
                      }}
                    >
                      <Lock className="size-4" aria-hidden />
                      Pagar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-display-sm text-ink">Historial</h2>

        {conPago.length === 0 ? (
          <ListaVacia
            icono={Receipt}
            titulo="Todavía no hay pagos"
            detalle="Cuando adjudiques un viaje y pagues el escrow, el movimiento aparece acá con su desglose."
            accion={
              <Button asChild>
                <Link href="/agencia/ofertas">Ver mis ofertas</Link>
              </Button>
            }
          />
        ) : (
          <>
            <ListaTarjetas>
              {conPago.map(({ viaje, pago }) => {
                const oferta = buscarOferta(datos, viaje.ofertaId);
                return (
                  <FilaTarjeta
                    key={viaje.id}
                    titulo={
                      <Link
                        href={`/agencia/viajes/${viaje.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {oferta?.titulo}
                      </Link>
                    }
                    subtitulo={
                      <>
                        <span className="font-mono">{oferta?.codigo}</span> ·{" "}
                        {buscarTransportista(datos, viaje.carrierId)?.nombre}
                      </>
                    }
                    destacado={formatearCLP(pago!.montoBruto)}
                    detalleDestacado="lo que pagas"
                    datos={[
                      {
                        etiqueta: "Comisión Rutero",
                        valor: formatearCLP(pago!.comisionPlataforma),
                      },
                      {
                        etiqueta: "Recibe",
                        valor: formatearCLP(pago!.montoNeto),
                      },
                      {
                        etiqueta: "Liberado",
                        valor: pago!.fechaLiberacion
                          ? formatearFechaLarga(pago!.fechaLiberacion)
                          : null,
                      },
                    ]}
                    pie={
                      <BadgeEstado tono={TONO_PAGO[pago!.estado]}>
                        {ETIQUETA_ESTADO_PAGO[pago!.estado]}
                      </BadgeEstado>
                    }
                  />
                );
              })}
            </ListaTarjetas>

            <TablaEscritorio>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Viaje</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead className="text-right">Pagas</TableHead>
                  <TableHead className="text-right">Comisión Rutero</TableHead>
                  <TableHead className="text-right">Recibe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Liberado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conPago.map(({ viaje, pago }) => {
                  const oferta = buscarOferta(datos, viaje.ofertaId);
                  return (
                    <TableRow key={viaje.id}>
                      <TableCell>
                        <Link
                          href={`/agencia/viajes/${viaje.id}`}
                          className="font-medium text-ink underline-offset-4 hover:underline"
                        >
                          {oferta?.titulo}
                        </Link>
                        <p className="font-mono text-xs text-meta">
                          {oferta?.codigo}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {buscarTransportista(datos, viaje.carrierId)?.nombre}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium tabular-nums">
                        {formatearCLP(pago!.montoBruto)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-meta">
                        {formatearCLP(pago!.comisionPlataforma)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatearCLP(pago!.montoNeto)}
                      </TableCell>
                      <TableCell>
                        <BadgeEstado tono={TONO_PAGO[pago!.estado]}>
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
            </TablaEscritorio>
          </>
        )}
      </section>
    </div>
  );
}
