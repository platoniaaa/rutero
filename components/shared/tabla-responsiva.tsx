import { cn } from "@/lib/utils";

/**
 * Las tablas densas no caben en un celular. En vez de encogerlas hasta que no
 * se lean, bajo el punto de corte cada fila pasa a ser una tarjeta: un título,
 * un dato destacado a la derecha y el resto como lista de etiqueta/valor.
 *
 * La tabla sigue existiendo en pantalla grande, que es donde comparar de un
 * vistazo importa.
 */
export function FilaTarjeta({
  titulo,
  subtitulo,
  destacado,
  detalleDestacado,
  datos,
  pie,
  className,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  destacado?: React.ReactNode;
  detalleDestacado?: React.ReactNode;
  /** Pares etiqueta/valor. Los que vengan vacíos no se muestran. */
  datos?: { etiqueta: string; valor: React.ReactNode }[];
  pie?: React.ReactNode;
  className?: string;
}) {
  const visibles = (datos ?? []).filter((d) => d.valor);

  return (
    <li className={cn("rounded-lg border border-line bg-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-ink">{titulo}</div>
          {subtitulo && <div className="text-sm text-meta">{subtitulo}</div>}
        </div>
        {destacado && (
          <div className="shrink-0 text-right">
            <div className="font-mono font-medium tabular-nums text-ink">
              {destacado}
            </div>
            {detalleDestacado && (
              <div className="text-xs text-meta">{detalleDestacado}</div>
            )}
          </div>
        )}
      </div>

      {visibles.length > 0 && (
        <dl className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-sm">
          {visibles.map((d) => (
            <div key={d.etiqueta} className="flex justify-between gap-3">
              <dt className="shrink-0 text-meta">{d.etiqueta}</dt>
              <dd className="text-right text-ink">{d.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {pie && <div className="mt-3">{pie}</div>}
    </li>
  );
}

/** Lista de tarjetas que reemplaza a la tabla bajo el punto de corte. */
export function ListaTarjetas({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-3 lg:hidden", className)}>{children}</ul>
  );
}

/** Envoltorio de la tabla, que solo aparece en pantalla grande. */
export function TablaEscritorio({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-line lg:block">
      {children}
    </div>
  );
}
