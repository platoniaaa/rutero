import { ArrowRight, Clock, MapPin, Users } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import type { Oferta } from "@/lib/mock/types";
import { TONO_OFERTA } from "@/lib/ui/estados";
import {
  ETIQUETA_BLOQUE,
  ETIQUETA_ESTADO_OFERTA,
  formatearCLP,
  formatearCuentaRegresiva,
  formatearFecha,
  montoPorPasajero,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Fila de oferta compartida entre la lista de la agencia y el feed del
 * transportista. La doble lectura del precio va siempre: total y por pasajero.
 */
export function TarjetaOferta({
  oferta,
  ahora,
  atenuada = false,
  motivoAtenuada,
  pie,
  mostrarEstado = true,
  className,
}: {
  oferta: Oferta;
  ahora: Date;
  /** Ofertas que chocan con un bloqueo se muestran apagadas con el motivo. */
  atenuada?: boolean;
  motivoAtenuada?: string;
  pie?: React.ReactNode;
  mostrarEstado?: boolean;
  className?: string;
}) {
  const abierta = oferta.estado === "publicada" || oferta.estado === "con_respuestas";

  return (
    <article
      className={cn(
        "rounded-lg border border-line bg-surface p-4 transition-colors",
        atenuada && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-meta">{oferta.codigo}</span>
            {mostrarEstado && (
              <BadgeEstado tono={TONO_OFERTA[oferta.estado]}>
                {ETIQUETA_ESTADO_OFERTA[oferta.estado]}
              </BadgeEstado>
            )}
            <span className="rounded border border-line bg-muted px-2 py-0.5 text-xs text-ink">
              {ETIQUETA_BLOQUE[oferta.bloqueServicio]}
            </span>
          </div>

          <h3 className="mt-2 font-display text-display-sm text-ink">
            {oferta.titulo}
          </h3>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-meta">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0">
              {oferta.origen} <ArrowRight className="inline size-3.5" aria-hidden />{" "}
              {oferta.destino}
              {oferta.esIdaYVuelta && " · ida y vuelta"}
            </span>
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-meta">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {formatearFecha(oferta.fechaHoraSalida)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              <span className="font-mono tabular-nums">
                {oferta.cantidadPasajeros}
              </span>{" "}
              pasajeros
            </span>
          </p>
        </div>

        {/* En celular el precio no cabe al lado del título: se envolvía solo y
            quedaba colgando a la derecha en una columna de 100px. Acá pasa a
            ser una franja propia al pie, en una línea. Desde `sm` vuelve a la
            columna derecha, que es donde se comparan varias ofertas de un
            vistazo. */}
        <div className="w-full shrink-0 border-t border-line pt-3 sm:w-auto sm:border-0 sm:pt-0 sm:text-right">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:block">
            <p className="font-mono text-xl font-medium tabular-nums text-ink">
              {formatearCLP(oferta.presupuestoReferencial)}
            </p>
            <p className="font-mono text-sm tabular-nums text-meta">
              ≈ {formatearCLP(montoPorPasajero(oferta.presupuestoReferencial, oferta.cantidadPasajeros))}
              /pax
            </p>
            {abierta && (
              <p className="ml-auto text-xs text-meta sm:mt-1 sm:ml-0">
                Cierra en{" "}
                <span className="font-mono tabular-nums">
                  {formatearCuentaRegresiva(oferta.expiraEn, ahora)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {atenuada && motivoAtenuada && (
        <p className="mt-3 rounded border border-line bg-muted px-3 py-2 text-sm text-ink/80">
          {motivoAtenuada}
        </p>
      )}

      {pie && <div className="mt-3 border-t border-line pt-3">{pie}</div>}
    </article>
  );
}
