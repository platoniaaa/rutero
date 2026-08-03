import { CalendarDays, MapPin, Percent, Users } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import type { Grupo } from "@/lib/mock/types";
import { TONO_GRUPO } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_GRUPO,
  formatearCLP,
  formatearCuentaRegresiva,
  formatearFecha,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function TarjetaGrupo({
  grupo,
  ahora,
  autor,
  pie,
  className,
}: {
  grupo: Grupo;
  ahora: Date;
  /** Nombre del transportista, cuando lo mira la agencia. */
  autor?: string;
  pie?: React.ReactNode;
  className?: string;
}) {
  const ticketTotal = grupo.ticketEstimadoPorPasajero * grupo.cantidadPasajeros;
  const comision = Math.round((ticketTotal * grupo.comisionSolicitadaPct) / 100);
  const abierto = grupo.estado === "publicado" || grupo.estado === "con_ofertas";

  return (
    <article
      className={cn("rounded-lg border border-line bg-surface p-4", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-meta">{grupo.codigo}</span>
            <BadgeEstado tono={TONO_GRUPO[grupo.estado]}>
              {ETIQUETA_ESTADO_GRUPO[grupo.estado]}
            </BadgeEstado>
          </div>

          <h3 className="mt-2 font-display text-display-sm text-ink">
            {grupo.titulo}
          </h3>

          {autor && <p className="mt-1 text-sm text-ink">{autor}</p>}

          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-meta">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {grupo.origen ? `${grupo.origen} → ` : ""}
              {grupo.destinoOTour}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {formatearFecha(grupo.fecha)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              <span className="font-mono tabular-nums">
                {grupo.cantidadPasajeros}
              </span>{" "}
              personas
            </span>
          </p>

          {grupo.notas && (
            <p className="mt-2 max-w-2xl text-sm text-ink/70">{grupo.notas}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-xl font-medium tabular-nums text-ink">
            {formatearCLP(ticketTotal)}
          </p>
          <p className="font-mono text-sm tabular-nums text-meta">
            {formatearCLP(grupo.ticketEstimadoPorPasajero)}/pax
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-sm text-ink">
            <Percent className="size-3.5 text-meta" aria-hidden />
            <span className="font-mono tabular-nums">
              {grupo.comisionSolicitadaPct}%
            </span>
            <span className="text-meta">
              = {formatearCLP(comision)}
            </span>
          </p>
          {abierto && (
            <p className="mt-1 text-xs text-meta">
              Cierra en{" "}
              <span className="font-mono tabular-nums">
                {formatearCuentaRegresiva(grupo.expiraEn, ahora)}
              </span>
            </p>
          )}
        </div>
      </div>

      {pie && <div className="mt-3 border-t border-line pt-3">{pie}</div>}
    </article>
  );
}
