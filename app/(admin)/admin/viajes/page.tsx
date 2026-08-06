"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { PlacaPatente } from "@/components/shared/placa-patente";
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
  agencia as buscarAgencia,
  oferta as buscarOferta,
  pagoDeViaje,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
} from "@/lib/mock/selectores";
import type { EstadoViaje } from "@/lib/mock/types";
import { useDatos } from "@/lib/mock/use-datos";
import { TONO_PAGO, TONO_VIAJE } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_PAGO,
  ETIQUETA_ESTADO_VIAJE,
  formatearCLP,
  formatearFecha,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const FILTROS: { clave: string; etiqueta: string; estados: EstadoViaje[] }[] = [
  { clave: "disputas", etiqueta: "Disputas", estados: ["en_disputa"] },
  {
    clave: "activos",
    etiqueta: "Activos",
    estados: ["confirmada", "pago_retenido", "en_curso"],
  },
  { clave: "cerrados", etiqueta: "Cerrados", estados: ["finalizada", "liberada"] },
  {
    clave: "cancelados",
    etiqueta: "Cancelados",
    estados: ["cancelada_agencia", "cancelada_transportista", "no_show"],
  },
];

export default function AdminViajesPage() {
  const { datos, cargando } = useDatos();
  const liberarPago = useRutero((s) => s.liberarPago);
  const cancelarViaje = useRutero((s) => s.cancelarViaje);
  const [filtro, setFiltro] = useState("todos");

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Admin" titulo="Viajes y disputas" />
        <ListaCargando filas={5} />
      </div>
    );
  }

  const viajes = [...datos.viajes].sort((a, b) =>
    b.adjudicadoEn.localeCompare(a.adjudicadoEn),
  );
  const disputas = viajes.filter((v) => v.estado === "en_disputa");
  const enEscrow = datos.pagos
    .filter((p) => p.estado === "retenido")
    .reduce((s, p) => s + p.montoBruto, 0);

  const visibles =
    filtro === "todos"
      ? viajes
      : viajes.filter((v) =>
          (FILTROS.find((f) => f.clave === filtro)?.estados ?? []).includes(
            v.estado,
          ),
        );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Admin"
        titulo="Viajes y disputas"
        descripcion="Todos los viajes de la plataforma. Las disputas congelan el pago hasta que se resuelvan acá."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Metrica etiqueta="Viajes totales" valor={viajes.length} />
        <Metrica
          etiqueta="Disputas abiertas"
          valor={disputas.length}
          tono={disputas.length > 0 ? "stop" : "neutro"}
        />
        <Metrica etiqueta="Retenido en escrow" valor={formatearCLP(enEscrow)} />
        <Metrica
          etiqueta="Completados"
          valor={viajes.filter((v) => v.estado === "liberada").length}
          tono="go"
        />
      </div>

      {disputas.length > 0 && (
        <section className="rounded-lg border border-stop/40 bg-stop-soft p-4">
          <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
            <ShieldAlert className="size-5 text-stop" aria-hidden />
            Disputas por resolver
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {disputas.map((v) => {
              const oferta = buscarOferta(datos, v.ofertaId);
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{oferta?.titulo}</p>
                    <p className="text-sm text-meta">
                      {buscarAgencia(datos, v.agenciaId)?.razonSocial} ·{" "}
                      {buscarTransportista(datos, v.carrierId)?.nombre}
                    </p>
                    {v.motivoCancelacion && (
                      <p className="mt-1 max-w-2xl text-sm text-ink/80">
                        “{v.motivoCancelacion}”
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium tabular-nums text-ink">
                      {formatearCLP(v.montoFinal)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        liberarPago(v.id);
                        toast.success("Resuelto a favor del transportista", {
                          description: `Se liberaron ${formatearCLP(v.montoTransportista)}.`,
                        });
                      }}
                    >
                      Liberar al transportista
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        cancelarViaje(
                          v.id,
                          "transportista",
                          "Disputa resuelta a favor de la agencia por el equipo de Rutero.",
                        );
                        toast.success("Resuelto a favor de la agencia", {
                          description: "El pago se reembolsa.",
                        });
                      }}
                    >
                      Reembolsar a la agencia
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filtro === "todos"}
          onClick={() => setFiltro("todos")}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            filtro === "todos"
              ? "border-ink bg-ink text-white"
              : "border-line text-ink hover:border-meta",
          )}
        >
          Todos
          <span className="font-mono text-xs tabular-nums opacity-70">
            {viajes.length}
          </span>
        </button>
        {FILTROS.map((f) => (
          <button
            key={f.clave}
            type="button"
            aria-pressed={filtro === f.clave}
            onClick={() => setFiltro(f.clave)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              filtro === f.clave
                ? "border-ink bg-ink text-white"
                : "border-line text-ink hover:border-meta",
            )}
          >
            {f.etiqueta}
            <span className="font-mono text-xs tabular-nums opacity-70">
              {viajes.filter((v) => f.estados.includes(v.estado)).length}
            </span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <ListaVacia titulo="Nada en este filtro" detalle="Prueba con otro estado." />
      ) : (
        <>
          {/* La tabla completa medía 1.231px en celular. Cada viaje pasa a ser
              una tarjeta; la tabla sigue en pantalla grande, que es donde
              comparar montos y comisiones en columna sirve de algo. */}
          <ListaTarjetas>
            {visibles.map((v) => {
              const oferta = buscarOferta(datos, v.ofertaId);
              const vehiculo = buscarVehiculo(datos, v.vehiculoId);
              const pago = pagoDeViaje(datos, v.id);
              return (
                <FilaTarjeta
                  key={v.id}
                  titulo={oferta?.titulo}
                  subtitulo={
                    <>
                      <span className="font-mono">{oferta?.codigo}</span>
                      {oferta && <> · {formatearFecha(oferta.fechaHoraSalida)}</>}
                    </>
                  }
                  destacado={formatearCLP(v.montoFinal)}
                  detalleDestacado={`Comisión ${formatearCLP(v.comision)}`}
                  datos={[
                    {
                      etiqueta: "Agencia",
                      valor: buscarAgencia(datos, v.agenciaId)?.razonSocial,
                    },
                    {
                      etiqueta: "Transportista",
                      valor: buscarTransportista(datos, v.carrierId)?.nombre,
                    },
                    {
                      etiqueta: "Vehículo",
                      valor: vehiculo && (
                        <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                      ),
                    },
                  ]}
                  pie={
                    <div className="flex flex-wrap gap-2">
                      <BadgeEstado tono={TONO_VIAJE[v.estado]}>
                        {ETIQUETA_ESTADO_VIAJE[v.estado]}
                      </BadgeEstado>
                      {pago && (
                        <BadgeEstado tono={TONO_PAGO[pago.estado]}>
                          {ETIQUETA_ESTADO_PAGO[pago.estado]}
                        </BadgeEstado>
                      )}
                    </div>
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
                <TableHead>Agencia</TableHead>
                <TableHead>Transportista</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((v) => {
                const oferta = buscarOferta(datos, v.ofertaId);
                const vehiculo = buscarVehiculo(datos, v.vehiculoId);
                const pago = pagoDeViaje(datos, v.id);
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <p className="font-medium text-ink">{oferta?.titulo}</p>
                      <p className="text-xs text-meta">
                        <span className="font-mono">{oferta?.codigo}</span>
                        {oferta && <> · {formatearFecha(oferta.fechaHoraSalida)}</>}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {buscarAgencia(datos, v.agenciaId)?.razonSocial}
                    </TableCell>
                    <TableCell className="text-sm">
                      {buscarTransportista(datos, v.carrierId)?.nombre}
                    </TableCell>
                    <TableCell>
                      {vehiculo && (
                        <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatearCLP(v.montoFinal)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-go-ink">
                      {formatearCLP(v.comision)}
                    </TableCell>
                    <TableCell>
                      <BadgeEstado tono={TONO_VIAJE[v.estado]}>
                        {ETIQUETA_ESTADO_VIAJE[v.estado]}
                      </BadgeEstado>
                    </TableCell>
                    <TableCell>
                      {pago && (
                        <BadgeEstado tono={TONO_PAGO[pago.estado]}>
                          {ETIQUETA_ESTADO_PAGO[pago.estado]}
                        </BadgeEstado>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </TablaEscritorio>
        </>
      )}
    </div>
  );
}
