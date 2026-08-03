"use client";

import { useState } from "react";
import { EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type {
  Calificacion,
  DimensionesAgencia,
  DimensionesTransportista,
  Id,
} from "@/lib/mock/types";
import { cn } from "@/lib/utils";

/** Dimensiones de la sección 5, distintas según a quién se califica. */
const DIMENSIONES_TRANSPORTISTA: {
  clave: keyof DimensionesTransportista;
  etiqueta: string;
}[] = [
  { clave: "puntualidad", etiqueta: "Puntualidad" },
  { clave: "estadoVehiculo", etiqueta: "Estado del vehículo" },
  { clave: "trato", etiqueta: "Trato" },
  { clave: "comunicacion", etiqueta: "Comunicación" },
];

const DIMENSIONES_AGENCIA: {
  clave: keyof DimensionesAgencia;
  etiqueta: string;
}[] = [
  { clave: "claridadBrief", etiqueta: "Claridad del brief" },
  { clave: "puntualidadPasajeros", etiqueta: "Puntualidad de los pasajeros" },
  { clave: "pago", etiqueta: "Pago" },
];

function Estrellas({
  valor,
  onCambio,
  etiqueta,
}: {
  valor: number;
  onCambio: (v: number) => void;
  etiqueta: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} de 5`}
          onClick={() => onCambio(n)}
          className="flex size-11 items-center justify-center rounded"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              n <= valor ? "fill-signal text-signal" : "text-line",
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

/** Muestra una calificación ya emitida, con sus dimensiones. */
export function TarjetaCalificacion({
  calificacion,
  autor,
  visible,
}: {
  calificacion: Calificacion;
  autor: string;
  visible: boolean;
}) {
  const dimensiones =
    calificacion.autorRol === "agencia"
      ? DIMENSIONES_TRANSPORTISTA
      : DIMENSIONES_AGENCIA;

  if (!visible) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-line bg-muted p-4">
        <EyeOff className="size-5 shrink-0 text-meta" aria-hidden />
        <p className="text-sm text-meta">
          {autor} ya te calificó, pero la calificación es ciega: se revela cuando
          tú también califiques, o a los 7 días.
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink">{autor}</p>
        <p className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn(
                "size-4",
                n <= calificacion.puntuacionGeneral
                  ? "fill-signal text-signal"
                  : "text-line",
              )}
              aria-hidden
            />
          ))}
          <span className="ml-1 font-mono text-sm tabular-nums text-ink">
            {calificacion.puntuacionGeneral},0
          </span>
        </p>
      </div>

      {calificacion.comentario && (
        <p className="mt-2 text-sm text-ink">“{calificacion.comentario}”</p>
      )}

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 text-sm">
        {dimensiones.map((d) => (
          <div key={d.clave} className="flex items-center gap-1.5">
            <dt className="text-meta">{d.etiqueta}</dt>
            <dd className="font-mono tabular-nums text-ink">
              {
                (calificacion.dimensiones as Record<string, number>)[
                  d.clave as string
                ]
              }
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/** Formulario de calificación. Bidireccional: cambia según a quién se califica. */
export function DialogoCalificar({
  abierto,
  onAbrirCambio,
  viajeId,
  autorRol,
  autorId,
  destinatarioId,
  nombreDestinatario,
}: {
  abierto: boolean;
  onAbrirCambio: (v: boolean) => void;
  viajeId: Id;
  autorRol: "agencia" | "transportista";
  autorId: Id;
  destinatarioId: Id;
  nombreDestinatario: string;
}) {
  const calificar = useRutero((s) => s.calificar);
  const dimensiones =
    autorRol === "agencia" ? DIMENSIONES_TRANSPORTISTA : DIMENSIONES_AGENCIA;

  const [puntajes, setPuntajes] = useState<Record<string, number>>({});
  const [general, setGeneral] = useState(0);
  const [comentario, setComentario] = useState("");

  const completo = general > 0 && dimensiones.every((d) => puntajes[d.clave] > 0);

  function limpiar() {
    setPuntajes({});
    setGeneral(0);
    setComentario("");
  }

  function enviar() {
    if (!completo) return;
    calificar({
      viajeId,
      autorRol,
      autorId,
      destinatarioId,
      puntuacionGeneral: general,
      dimensiones: puntajes as unknown as
        | DimensionesAgencia
        | DimensionesTransportista,
      comentario: comentario.trim(),
    });
    limpiar();
    onAbrirCambio(false);
    toast.success("Calificación enviada", {
      description:
        "Se revela cuando la otra parte también califique, o a los 7 días.",
    });
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) limpiar();
        onAbrirCambio(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm">
            Calificar a {nombreDestinatario}
          </DialogTitle>
          <DialogDescription>
            Es ciega: la otra parte ve tu calificación cuando también te califique,
            o a los 7 días. Puedes saltarla, pero se te va a pedir de nuevo antes de
            la próxima postulación.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Calificación general</p>
            <Estrellas
              valor={general}
              onCambio={setGeneral}
              etiqueta="Calificación general"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            {dimensiones.map((d) => (
              <div
                key={d.clave}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <p className="text-sm text-ink">{d.etiqueta}</p>
                <Estrellas
                  valor={puntajes[d.clave] ?? 0}
                  onCambio={(v) => setPuntajes({ ...puntajes, [d.clave]: v })}
                  etiqueta={d.etiqueta}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <label htmlFor="cal-comentario" className="text-sm font-medium text-ink">
              Comentario
            </label>
            <Textarea
              id="cal-comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder={
                autorRol === "agencia"
                  ? "Llegó antes de la hora y la van impecable."
                  : "Brief claro y el pago se liberó al tiro."
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onAbrirCambio(false)}>
            Saltar por ahora
          </Button>
          <Button onClick={enviar} disabled={!completo}>
            Enviar calificación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
