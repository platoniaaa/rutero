"use client";

import { useState } from "react";
import { Check, FileCheck2, X } from "lucide-react";
import { toast } from "sonner";

import { BadgeDocumento } from "@/components/shared/badge-documento";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type { Datos, Documento } from "@/lib/mock/types";
import { useAhora, useDatos } from "@/lib/mock/use-datos";
import { ETIQUETA_DOCUMENTO, formatearFechaLarga, formatearPatente } from "@/lib/utils/format";
import { esDocumentoCritico, estadoEfectivoDocumento } from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

/** Describe a quién pertenece un documento: cuenta, vehículo o conductor. */
function describirPropietario(datos: Datos, doc: Documento) {
  const carrier = datos.transportistas.find((t) => t.id === doc.propietarioId);
  if (carrier) return { tipo: "Cuenta" as const, nombre: carrier.nombre, carrier };

  const vehiculo = datos.vehiculos.find((v) => v.id === doc.propietarioId);
  if (vehiculo) {
    return {
      tipo: "Vehículo" as const,
      nombre: `${formatearPatente(vehiculo.patente)} · ${vehiculo.marca} ${vehiculo.modelo}`,
      carrier: datos.transportistas.find((t) => t.id === vehiculo.carrierId),
    };
  }

  const conductor = datos.conductores.find((c) => c.id === doc.propietarioId);
  if (conductor) {
    return {
      tipo: "Conductor" as const,
      nombre: conductor.nombre,
      carrier: datos.transportistas.find((t) => t.id === conductor.carrierId),
    };
  }

  return {
    tipo: "Desconocido" as const,
    nombre: doc.propietarioId,
    carrier: undefined,
  };
}

export default function VerificacionPage() {
  const { datos, cargando } = useDatos();
  const ahora = useAhora();
  const aprobarDocumento = useRutero((s) => s.aprobarDocumento);
  const rechazarDocumento = useRutero((s) => s.rechazarDocumento);

  const [filtro, setFiltro] = useState<"pendientes" | "vencidos" | "todos">(
    "pendientes",
  );
  const [rechazando, setRechazando] = useState<Documento | undefined>();
  const [motivo, setMotivo] = useState("");

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Admin" titulo="Cola de verificación" />
        <ListaCargando filas={5} />
      </div>
    );
  }

  const conEstado = datos.documentos.map((doc) => ({
    doc,
    estado: estadoEfectivoDocumento(doc, ahora),
  }));

  const pendientes = conEstado.filter((x) => x.estado === "pendiente");
  const vencidos = conEstado.filter((x) => x.estado === "vencido");
  const rechazados = conEstado.filter((x) => x.estado === "rechazado");

  const visibles =
    filtro === "pendientes"
      ? pendientes
      : filtro === "vencidos"
        ? [...vencidos, ...rechazados]
        : conEstado;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Admin"
        titulo="Cola de verificación"
        descripcion="Aprueba o rechaza los documentos que suben los transportistas. Un documento crítico vencido bloquea la postulación."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Metrica etiqueta="Esperando revisión" valor={pendientes.length} tono="signal" />
        <Metrica etiqueta="Vencidos" valor={vencidos.length} tono="stop" />
        <Metrica etiqueta="Rechazados" valor={rechazados.length} />
        <Metrica etiqueta="Total en el sistema" valor={datos.documentos.length} />
      </div>

      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-2">
        {(
          [
            { clave: "pendientes", etiqueta: "Esperando revisión", n: pendientes.length },
            {
              clave: "vencidos",
              etiqueta: "Vencidos y rechazados",
              n: vencidos.length + rechazados.length,
            },
            { clave: "todos", etiqueta: "Todos", n: conEstado.length },
          ] as const
        ).map((f) => (
          <button
            key={f.clave}
            type="button"
            aria-pressed={filtro === f.clave}
            onClick={() => setFiltro(f.clave)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              filtro === f.clave
                ? "border-ink bg-ink text-white"
                : "border-line text-ink hover:border-meta",
            )}
          >
            {f.etiqueta}
            <span className="font-mono text-xs tabular-nums opacity-70">{f.n}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <ListaVacia
          icono={FileCheck2}
          titulo={
            filtro === "pendientes"
              ? "No hay nada esperando revisión"
              : "Nada en este filtro"
          }
          detalle={
            filtro === "pendientes"
              ? "Cuando un transportista suba un documento, aparece acá para que lo apruebes o lo rechaces."
              : "Prueba con otro filtro."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.slice(0, 60).map(({ doc, estado }) => {
            const info = describirPropietario(datos, doc);
            const critico = esDocumentoCritico(doc.tipo);
            return (
              <li
                key={doc.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-4",
                  estado === "vencido" ? "border-stop/40" : "border-line",
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {ETIQUETA_DOCUMENTO[doc.tipo]}
                    {critico && (
                      <span className="ml-2 text-eyebrow font-display text-stop">
                        Crítico
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-meta">
                    {info.tipo}: {info.nombre}
                    {info.carrier && info.tipo !== "Cuenta" && (
                      <> · {info.carrier.nombre}</>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-meta">
                    Emitido {formatearFechaLarga(doc.fechaEmision)}
                    {doc.fechaVencimiento && (
                      <> · vence {formatearFechaLarga(doc.fechaVencimiento)}</>
                    )}
                  </p>
                  {doc.motivoRechazo && (
                    <p className="mt-1 text-xs text-stop">{doc.motivoRechazo}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <BadgeDocumento documento={doc} ahora={ahora} />
                  {estado !== "aprobado" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        aprobarDocumento(doc.id);
                        toast.success("Documento aprobado");
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      Aprobar
                    </Button>
                  )}
                  {estado !== "rechazado" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRechazando(doc);
                        setMotivo("");
                      }}
                    >
                      <X className="size-4" aria-hidden />
                      Rechazar
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {visibles.length > 60 && (
        <p className="text-sm text-meta">
          Mostrando los primeros 60 de {visibles.length}. Filtra para acotar.
        </p>
      )}

      <Dialog
        open={!!rechazando}
        onOpenChange={(v) => !v && setRechazando(undefined)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-display-sm">
              Rechazar documento
            </DialogTitle>
            <DialogDescription>
              El motivo se le muestra al transportista para que sepa qué corregir.
              Sé concreto.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="La foto está cortada y no se lee la fecha de vencimiento. Vuelve a subirla completa."
            aria-label="Motivo del rechazo"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRechazando(undefined)}>
              Cancelar
            </Button>
            <Button
              disabled={!motivo.trim()}
              onClick={() => {
                if (!rechazando) return;
                rechazarDocumento(rechazando.id, motivo.trim());
                setRechazando(undefined);
                toast.success("Documento rechazado");
              }}
            >
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
