"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { DialogoCalificar, TarjetaCalificacion } from "@/components/shared/calificar";
import { Button } from "@/components/ui/button";
import {
  agencia as buscarAgencia,
  calificacionesDeViaje,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import type { Id, Viaje } from "@/lib/mock/types";
import { useDatos } from "@/lib/mock/use-datos";
import { calificacionesVisibles } from "@/lib/utils/rules";

/**
 * Bloque de calificación dentro del detalle del viaje. Aparece cuando el viaje
 * quedó finalizado o liberado.
 */
export function PanelCalificaciones({
  viaje,
  rol,
  autorId,
  ahora,
}: {
  viaje: Viaje;
  rol: "agencia" | "transportista";
  autorId: Id;
  ahora: Date;
}) {
  const { datos } = useDatos();
  const [abierto, setAbierto] = useState(false);

  const calificable = viaje.estado === "finalizada" || viaje.estado === "liberada";
  if (!calificable) return null;

  const calificaciones = calificacionesDeViaje(datos, viaje.id);
  const propia = calificaciones.find((c) => c.autorId === autorId);
  const ajena = calificaciones.find((c) => c.autorId !== autorId);

  const visibles = calificacionesVisibles(
    calificaciones,
    viaje.finalizadoEn,
    ahora,
  );

  const destinatarioId = rol === "agencia" ? viaje.carrierId : viaje.agenciaId;
  const nombreDestinatario =
    rol === "agencia"
      ? (buscarTransportista(datos, viaje.carrierId)?.nombre ?? "el transportista")
      : (buscarAgencia(datos, viaje.agenciaId)?.razonSocial ?? "la agencia");

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
          <Star className="size-5 text-signal" aria-hidden />
          Calificaciones
        </h2>
        {!propia && (
          <Button onClick={() => setAbierto(true)}>
            Calificar a {nombreDestinatario.split(" ")[0]}
          </Button>
        )}
      </div>

      {!propia && (
        <p className="text-sm text-meta">
          La calificación es ciega y bidireccional: ninguno ve la del otro hasta
          que ambos califiquen, o a los 7 días.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {propia && (
          <div>
            <p className="mb-1 text-eyebrow font-display text-meta">
              Tu calificación
            </p>
            <TarjetaCalificacion
              calificacion={propia}
              autor="Tú"
              visible
            />
          </div>
        )}

        {ajena && (
          <div>
            <p className="mb-1 text-eyebrow font-display text-meta">
              Lo que te calificaron
            </p>
            <TarjetaCalificacion
              calificacion={ajena}
              autor={nombreDestinatario}
              visible={visibles}
            />
          </div>
        )}

        {!ajena && propia && (
          <p className="text-sm text-meta">
            {nombreDestinatario} todavía no te califica.
          </p>
        )}
      </div>

      <DialogoCalificar
        abierto={abierto}
        onAbrirCambio={setAbierto}
        viajeId={viaje.id}
        autorRol={rol}
        autorId={autorId}
        destinatarioId={destinatarioId}
        nombreDestinatario={nombreDestinatario}
      />
    </section>
  );
}
