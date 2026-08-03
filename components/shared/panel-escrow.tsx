"use client";

import { CheckCircle2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRutero } from "@/lib/mock/store";
import type { Pago, Viaje } from "@/lib/mock/types";
import { formatearCLP, formatearFecha } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Escrow simulado. La agencia paga, el monto queda retenido y recién ahí se
 * revelan los contactos. El desglose de bruto, comisión y neto va siempre.
 */
export function PanelEscrow({
  viaje,
  pago,
  rol,
  comisionPct,
}: {
  viaje: Viaje;
  pago?: Pago;
  rol: "agencia" | "transportista";
  comisionPct: number;
}) {
  const pagarEscrow = useRutero((s) => s.pagarEscrow);
  const estado = pago?.estado ?? "pendiente";

  const cabecera = {
    pendiente: {
      icono: Wallet,
      titulo: rol === "agencia" ? "Falta pagar el escrow" : "Esperando el pago",
      tono: "border-signal/40 bg-signal-soft",
      color: "text-[#8a5b00]",
    },
    retenido: {
      icono: Lock,
      titulo: "Pago retenido en escrow",
      tono: "border-line bg-muted",
      color: "text-ink",
    },
    liberado: {
      icono: CheckCircle2,
      titulo: "Pago liberado",
      tono: "border-go/40 bg-go-soft",
      color: "text-[#0b6b60]",
    },
    reembolsado: {
      icono: Wallet,
      titulo: "Pago reembolsado",
      tono: "border-line bg-muted",
      color: "text-meta",
    },
    en_disputa: {
      icono: ShieldCheck,
      titulo: "Pago en disputa",
      tono: "border-stop/40 bg-stop-soft",
      color: "text-stop",
    },
  }[estado];

  const Icono = cabecera.icono;

  return (
    <section className={cn("rounded-lg border p-5", cabecera.tono)}>
      <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
        <Icono className={cn("size-5", cabecera.color)} aria-hidden />
        {cabecera.titulo}
      </h2>

      <dl className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-meta">
            {rol === "agencia" ? "Pagas" : "La agencia paga"}
          </dt>
          <dd className="font-mono tabular-nums text-ink">
            {formatearCLP(viaje.montoFinal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-meta">Comisión Rutero ({comisionPct}%)</dt>
          <dd className="font-mono tabular-nums text-stop">
            −{formatearCLP(viaje.comision)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line pt-1.5">
          <dt className="font-medium text-ink">
            {rol === "agencia" ? "Recibe el transportista" : "Recibes"}
          </dt>
          <dd className="font-mono font-medium tabular-nums text-[#0b6b60]">
            {formatearCLP(viaje.montoTransportista)}
          </dd>
        </div>
      </dl>

      {estado === "pendiente" && rol === "agencia" && (
        <>
          <p className="mt-4 text-sm text-ink/80">
            Al pagar, la plata queda retenida por Rutero hasta 24 horas después de
            finalizado el viaje. Recién en ese momento se revelan los datos de
            contacto de ambas partes.
          </p>
          <Button
            className="mt-3"
            size="lg"
            onClick={() => {
              pagarEscrow(viaje.id);
              toast.success("Pago retenido en escrow", {
                description: "Ya puedes ver los datos de contacto del transportista.",
              });
            }}
          >
            <Lock className="size-4" aria-hidden />
            Pagar {formatearCLP(viaje.montoFinal)} al escrow
          </Button>
        </>
      )}

      {estado === "pendiente" && rol === "transportista" && (
        <p className="mt-4 text-sm text-ink/80">
          La agencia todavía no deposita. Los datos de contacto se revelan cuando
          el pago entra al escrow.
        </p>
      )}

      {estado === "retenido" && (
        <p className="mt-4 text-sm text-meta">
          Retenido{" "}
          {pago?.fechaRetencion && (
            <>el {formatearFecha(pago.fechaRetencion)}</>
          )}
          . Se libera 24 horas después de que el viaje quede finalizado, si nadie
          abre una disputa.
        </p>
      )}

      {estado === "liberado" && pago?.fechaLiberacion && (
        <p className="mt-4 text-sm text-meta">
          Liberado el {formatearFecha(pago.fechaLiberacion)}.
        </p>
      )}

      {estado === "en_disputa" && (
        <p className="mt-4 text-sm text-ink/80">
          El pago queda congelado hasta que el equipo de Rutero resuelva.
        </p>
      )}

      {estado === "reembolsado" && (
        <p className="mt-4 text-sm text-meta">
          El monto volvió a la agencia según la regla de cancelación que aplicó.
        </p>
      )}
    </section>
  );
}
