import { HardHat } from "lucide-react";

/**
 * Marcador de ruta para las pantallas que todavía no se construyen. Existe para
 * que el shell se pueda recorrer completo desde el primer hito sin caer en 404.
 * Cada hito la va reemplazando por la pantalla real.
 */
export function PantallaPendiente({
  titulo,
  hito,
  descripcion,
}: {
  titulo: string;
  hito: number;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-eyebrow font-display text-meta">Pantalla pendiente</p>
        <h1 className="font-display text-display text-ink">{titulo}</h1>
      </div>

      <div className="flex max-w-2xl items-start gap-3 rounded-lg border border-dashed border-line bg-muted p-5">
        <HardHat className="mt-0.5 size-5 shrink-0 text-signal" aria-hidden />
        <div>
          <p className="text-sm text-ink">{descripcion}</p>
          <p className="mt-2 text-sm text-meta">
            Se construye en el hito{" "}
            <span className="font-mono font-medium text-ink">{hito}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
