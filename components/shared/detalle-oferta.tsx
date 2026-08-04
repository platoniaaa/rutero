import {
  ArrowRight,
  Clock,
  Gauge,
  MapPin,
  Paperclip,
  StickyNote,
  Timer,
  Users,
} from "lucide-react";

import { FichaAdjunto } from "@/components/shared/adjuntar-documentos";
import type { Oferta } from "@/lib/mock/types";
import {
  ETIQUETA_BLOQUE,
  ETIQUETA_REQUERIMIENTO,
  ETIQUETA_TIPO_SERVICIO,
  formatearCLP,
  formatearCuentaRegresiva,
  formatearFecha,
  montoPorPasajero,
} from "@/lib/utils/format";

/**
 * Ficha completa de la oferta: la misma para la agencia que la publicó y para
 * el transportista que la evalúa.
 */
export function DetalleOferta({ oferta, ahora }: { oferta: Oferta; ahora: Date }) {
  const abierta =
    oferta.estado === "publicada" || oferta.estado === "con_respuestas";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Ruta e itinerario */}
      <section className="min-w-0 rounded-lg border border-line bg-surface p-5 lg:col-span-2">
        <h2 className="font-display text-display-sm text-ink">Itinerario</h2>

        <ol className="mt-4 flex flex-col gap-0">
          <li className="relative flex gap-3 pb-5">
            <span
              aria-hidden
              className="absolute top-2.5 left-[7px] h-full w-px bg-line"
            />
            <span className="relative z-10 mt-1.5 size-4 shrink-0 rounded-full border-2 border-ink bg-surface" />
            <div>
              <p className="text-eyebrow font-display text-meta">Salida</p>
              <p className="text-ink">{oferta.origen}</p>
              <p className="font-mono text-sm tabular-nums text-meta">
                {formatearFecha(oferta.fechaHoraSalida)}
              </p>
            </div>
          </li>

          {oferta.paradas.map((parada, i) => (
            <li key={i} className="relative flex gap-3 pb-5">
              <span
                aria-hidden
                className="absolute top-2.5 left-[7px] h-full w-px bg-line"
              />
              <span className="relative z-10 mt-1.5 ml-0.5 size-3 shrink-0 rounded-full border-2 border-meta bg-surface" />
              <div>
                <p className="text-eyebrow font-display text-meta">Parada</p>
                <p className="text-ink">{parada.nombre}</p>
                {parada.hora && (
                  <p className="font-mono text-sm tabular-nums text-meta">
                    {parada.hora}
                  </p>
                )}
              </div>
            </li>
          ))}

          <li className="relative flex gap-3">
            <span className="relative z-10 mt-1.5 size-4 shrink-0 rounded-full border-2 border-signal bg-signal" />
            <div>
              <p className="text-eyebrow font-display text-meta">Destino</p>
              <p className="text-ink">{oferta.destino}</p>
              {oferta.fechaHoraRetorno && (
                <p className="font-mono text-sm tabular-nums text-meta">
                  Retorno: {formatearFecha(oferta.fechaHoraRetorno)}
                </p>
              )}
            </div>
          </li>
        </ol>

        {/* Mapa placeholder — sin API real en la fase 1 */}
        <div
          aria-hidden
          className="mt-5 flex h-36 items-center justify-center rounded-lg border border-dashed border-line bg-muted"
        >
          <p className="flex items-center gap-2 text-sm text-meta">
            <MapPin className="size-4" />
            {oferta.origen.split(",")[0]}
            <ArrowRight className="size-4" />
            {oferta.destino.split(",")[0]}
          </p>
        </div>

        {oferta.notas && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-muted p-4">
            <StickyNote className="mt-0.5 size-4 shrink-0 text-meta" aria-hidden />
            <div>
              <p className="text-eyebrow font-display text-meta">
                Detalles de la agencia
              </p>
              {/* El texto puede venir con saltos de línea del brief. */}
              <p className="mt-1 text-sm whitespace-pre-line text-ink">
                {oferta.notas}
              </p>
            </div>
          </div>
        )}

        {oferta.adjuntos.length > 0 && (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-eyebrow font-display text-meta">
              <Paperclip className="size-3.5" aria-hidden />
              Documentos del viaje ({oferta.adjuntos.length})
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {oferta.adjuntos.map((adjunto) => (
                <FichaAdjunto key={adjunto.id} adjunto={adjunto} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Condiciones */}
      <section className="flex min-w-0 flex-col gap-4">
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-eyebrow font-display text-meta">
            Presupuesto referencial
          </p>
          <p className="mt-1 font-mono text-display tabular-nums text-ink">
            {formatearCLP(oferta.presupuestoReferencial)}
          </p>
          <p className="font-mono text-sm tabular-nums text-meta">
            ≈{" "}
            {formatearCLP(
              montoPorPasajero(
                oferta.presupuestoReferencial,
                oferta.cantidadPasajeros,
              ),
            )}
            /pax con {oferta.cantidadPasajeros} pasajeros
          </p>
          {oferta.tarifaHoraExtra && (
            <p className="mt-2 text-sm text-meta">
              Hora extra:{" "}
              <span className="font-mono tabular-nums text-ink">
                {formatearCLP(oferta.tarifaHoraExtra)}
              </span>
            </p>
          )}
          {abierta && (
            <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm text-meta">
              <Timer className="size-4" aria-hidden />
              Cierra en{" "}
              <span className="font-mono tabular-nums text-ink">
                {formatearCuentaRegresiva(oferta.expiraEn, ahora)}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="font-display text-display-sm text-ink">Condiciones</h2>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-meta">
                <Gauge className="size-4" aria-hidden />
                Bloque
              </dt>
              <dd className="text-right text-ink">
                {ETIQUETA_BLOQUE[oferta.bloqueServicio]}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-meta">
                <Clock className="size-4" aria-hidden />
                Horas estimadas
              </dt>
              <dd className="font-mono tabular-nums text-ink">
                {oferta.horasEstimadas} h
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-meta">
                <Users className="size-4" aria-hidden />
                Pasajeros
              </dt>
              <dd className="font-mono tabular-nums text-ink">
                {oferta.cantidadPasajeros}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-meta">Tipo de servicio</dt>
              <dd className="text-right text-ink">
                {ETIQUETA_TIPO_SERVICIO[oferta.tipoServicio]}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-meta">Adjudicación</dt>
              <dd className="text-right text-ink">
                {oferta.modoAdjudicacion === "yo_elijo"
                  ? "La agencia elige"
                  : "Automática al primero"}
              </dd>
            </div>
          </dl>

          {oferta.requerimientos.length > 0 && (
            <>
              <p className="mt-4 text-eyebrow font-display text-meta">
                Requerimientos
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {oferta.requerimientos.map((req) => (
                  <li
                    key={req}
                    className="rounded border border-line bg-muted px-2 py-0.5 text-xs text-ink"
                  >
                    {ETIQUETA_REQUERIMIENTO[req]}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
