"use client";

import { useRef, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Adjunto } from "@/lib/mock/types";
import {
  TIPOS_ACEPTADOS,
  etiquetaTipo,
  formatearPeso,
  prepararAdjunto,
} from "@/lib/utils/archivo";
import { cn } from "@/lib/utils";

function IconoDe({ tipo, nombre }: { tipo: string; nombre: string }) {
  const etiqueta = etiquetaTipo(tipo, nombre);
  if (etiqueta === "Imagen") return <ImageIcon className="size-4" aria-hidden />;
  if (etiqueta === "Planilla" || etiqueta === "CSV") {
    return <FileSpreadsheet className="size-4" aria-hidden />;
  }
  return <FileText className="size-4" aria-hidden />;
}

/** Ficha de un adjunto. En modo lectura permite descargarlo. */
export function FichaAdjunto({
  adjunto,
  onQuitar,
}: {
  adjunto: Adjunto;
  onQuitar?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded bg-muted text-meta">
          <IconoDe tipo={adjunto.tipo} nombre={adjunto.nombre} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{adjunto.nombre}</p>
          <p className="text-xs text-meta">
            {etiquetaTipo(adjunto.tipo, adjunto.nombre)} ·{" "}
            <span className="font-mono tabular-nums">
              {formatearPeso(adjunto.tamano)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <a
            href={adjunto.contenido}
            download={adjunto.nombre}
            aria-label={`Descargar ${adjunto.nombre}`}
          >
            <Download className="size-4" aria-hidden />
            <span className="hidden sm:inline">Descargar</span>
          </a>
        </Button>
        {onQuitar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onQuitar}
            aria-label={`Quitar ${adjunto.nombre}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * Adjunta documentos al brief. Acepta arrastrar y soltar, o el selector de
 * archivos. Las imágenes se comprimen; el resto tiene tope de peso porque todo
 * vive en `localStorage` durante la demo.
 */
export function AdjuntarDocumentos({
  adjuntos,
  onCambio,
  maximo = 4,
}: {
  adjuntos: Omit<Adjunto, "id">[];
  onCambio: (adjuntos: Omit<Adjunto, "id">[]) => void;
  maximo?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [encima, setEncima] = useState(false);

  const lleno = adjuntos.length >= maximo;

  async function agregar(archivos: FileList | null) {
    if (!archivos?.length) return;

    const cupo = maximo - adjuntos.length;
    if (cupo <= 0) {
      toast.error(`Puedes adjuntar hasta ${maximo} documentos.`);
      return;
    }

    setProcesando(true);
    const nuevos: Omit<Adjunto, "id">[] = [];

    for (const archivo of Array.from(archivos).slice(0, cupo)) {
      const resultado = await prepararAdjunto(archivo);
      if (resultado.ok) nuevos.push(resultado.adjunto);
      else toast.error(resultado.motivo);
    }

    setProcesando(false);
    if (nuevos.length) {
      onCambio([...adjuntos, ...nuevos]);
      toast.success(
        nuevos.length === 1
          ? `${nuevos[0].nombre} adjuntado`
          : `${nuevos.length} documentos adjuntados`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          if (!lleno) void agregar(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          encima ? "border-signal bg-signal-soft" : "border-line bg-muted",
          lleno && "opacity-60",
        )}
      >
        <Paperclip className="size-5 text-meta" aria-hidden />
        <p className="text-sm text-ink">
          {procesando
            ? "Procesando los archivos…"
            : lleno
              ? `Llegaste al máximo de ${maximo} documentos`
              : "Arrastra el itinerario acá, o elígelo desde tu computador"}
        </p>
        <p className="text-xs text-meta">
          PDF, Word, planilla o imagen. Las fotos se achican solas.
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={TIPOS_ACEPTADOS}
          className="sr-only"
          onChange={(e) => {
            void agregar(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1"
          disabled={procesando || lleno}
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivos
        </Button>
      </div>

      {adjuntos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {adjuntos.map((a, i) => (
            <FichaAdjunto
              key={`${a.nombre}-${i}`}
              adjunto={{ ...a, id: `tmp-${i}` }}
              onQuitar={() => onCambio(adjuntos.filter((_, j) => j !== i))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
