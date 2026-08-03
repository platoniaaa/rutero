"use client";

import { Printer } from "lucide-react";

import { PlacaPatente } from "@/components/shared/placa-patente";
import { Button } from "@/components/ui/button";
import type {
  Agencia,
  Conductor,
  Oferta,
  Pasajero,
  Vehiculo,
  Viaje,
} from "@/lib/mock/types";
import {
  formatearFecha,
  formatearHora,
  formatearTelefono,
} from "@/lib/utils/format";

/**
 * Hoja de ruta imprimible. Es el papel que el chofer lleva en la mano: código
 * de abordaje, ruta, patente, conductor y nómina numerada con casilla para
 * marcar presente. Los estilos de impresión están en globals.css.
 */
export function HojaRuta({
  viaje,
  oferta,
  vehiculo,
  conductor,
  agencia,
  pasajeros,
}: {
  viaje: Viaje;
  oferta: Oferta;
  vehiculo?: Vehiculo;
  conductor?: Conductor;
  agencia?: Agencia;
  pasajeros: Pasajero[];
}) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 print:hidden">
        <div>
          <h2 className="font-display text-display-sm text-ink">Hoja de ruta</h2>
          <p className="mt-0.5 text-sm text-meta">
            Imprímela y llévala contigo. Incluye la nómina para marcar presente.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden />
          Imprimir
        </Button>
      </div>

      {/* Lo que sale en el papel */}
      <div id="hoja-ruta" className="p-6 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <p className="font-display text-eyebrow text-meta">Rutero · Hoja de ruta</p>
            <h1 className="font-display text-display text-ink">{oferta.titulo}</h1>
            <p className="mt-1 text-sm text-ink">
              {agencia?.razonSocial ?? "Agencia"} · {oferta.codigo}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-eyebrow text-meta">Código de abordaje</p>
            <p className="font-mono text-display tracking-[0.15em] tabular-nums text-ink">
              {viaje.codigoAbordaje}
            </p>
          </div>
        </header>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-display text-eyebrow text-meta">Salida</p>
            <p className="text-ink">{oferta.origen}</p>
            <p className="font-mono text-sm tabular-nums text-ink">
              {formatearFecha(oferta.fechaHoraSalida)}
            </p>
          </div>
          <div>
            <p className="font-display text-eyebrow text-meta">Destino</p>
            <p className="text-ink">{oferta.destino}</p>
            {oferta.fechaHoraRetorno && (
              <p className="font-mono text-sm tabular-nums text-ink">
                Retorno {formatearFecha(oferta.fechaHoraRetorno)}
              </p>
            )}
          </div>
          <div>
            <p className="font-display text-eyebrow text-meta">Vehículo y conductor</p>
            {vehiculo && (
              <div className="mt-1">
                <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                <p className="mt-1 text-sm text-ink">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
              </div>
            )}
            {conductor && (
              <p className="mt-1 text-sm text-ink">
                {conductor.nombre} ·{" "}
                <span className="font-mono tabular-nums">
                  {formatearTelefono(conductor.telefono)}
                </span>
              </p>
            )}
          </div>
        </div>

        {oferta.paradas.length > 0 && (
          <div className="mt-4">
            <p className="font-display text-eyebrow text-meta">Paradas</p>
            <ol className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink">
              {oferta.paradas.map((p, i) => (
                <li key={i}>
                  {i + 1}. {p.nombre}
                  {p.hora && (
                    <span className="font-mono tabular-nums text-meta"> · {p.hora}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {agencia && (
          <div className="mt-4 border-t border-line pt-3 text-sm">
            <span className="font-display text-eyebrow text-meta">
              Contacto de la agencia:{" "}
            </span>
            {viaje.contactosRevelados ? (
              <span className="text-ink">
                {agencia.contacto.nombre} ·{" "}
                <span className="font-mono tabular-nums">
                  {formatearTelefono(agencia.contacto.telefono)}
                </span>
              </span>
            ) : (
              <span className="text-meta">
                se revela cuando el pago entra al escrow
              </span>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-1">
            <h2 className="font-display text-display-sm text-ink">
              Nómina de pasajeros
            </h2>
            <p className="font-mono text-sm tabular-nums text-meta">
              {pasajeros.length} de {oferta.cantidadPasajeros}
            </p>
          </div>

          {pasajeros.length === 0 ? (
            <p className="py-6 text-center text-sm text-meta">
              La agencia todavía no carga la lista de embarque.
            </p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="w-10 py-1 font-display text-eyebrow text-meta">
                    Ok
                  </th>
                  <th className="w-8 py-1 font-display text-eyebrow text-meta">#</th>
                  <th className="py-1 font-display text-eyebrow text-meta">
                    Pasajero
                  </th>
                  <th className="py-1 font-display text-eyebrow text-meta">
                    Documento
                  </th>
                  <th className="py-1 font-display text-eyebrow text-meta">
                    Recogida
                  </th>
                  <th className="py-1 font-display text-eyebrow text-meta">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pasajeros.map((p, i) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="py-2">
                      <span
                        aria-hidden
                        className="block size-4 rounded-sm border-2 border-ink"
                      />
                    </td>
                    <td className="py-2 font-mono tabular-nums text-meta">{i + 1}</td>
                    <td className="py-2 text-ink">{p.nombreCompleto}</td>
                    <td className="py-2 font-mono text-xs tabular-nums text-ink">
                      {p.documento || "—"}
                    </td>
                    <td className="py-2 text-ink">{p.puntoRecogida || "—"}</td>
                    <td className="py-2 text-meta">{p.observaciones || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <footer className="mt-6 flex justify-between border-t border-line pt-3 text-xs text-meta">
          <span>
            Salida {formatearHora(oferta.fechaHoraSalida)} · {oferta.cantidadPasajeros}{" "}
            pasajeros contratados
          </span>
          <span className="font-mono">{viaje.codigoAbordaje}</span>
        </footer>
      </div>
    </section>
  );
}
