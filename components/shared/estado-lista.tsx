import { AlertTriangle, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Filas fantasma mientras el store lee `localStorage`. */
export function ListaCargando({
  filas = 3,
  className,
}: {
  filas?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-busy>
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: filas }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-lg border border-line bg-surface p-4"
        >
          <div className="size-11 shrink-0 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
          </div>
          <div className="h-6 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/**
 * Estado vacío. El copy invita a actuar en vez de constatar la nada, según la
 * sección 11.
 */
export function ListaVacia({
  titulo,
  detalle,
  accion,
  icono: Icono = Inbox,
  className,
}: {
  titulo: string;
  detalle?: string;
  accion?: React.ReactNode;
  icono?: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-muted px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-meta">
        <Icono className="size-5" aria-hidden />
      </span>
      <p className="font-display text-display-sm text-ink">{titulo}</p>
      {detalle && <p className="max-w-md text-sm text-meta">{detalle}</p>}
      {accion}
    </div>
  );
}

/** Estado de error. Dice qué pasó y cómo salir, sin pedir disculpas. */
export function ListaError({
  titulo = "No pudimos cargar esta lista",
  detalle = "No pudimos leer la información en este momento. Recarga la página para volver a intentarlo.",
  onReintentar,
  className,
}: {
  titulo?: string;
  detalle?: string;
  onReintentar?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-stop/40 bg-stop-soft px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-stop">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <p className="font-display text-display-sm text-ink">{titulo}</p>
      <p className="max-w-md text-sm text-ink/80">{detalle}</p>
      {onReintentar && (
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
