import { cn } from "@/lib/utils";

export function EncabezadoPagina({
  seccion,
  titulo,
  descripcion,
  acciones,
  className,
}: {
  seccion?: string;
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4",
        className,
      )}
    >
      <div className="min-w-0">
        {seccion && (
          <p className="text-eyebrow font-display text-meta">{seccion}</p>
        )}
        <h1 className="font-display text-display text-ink">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-meta">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

/** Bloque de dato para las tiras de resumen de los paneles. */
export function Metrica({
  etiqueta,
  valor,
  detalle,
  tono = "neutro",
  className,
}: {
  etiqueta: string;
  valor: React.ReactNode;
  detalle?: string;
  tono?: "neutro" | "signal" | "go" | "stop";
  className?: string;
}) {
  const colorValor = {
    neutro: "text-ink",
    signal: "text-signal-ink",
    go: "text-go-ink",
    stop: "text-stop-ink",
  }[tono];

  return (
    <div
      className={cn("rounded-lg border border-line bg-surface p-4", className)}
    >
      <p className="text-eyebrow font-display text-meta">{etiqueta}</p>
      <p
        className={cn(
          "mt-1 font-mono text-display-sm tabular-nums",
          colorValor,
        )}
      >
        {valor}
      </p>
      {detalle && <p className="mt-1 text-xs text-meta">{detalle}</p>}
    </div>
  );
}
