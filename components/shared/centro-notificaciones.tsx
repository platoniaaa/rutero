"use client";

import Link from "next/link";
import {
  Bell,
  BadgeCheck,
  CalendarClock,
  FileWarning,
  Gavel,
  Inbox,
  Star,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRutero } from "@/lib/mock/store";
import { notificacionesDe, sinLeer } from "@/lib/mock/selectores";
import type { Rol, TipoNotificacion } from "@/lib/mock/types";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearRelativo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const ICONO: Record<TipoNotificacion, React.ElementType> = {
  oferta_calza: Inbox,
  respuesta_recibida: Inbox,
  adjudicacion: Gavel,
  recordatorio_viaje: CalendarClock,
  pago_liberado: Wallet,
  calificacion_pendiente: Star,
  documento_por_vencer: FileWarning,
};

const TONO: Partial<Record<TipoNotificacion, string>> = {
  adjudicacion: "text-go-ink",
  pago_liberado: "text-go-ink",
  documento_por_vencer: "text-stop",
  recordatorio_viaje: "text-signal-ink",
};

/**
 * Centro de notificaciones in-app. El destinatario depende del rol que se esté
 * encarnando en la barra superior.
 */
export function CentroNotificaciones({ rol }: { rol: Rol }) {
  const { datos, cargando } = useDatos();
  const sesion = useSesion();
  const marcarLeida = useRutero((s) => s.marcarNotificacionLeida);
  const marcarTodas = useRutero((s) => s.marcarTodasLeidas);

  const destinatarioId =
    rol === "agencia" ? sesion.agenciaId : rol === "transportista" ? sesion.carrierId : "admin";

  const notificaciones = cargando ? [] : notificacionesDe(datos, destinatarioId);
  const pendientes = cargando ? 0 : sinLeer(datos, destinatarioId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            pendientes > 0
              ? `Notificaciones, ${pendientes} sin leer`
              : "Notificaciones"
          }
          className="relative flex size-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Bell className="size-5" aria-hidden />
          {pendientes > 0 && (
            <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-medium text-ink">
              {pendientes}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-line p-3">
          <p className="font-display text-display-sm text-ink">Notificaciones</p>
          {pendientes > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodas(destinatarioId)}
            >
              Marcar todas
            </Button>
          )}
        </div>

        {notificaciones.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-meta">
            No tienes notificaciones. Acá te avisamos de ofertas que calzan,
            respuestas, adjudicaciones, pagos y documentos por vencer.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {notificaciones.map((n) => {
              const Icono = ICONO[n.tipo];
              return (
                <li key={n.id} className="border-b border-line last:border-b-0">
                  <Link
                    href={n.href}
                    onClick={() => marcarLeida(n.id)}
                    className={cn(
                      "flex gap-3 p-3 transition-colors hover:bg-muted",
                      !n.leida && "bg-signal-soft/40",
                    )}
                  >
                    <Icono
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        TONO[n.tipo] ?? "text-meta",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm text-ink",
                          !n.leida && "font-medium",
                        )}
                      >
                        {n.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-meta">{n.detalle}</p>
                      <p className="mt-1 text-xs text-meta">
                        {formatearRelativo(n.createdAt)}
                      </p>
                    </div>
                    {!n.leida && (
                      <span
                        aria-label="Sin leer"
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-signal"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {rol === "admin" && (
          <div className="border-t border-line p-3">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/verificacion">
                <BadgeCheck className="size-4" aria-hidden />
                Ir a la cola de verificación
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
