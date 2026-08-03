import { Briefcase, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { PlacaPatente } from "@/components/shared/placa-patente";

export type VehiculoResumen = {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  capacidadPasajeros: number;
  capacidadEquipaje: number;
  equipamiento: string[];
};

/**
 * Tarjeta de vehículo. La placa manda: es el objeto que ambos lados reconocen
 * al instante.
 */
export function TarjetaVehiculo({
  vehiculo,
  className,
}: {
  vehiculo: VehiculoResumen;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-line bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-display-sm leading-none text-ink">
            {vehiculo.marca} {vehiculo.modelo}
          </h3>
          <p className="mt-1 text-sm text-meta">
            {vehiculo.tipo} · {vehiculo.anio}
          </p>
        </div>
        <PlacaPatente patente={vehiculo.patente} />
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="size-4 text-meta" aria-hidden />
          <dt className="sr-only">Capacidad de pasajeros</dt>
          <dd>
            <span className="font-mono font-medium">
              {vehiculo.capacidadPasajeros}
            </span>{" "}
            <span className="text-meta">pasajeros</span>
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="size-4 text-meta" aria-hidden />
          <dt className="sr-only">Capacidad de equipaje</dt>
          <dd>
            <span className="font-mono font-medium">
              {vehiculo.capacidadEquipaje}
            </span>{" "}
            <span className="text-meta">maletas</span>
          </dd>
        </div>
      </dl>

      {vehiculo.equipamiento.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {vehiculo.equipamiento.map((item) => (
            <li
              key={item}
              className="rounded border border-line bg-muted px-2 py-0.5 text-xs text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
