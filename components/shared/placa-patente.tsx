import { cn } from "@/lib/utils";
import { formatearPatente } from "@/lib/utils/format";

const TAMANOS = {
  sm: { patente: "text-base px-2 py-0.5", banda: "text-[7px] py-px" },
  md: { patente: "text-2xl px-3 py-1", banda: "text-[8px] py-0.5" },
  // Una placa `lg` mide casi 200px: en un celular de 375px no deja espacio
  // para nada al lado, así que bajo `sm:` se comporta como `md`.
  lg: {
    patente: "text-2xl px-3 py-1 sm:text-4xl sm:px-4 sm:py-1.5",
    banda: "text-[8px] py-0.5 sm:text-[10px]",
  },
} as const;

/**
 * Elemento firma del producto. La patente se presenta como la placa real:
 * bloque mono, borde grueso y banda de país arriba.
 */
export function PlacaPatente({
  patente,
  tamano = "md",
  className,
}: {
  patente: string;
  tamano?: keyof typeof TAMANOS;
  className?: string;
}) {
  const t = TAMANOS[tamano];

  return (
    <span
      className={cn(
        // `shrink-0`: la placa es un objeto de tamaño fijo. Sin esto el
        // `overflow-hidden` anula su ancho mínimo automático y un hermano
        // flex la aplasta hasta cortar la patente.
        "inline-flex shrink-0 flex-col overflow-hidden rounded border-2 border-ink bg-white text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-ink text-center font-display tracking-[0.3em] text-white",
          t.banda,
        )}
      >
        Chile
      </span>
      <span
        className={cn(
          "text-center font-mono font-bold tracking-[0.12em] tabular-nums",
          t.patente,
        )}
      >
        {formatearPatente(patente)}
      </span>
    </span>
  );
}
