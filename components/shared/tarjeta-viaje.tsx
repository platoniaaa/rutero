import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { PlacaPatente } from "@/components/shared/placa-patente";
import type { Oferta, Vehiculo, Viaje } from "@/lib/mock/types";
import { TONO_VIAJE } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VIAJE,
  formatearCLP,
  formatearFecha,
} from "@/lib/utils/format";

export function TarjetaViaje({
  viaje,
  oferta,
  vehiculo,
  contraparte,
  href,
  montoDestacado,
  etiquetaMonto,
}: {
  viaje: Viaje;
  oferta: Oferta;
  vehiculo?: Vehiculo;
  contraparte: string;
  href: string;
  montoDestacado: number;
  etiquetaMonto: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-line bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-meta">{oferta.codigo}</span>
            <BadgeEstado tono={TONO_VIAJE[viaje.estado]}>
              {ETIQUETA_ESTADO_VIAJE[viaje.estado]}
            </BadgeEstado>
            <span className="font-mono text-xs tracking-wider text-meta">
              {viaje.codigoAbordaje}
            </span>
          </div>

          <h3 className="mt-2 font-display text-display-sm text-ink">
            {oferta.titulo}
          </h3>
          <p className="mt-1 text-sm text-meta">
            {oferta.origen} <ArrowRight className="inline size-3.5" aria-hidden />{" "}
            {oferta.destino}
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
              </span>
            </span>
            <span>{contraparte}</span>
          </p>
        </div>

        {/* Igual que en la tarjeta de oferta: en celular la placa y el monto no
            caben al costado, así que forman una franja al pie —placa a la
            izquierda, monto a la derecha— en vez de apilarse colgando. */}
        <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-line pt-3 sm:w-auto sm:flex-col sm:items-end sm:gap-2 sm:border-0 sm:pt-0">
          {vehiculo && <PlacaPatente patente={vehiculo.patente} tamano="sm" />}
          <div className="ml-auto text-right sm:ml-0">
            <p className="font-mono text-lg font-medium tabular-nums text-ink">
              {formatearCLP(montoDestacado)}
            </p>
            <p className="text-xs text-meta">{etiquetaMonto}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
