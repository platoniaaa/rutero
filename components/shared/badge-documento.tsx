import { CheckCircle2, Clock, FileWarning, XCircle } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { ETIQUETA_DOCUMENTO } from "@/lib/utils/format";
import { formatearFechaLarga } from "@/lib/utils/format";
import { TONO_DOCUMENTO, TONO_VIGENCIA } from "@/lib/ui/estados";
import type { Documento } from "@/lib/mock/types";
import { estadoEfectivoDocumento, vigenciaDocumento } from "@/lib/utils/rules";
import { differenceInDays, parseISO } from "date-fns";

/**
 * Badge de vencimiento de la sección 7.3: verde sobre 30 días, ámbar bajo 30,
 * rojo vencido. Los estados de revisión mandan por sobre la vigencia.
 */
export function BadgeDocumento({
  documento,
  ahora,
}: {
  documento: Documento;
  ahora: Date;
}) {
  const estado = estadoEfectivoDocumento(documento, ahora);

  if (estado === "vencido") {
    const dias = documento.fechaVencimiento
      ? Math.abs(differenceInDays(parseISO(documento.fechaVencimiento), ahora))
      : 0;
    return (
      <BadgeEstado tono="alerta">
        <XCircle className="size-3.5" aria-hidden />
        Vencido hace {dias} {dias === 1 ? "día" : "días"}
      </BadgeEstado>
    );
  }

  if (estado === "pendiente") {
    return (
      <BadgeEstado tono={TONO_DOCUMENTO.pendiente}>
        <Clock className="size-3.5" aria-hidden />
        En revisión
      </BadgeEstado>
    );
  }

  if (estado === "rechazado") {
    return (
      <BadgeEstado tono={TONO_DOCUMENTO.rechazado}>
        <FileWarning className="size-3.5" aria-hidden />
        Rechazado
      </BadgeEstado>
    );
  }

  const vigencia = vigenciaDocumento(documento, ahora);

  if (vigencia === "sin_vencimiento") {
    return (
      <BadgeEstado tono="listo">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Aprobado
      </BadgeEstado>
    );
  }

  const dias = differenceInDays(parseISO(documento.fechaVencimiento!), ahora);

  return (
    <BadgeEstado tono={TONO_VIGENCIA[vigencia]}>
      {vigencia === "por_vencer" ? (
        <Clock className="size-3.5" aria-hidden />
      ) : (
        <CheckCircle2 className="size-3.5" aria-hidden />
      )}
      {vigencia === "por_vencer"
        ? `Vence en ${dias} ${dias === 1 ? "día" : "días"}`
        : `Vigente hasta ${formatearFechaLarga(documento.fechaVencimiento!)}`}
    </BadgeEstado>
  );
}

export function nombreDocumento(documento: Documento): string {
  return ETIQUETA_DOCUMENTO[documento.tipo];
}
