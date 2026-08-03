"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { BadgeDocumento } from "@/components/shared/badge-documento";
import { DialogoSubirDocumento } from "@/components/shared/subida-documento";
import { Button } from "@/components/ui/button";
import {
  AYUDA_DOCUMENTO,
  DOCS_DOS_CARAS,
  DOCS_SIN_VENCIMIENTO,
} from "@/lib/documentos-requeridos";
import { useRutero } from "@/lib/mock/store";
import type { Documento, Id, TipoDocumento } from "@/lib/mock/types";
import { ETIQUETA_DOCUMENTO } from "@/lib/utils/format";
import { esDocumentoCritico } from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

function FilaDocumento({
  tipo,
  documento,
  propietarioId,
  interurbano,
  ahora,
}: {
  tipo: TipoDocumento;
  documento?: Documento;
  propietarioId: Id;
  interurbano: boolean;
  ahora: Date;
}) {
  const [abierto, setAbierto] = useState(false);
  const subirDocumento = useRutero((s) => s.subirDocumento);
  const critico = esDocumentoCritico(tipo, interurbano);
  const ayuda = AYUDA_DOCUMENTO[tipo];

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <FileText
          className={cn("mt-0.5 size-4 shrink-0", documento ? "text-meta" : "text-line")}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {ETIQUETA_DOCUMENTO[tipo]}
            {critico && (
              <span className="ml-2 align-middle text-eyebrow font-display text-stop">
                Crítico
              </span>
            )}
          </p>
          {ayuda && <p className="mt-0.5 max-w-lg text-xs text-meta">{ayuda}</p>}
          {documento?.motivoRechazo && (
            <p className="mt-1 max-w-lg text-xs text-stop">{documento.motivoRechazo}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {documento ? (
          <BadgeDocumento documento={documento} ahora={ahora} />
        ) : (
          <span className="text-xs text-meta">Sin subir</span>
        )}
        <Button variant="outline" size="sm" onClick={() => setAbierto(true)}>
          <Upload className="size-4" aria-hidden />
          {documento ? "Reemplazar" : "Subir"}
        </Button>
      </div>

      <DialogoSubirDocumento
        abierto={abierto}
        onAbrirCambio={setAbierto}
        titulo={ETIQUETA_DOCUMENTO[tipo]}
        descripcion={ayuda}
        dosCaras={DOCS_DOS_CARAS.includes(tipo)}
        pideVencimiento={!DOCS_SIN_VENCIMIENTO.includes(tipo)}
        onConfirmar={({ archivo, fechaEmision, fechaVencimiento }) => {
          subirDocumento({
            propietarioId,
            tipo,
            archivo,
            fechaEmision,
            fechaVencimiento,
          });
          toast.success(`${ETIQUETA_DOCUMENTO[tipo]} enviado a revisión`);
        }}
      />
    </li>
  );
}

/** Lista los documentos que le corresponden a una cuenta, vehículo o conductor. */
export function PanelDocumentos({
  titulo,
  propietarioId,
  tipos,
  documentos,
  interurbano = false,
  ahora,
  className,
}: {
  titulo?: string;
  propietarioId: Id;
  tipos: TipoDocumento[];
  documentos: Documento[];
  interurbano?: boolean;
  ahora: Date;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-line bg-surface p-4", className)}>
      {titulo && (
        <h3 className="mb-2 font-display text-display-sm text-ink">{titulo}</h3>
      )}
      <ul>
        {tipos.map((tipo) => (
          <FilaDocumento
            key={tipo}
            tipo={tipo}
            documento={documentos.find((d) => d.tipo === tipo)}
            propietarioId={propietarioId}
            interurbano={interurbano}
            ahora={ahora}
          />
        ))}
      </ul>
    </section>
  );
}
