"use client";

import { useState } from "react";
import { HandCoins, Users } from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaGrupo } from "@/components/shared/tarjeta-grupo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import {
  grupo as buscarGrupo,
  gruposAbiertos,
  ofertasDeGrupo,
  referidosDeAgencia,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import type { Grupo, Id } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_VIAJE } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VIAJE,
  formatearCLP,
  formatearNumero,
  parsearMonto,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

function DialogoResponder({
  grupo,
  agenciaId,
  onCerrar,
}: {
  grupo: Grupo;
  agenciaId: Id;
  onCerrar: () => void;
}) {
  const responderGrupo = useRutero((s) => s.responderGrupo);
  const [ticketTexto, setTicketTexto] = useState(
    formatearNumero(grupo.ticketEstimadoPorPasajero),
  );
  const [comisionPct, setComisionPct] = useState(
    String(grupo.comisionSolicitadaPct),
  );
  const [nota, setNota] = useState("");

  const ticket = parsearMonto(ticketTexto) ?? 0;
  const pct = Number(comisionPct) || 0;
  const total = ticket * grupo.cantidadPasajeros;
  const comision = Math.round((total * pct) / 100);
  const valido = ticket > 0 && pct > 0 && pct <= 50;

  const negociaALaBaja = pct < grupo.comisionSolicitadaPct;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-display-sm">
          Tomar el grupo
        </DialogTitle>
        <DialogDescription>
          Propón tu ticket por pasajero y la comisión que le pagas al
          transportista. Él decide entre las agencias que respondan.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg border border-line bg-muted p-3 text-sm">
        <p className="font-medium text-ink">{grupo.titulo}</p>
        <p className="mt-0.5 text-meta">
          <span className="font-mono tabular-nums">{grupo.cantidadPasajeros}</span>{" "}
          personas · pide{" "}
          <span className="font-mono tabular-nums">
            {grupo.comisionSolicitadaPct}%
          </span>{" "}
          sobre un ticket de{" "}
          <span className="font-mono tabular-nums">
            {formatearCLP(grupo.ticketEstimadoPorPasajero)}
          </span>
          /pax
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="og-ticket">Tu ticket por pasajero</Label>
          <Input
            id="og-ticket"
            inputMode="numeric"
            value={ticketTexto}
            onChange={(e) => setTicketTexto(e.target.value)}
            onBlur={() => {
              const n = parsearMonto(ticketTexto);
              if (n) setTicketTexto(formatearNumero(n));
            }}
            className="font-mono tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="og-comision">Comisión que le pagas</Label>
          <div className="flex items-center gap-2">
            <Input
              id="og-comision"
              type="number"
              min={1}
              max={50}
              value={comisionPct}
              onChange={(e) => setComisionPct(e.target.value)}
              className="w-24 font-mono tabular-nums"
            />
            <span className="text-sm text-meta">%</span>
          </div>
          {negociaALaBaja && (
            <p className="text-xs text-meta">
              Estás ofreciendo menos de lo que pide. Explícalo en la nota.
            </p>
          )}
        </div>
      </div>

      {total > 0 && (
        <dl className="grid gap-1 rounded-lg border border-line bg-muted p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">Cobras a los pasajeros</dt>
            <dd className="font-mono tabular-nums text-ink">
              {formatearCLP(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">Le pagas al transportista ({pct}%)</dt>
            <dd className="font-mono tabular-nums text-stop">
              −{formatearCLP(comision)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-1">
            <dt className="font-medium text-ink">Te queda</dt>
            <dd className="font-mono font-medium tabular-nums text-go-ink">
              {formatearCLP(total - comision)}
            </dd>
          </div>
        </dl>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="og-nota">Nota</Label>
        <Textarea
          id="og-nota"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Tomamos el grupo con entrada y clase incluidas. Mantenemos tu 10%."
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button
          disabled={!valido}
          onClick={() => {
            responderGrupo({
              grupoId: grupo.id,
              agenciaId,
              ticketPropuestoPorPasajero: ticket,
              comisionOfrecidaPct: pct,
              nota: nota.trim(),
            });
            toast.success("Respuesta enviada", {
              description: "El transportista decide entre las agencias que responden.",
            });
            onCerrar();
          }}
        >
          <HandCoins className="size-4" aria-hidden />
          Enviar propuesta
        </Button>
      </DialogFooter>
    </>
  );
}

export default function GruposAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const ahora = useAhora();
  const pagarEscrowReferido = useRutero((s) => s.pagarEscrowReferido);
  const liberarReferido = useRutero((s) => s.liberarReferido);
  const [respondiendo, setRespondiendo] = useState<Grupo | undefined>();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Grupos disponibles" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const grupos = gruposAbiertos(datos, ahora);
  const misReferidos = referidosDeAgencia(datos, agenciaId);
  const comisionesPagadas = misReferidos.reduce(
    (s, r) => s + r.comisionTransportista,
    0,
  );
  const ticketGanado = misReferidos.reduce((s, r) => s + r.ticketTotal, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Grupos disponibles"
        descripcion="Transportistas que ya tienen el grupo armado y buscan agencia. Es el flujo inverso: acá tú compras la demanda."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Grupos abiertos" valor={grupos.length} />
        <Metrica
          etiqueta="Grupos que tomaste"
          valor={misReferidos.length}
          tono="go"
        />
        <Metrica
          etiqueta="Ticket generado"
          valor={formatearCLP(ticketGanado)}
          detalle={`${formatearCLP(comisionesPagadas)} en comisiones pagadas`}
        />
      </div>

      {/* Grupos ya adjudicados: escrow de la comisión y cierre */}
      {misReferidos.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-display-sm text-ink">
            Grupos que tomaste
          </h2>
          <ul className="flex flex-col gap-2">
            {misReferidos.map((r) => {
              const g = buscarGrupo(datos, r.grupoId);
              const carrier = buscarTransportista(datos, r.carrierId);
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{g?.titulo}</p>
                    <p className="text-sm text-meta">
                      {carrier?.nombre} · cobras{" "}
                      <span className="font-mono tabular-nums">
                        {formatearCLP(r.ticketTotal)}
                      </span>{" "}
                      y le pagas{" "}
                      <span className="font-mono tabular-nums">
                        {formatearCLP(r.comisionTransportista)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <BadgeEstado tono={TONO_VIAJE[r.estado]}>
                      {r.estado === "confirmada"
                        ? "Falta depositar la comisión"
                        : r.estado === "pago_retenido"
                          ? "Comisión en escrow"
                          : ETIQUETA_ESTADO_VIAJE[r.estado]}
                    </BadgeEstado>

                    {r.estado === "confirmada" && (
                      <Button
                        onClick={() => {
                          pagarEscrowReferido(r.id);
                          toast.success("Comisión depositada en escrow");
                        }}
                      >
                        Depositar {formatearCLP(r.comisionTransportista)}
                      </Button>
                    )}
                    {r.estado === "pago_retenido" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          liberarReferido(r.id);
                          toast.success("Comisión liberada", {
                            description: `${carrier?.nombre} recibe ${formatearCLP(r.montoTransportista)}.`,
                          });
                        }}
                      >
                        Tour completado, liberar
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <h2 className="font-display text-display-sm text-ink">
        Grupos buscando agencia
      </h2>

      {grupos.length === 0 ? (
        <ListaVacia
          icono={Users}
          titulo="No hay grupos disponibles ahora"
          detalle="Cuando un transportista publique un grupo en una zona donde operas, aparece acá. Es demanda que llega armada."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {grupos.map((grupo) => {
            const carrier = buscarTransportista(datos, grupo.carrierId);
            const mias = ofertasDeGrupo(datos, grupo.id).filter(
              (o) => o.agenciaId === agenciaId,
            );
            const yaRespondi = mias.some((o) => o.estado !== "rechazada");

            return (
              <li key={grupo.id}>
                <TarjetaGrupo
                  grupo={grupo}
                  ahora={ahora}
                  autor={carrier?.nombre}
                  pie={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-meta">
                        {yaRespondi
                          ? "Ya enviaste tu propuesta. El transportista está decidiendo."
                          : `Si lo tomas, le pagas ${grupo.comisionSolicitadaPct}% del ticket total y el resto es tu margen.`}
                      </p>
                      <Button
                        variant={yaRespondi ? "outline" : "default"}
                        disabled={yaRespondi}
                        onClick={() => setRespondiendo(grupo)}
                      >
                        {yaRespondi ? "Propuesta enviada" : "Tomar el grupo"}
                      </Button>
                    </div>
                  }
                  className={cn(yaRespondi && "border-go/40")}
                />
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!respondiendo}
        onOpenChange={(v) => !v && setRespondiendo(undefined)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {respondiendo && (
            <DialogoResponder
              grupo={respondiendo}
              agenciaId={agenciaId}
              onCerrar={() => setRespondiendo(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
