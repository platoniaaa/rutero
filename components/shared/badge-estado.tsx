import { cn } from "@/lib/utils";

export type TonoEstado = "neutro" | "espera" | "activo" | "listo" | "alerta";

const TONOS: Record<TonoEstado, string> = {
  neutro: "border-line bg-muted text-meta",
  espera: "border-line bg-secondary text-ink",
  activo: "border-signal/40 bg-signal-soft text-signal-ink",
  listo: "border-go/40 bg-go-soft text-go-ink",
  alerta: "border-stop/40 bg-stop-soft text-stop-ink",
};

/**
 * Badge de estado. El tono lo decide quien lo usa; el mapeo de cada estado del
 * negocio a su tono llega con los tipos en el Hito 1.
 */
export function BadgeEstado({
  children,
  tono = "neutro",
  className,
}: {
  children: React.ReactNode;
  tono?: TonoEstado;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
