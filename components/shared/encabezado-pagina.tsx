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
        "flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3 sm:gap-4 sm:pb-4",
        className,
      )}
    >
      <div className="min-w-0">
        {/* En celular el rol ya lo dicen el menú de cuenta y la barra de
            abajo, y la bajada es texto que explica la pantalla: las apps no
            las traen. Ambas se van bajo `sm` para que el contenido parta
            arriba en vez de a un cuarto de pantalla. */}
        {seccion && (
          <p className="hidden text-eyebrow font-display text-meta sm:block">
            {seccion}
          </p>
        )}
        <h1 className="font-display text-display text-ink">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 hidden max-w-2xl text-sm text-meta sm:block">
            {descripcion}
          </p>
        )}
      </div>
      {acciones && (
        // En pantalla chica las acciones ocupan la línea completa y se
        // reparten el ancho: blancos grandes para el pulgar.
        <div className="flex w-full flex-wrap gap-2 [&>*]:flex-1 sm:w-auto sm:[&>*]:flex-none">
          {acciones}
        </div>
      )}
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
