"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  PlayCircle,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type { Oferta, Viaje } from "@/lib/mock/types";
import { formatearCLP } from "@/lib/utils/format";
import { calcularCancelacion } from "@/lib/utils/rules";
import { differenceInHours, parseISO } from "date-fns";

/** Línea de tiempo del viaje. La flecha del estado actual va marcada. */
const PASOS: { estado: Viaje["estado"]; etiqueta: string }[] = [
  { estado: "confirmada", etiqueta: "Adjudicado" },
  { estado: "pago_retenido", etiqueta: "Pago retenido" },
  { estado: "en_curso", etiqueta: "En curso" },
  { estado: "finalizada", etiqueta: "Finalizado" },
  { estado: "liberada", etiqueta: "Pago liberado" },
];

export function LineaEstados({ viaje }: { viaje: Viaje }) {
  const cancelado = viaje.estado.startsWith("cancelada") || viaje.estado === "no_show";
  const indiceActual = PASOS.findIndex((p) => p.estado === viaje.estado);

  if (cancelado || viaje.estado === "en_disputa") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-stop/40 bg-stop-soft px-4 py-3">
        <AlertTriangle className="size-4 shrink-0 text-stop" aria-hidden />
        <p className="text-sm text-ink">
          {viaje.estado === "en_disputa"
            ? "Este viaje está en disputa. El equipo de Rutero lo está revisando."
            : "Este viaje fue cancelado."}
          {viaje.motivoCancelacion && (
            <span className="block text-ink/70">{viaje.motivoCancelacion}</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {PASOS.map((paso, i) => {
        const alcanzado = i <= indiceActual;
        const actual = i === indiceActual;
        return (
          <li key={paso.estado} className="flex items-center gap-1">
            <span
              aria-current={actual ? "step" : undefined}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                actual
                  ? "bg-signal font-medium text-ink"
                  : alcanzado
                    ? "bg-go-soft text-go-ink"
                    : "border border-line text-meta"
              }`}
            >
              {alcanzado && !actual && (
                <CheckCircle2 className="size-3.5" aria-hidden />
              )}
              {paso.etiqueta}
            </span>
            {i < PASOS.length - 1 && (
              <span aria-hidden className="h-px w-4 bg-line" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Acciones de transición según el rol y el estado actual. */
export function AccionesViaje({
  viaje,
  oferta,
  rol,
  ahora,
}: {
  viaje: Viaje;
  oferta: Oferta;
  rol: "agencia" | "transportista";
  ahora: Date;
}) {
  const marcarEnCurso = useRutero((s) => s.marcarEnCurso);
  const marcarFinalizada = useRutero((s) => s.marcarFinalizada);
  const confirmarViaje = useRutero((s) => s.confirmarViaje);
  const abrirDisputa = useRutero((s) => s.abrirDisputa);
  const cancelarViaje = useRutero((s) => s.cancelarViaje);
  const comisionPct = useRutero((s) => s.datos.comisiones.viajePct);

  const [motivoDisputa, setMotivoDisputa] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [dialogoCancelar, setDialogoCancelar] = useState(false);
  const [dialogoDisputa, setDialogoDisputa] = useState(false);

  const horasAntes = differenceInHours(parseISO(oferta.fechaHoraSalida), ahora);
  const resultado = calcularCancelacion(rol, horasAntes, viaje.montoFinal, comisionPct);

  const cancelable =
    viaje.estado === "confirmada" ||
    viaje.estado === "pago_retenido" ||
    viaje.estado === "en_curso";

  return (
    <div className="flex flex-wrap gap-2">
      {rol === "transportista" && viaje.estado === "pago_retenido" && (
        <Button
          onClick={() => {
            marcarEnCurso(viaje.id);
            toast.success("Viaje en curso");
          }}
        >
          <PlayCircle className="size-4" aria-hidden />
          Marcar en curso
        </Button>
      )}

      {rol === "transportista" && viaje.estado === "en_curso" && (
        <Button
          onClick={() => {
            marcarFinalizada(viaje.id);
            toast.success("Viaje finalizado", {
              description: "La agencia tiene 48 horas para confirmar o abrir disputa.",
            });
          }}
        >
          <Flag className="size-4" aria-hidden />
          Marcar finalizado
        </Button>
      )}

      {rol === "agencia" && viaje.estado === "finalizada" && (
        <>
          <Button
            onClick={() => {
              confirmarViaje(viaje.id);
              toast.success("Viaje confirmado", {
                description: `Se liberaron ${formatearCLP(viaje.montoTransportista)} al transportista.`,
              });
            }}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Confirmar y liberar pago
          </Button>
          <Button variant="outline" onClick={() => setDialogoDisputa(true)}>
            <ShieldAlert className="size-4" aria-hidden />
            Abrir disputa
          </Button>
        </>
      )}

      {cancelable && (
        <Button variant="ghost" onClick={() => setDialogoCancelar(true)}>
          <XCircle className="size-4" aria-hidden />
          Cancelar viaje
        </Button>
      )}

      {/* --- Cancelación con su penalidad --- */}
      {dialogoCancelar && (
        <AlertDialog open onOpenChange={(v) => !v && setDialogoCancelar(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-display-sm">
                ¿Cancelar este viaje?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Faltan{" "}
                    <span className="font-mono tabular-nums">
                      {Math.max(0, horasAntes)} h
                    </span>{" "}
                    para la salida. {resultado.descripcion}
                  </p>
                  <dl className="rounded-lg border border-line bg-muted p-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt>Vuelve a la agencia</dt>
                      <dd className="font-mono tabular-nums">
                        {formatearCLP(resultado.reembolsoAgencia)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Queda para el transportista</dt>
                      <dd className="font-mono tabular-nums">
                        {formatearCLP(resultado.pagoTransportista)}
                      </dd>
                    </div>
                    {resultado.comisionPlataforma > 0 && (
                      <div className="flex justify-between gap-4">
                        <dt>Comisión Rutero</dt>
                        <dd className="font-mono tabular-nums">
                          {formatearCLP(resultado.comisionPlataforma)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {resultado.penalizaScore && (
                    <p className="text-stop">
                      Cancelar como transportista penaliza tu score. Tres
                      cancelaciones en 90 días suspenden la cuenta.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Motivo de la cancelación"
              rows={2}
              aria-label="Motivo de la cancelación"
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  cancelarViaje(
                    viaje.id,
                    rol,
                    motivoCancelacion.trim() || "Sin motivo indicado",
                  );
                  setDialogoCancelar(false);
                  toast.success("Viaje cancelado", {
                    description: resultado.descripcion,
                  });
                }}
              >
                Cancelar el viaje
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* --- Disputa --- */}
      {dialogoDisputa && (
        <AlertDialog open onOpenChange={(v) => !v && setDialogoDisputa(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-display-sm">
                Abrir disputa
              </AlertDialogTitle>
              <AlertDialogDescription>
                El pago queda congelado hasta que el equipo de Rutero revise lo que
                pasó. Cuenta con detalle el problema: el chat del viaje sirve como
                respaldo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Textarea
              value={motivoDisputa}
              onChange={(e) => setMotivoDisputa(e.target.value)}
              placeholder="El vehículo llegó 40 minutos tarde y el grupo perdió la entrada al parque."
              rows={3}
              aria-label="Motivo de la disputa"
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                disabled={!motivoDisputa.trim()}
                onClick={() => {
                  abrirDisputa(viaje.id, motivoDisputa.trim());
                  setDialogoDisputa(false);
                  toast.success("Disputa abierta", {
                    description: "El pago quedó congelado mientras se revisa.",
                  });
                }}
              >
                Abrir disputa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
