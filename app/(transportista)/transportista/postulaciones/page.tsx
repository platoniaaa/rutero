"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Send, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { PlacaPatente } from "@/components/shared/placa-patente";
import { Button } from "@/components/ui/button";
import { useRutero } from "@/lib/mock/store";
import {
  oferta as buscarOferta,
  vehiculo as buscarVehiculo,
  respuestasDeCarrier,
  viajePorOferta,
} from "@/lib/mock/selectores";
import type { EstadoRespuesta } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_RESPUESTA } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_RESPUESTA,
  formatearCLP,
  formatearCuentaRegresiva,
  formatearFecha,
  formatearRelativo,
} from "@/lib/utils/format";
import { desglosarViaje } from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

const FILTROS: { clave: string; etiqueta: string; estados: EstadoRespuesta[] }[] = [
  { clave: "activas", etiqueta: "Esperando respuesta", estados: ["activa"] },
  { clave: "ganadas", etiqueta: "Ganadas", estados: ["ganadora"] },
  {
    clave: "cerradas",
    etiqueta: "Rechazadas y retiradas",
    estados: ["rechazada", "retirada"],
  },
];

export default function PostulacionesPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();
  const retirarRespuesta = useRutero((s) => s.retirarRespuesta);
  const [filtro, setFiltro] = useState("todas");

  const respuestas = useMemo(
    () => (cargando ? [] : respuestasDeCarrier(datos, carrierId)),
    [datos, carrierId, cargando],
  );

  const visibles = useMemo(() => {
    if (filtro === "todas") return respuestas;
    const estados = FILTROS.find((f) => f.clave === filtro)?.estados ?? [];
    return respuestas.filter((r) => estados.includes(r.estado));
  }, [respuestas, filtro]);

  const activas = respuestas.filter((r) => r.estado === "activa");
  const ganadas = respuestas.filter((r) => r.estado === "ganadora");
  const montoEnJuego = activas.reduce((suma, r) => suma + r.monto, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Mis postulaciones"
        descripcion="Todo lo que respondiste, esperando decisión de la agencia o ya resuelto."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Esperando respuesta" valor={activas.length} />
        <Metrica etiqueta="Ganadas" valor={ganadas.length} tono="go" />
        <Metrica
          etiqueta="Monto en juego"
          valor={formatearCLP(montoEnJuego)}
          detalle="Suma de tus respuestas activas"
          tono="signal"
        />
      </div>

      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filtro === "todas"}
          onClick={() => setFiltro("todas")}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            filtro === "todas"
              ? "border-ink bg-ink text-white"
              : "border-line text-ink hover:border-meta",
          )}
        >
          Todas
          <span className="font-mono text-xs tabular-nums opacity-70">
            {respuestas.length}
          </span>
        </button>
        {FILTROS.map((f) => (
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
            <span className="font-mono text-xs tabular-nums opacity-70">
              {respuestas.filter((r) => f.estados.includes(r.estado)).length}
            </span>
          </button>
        ))}
      </div>

      {cargando ? (
        <ListaCargando filas={3} />
      ) : visibles.length === 0 ? (
        <ListaVacia
          icono={Send}
          titulo={
            filtro === "todas"
              ? "Todavía no has postulado a nada"
              : "Nada en este filtro"
          }
          detalle={
            filtro === "todas"
              ? "Cuando respondas una oferta del feed la vas a ver acá, con su estado y el desglose de lo que recibes."
              : "Prueba con otro filtro."
          }
          accion={
            filtro === "todas" ? (
              <Button asChild>
                <Link href="/transportista/ofertas">Ver el feed de ofertas</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visibles.map((r) => {
            const oferta = buscarOferta(datos, r.ofertaId);
            const vehiculo = buscarVehiculo(datos, r.vehiculoId);
            if (!oferta) return null;

            const viaje = viajePorOferta(datos, oferta.id);
            const desglose = desglosarViaje(r.monto, datos.comisiones.viajePct);
            const ofertaAbierta =
              oferta.estado === "publicada" || oferta.estado === "con_respuestas";

            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-lg border bg-surface p-4",
                  r.estado === "ganadora" ? "border-go/40" : "border-line",
                  (r.estado === "rechazada" || r.estado === "retirada") &&
                    "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-meta">
                        {oferta.codigo}
                      </span>
                      <BadgeEstado tono={TONO_RESPUESTA[r.estado]}>
                        {r.estado === "activa"
                          ? r.tipo === "aceptacion"
                            ? "Aceptaste el precio"
                            : "Contraoferta enviada"
                          : ETIQUETA_ESTADO_RESPUESTA[r.estado]}
                      </BadgeEstado>
                    </div>

                    <h3 className="mt-2 font-display text-display-sm text-ink">
                      {oferta.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-meta">
                      {formatearFecha(oferta.fechaHoraSalida)} ·{" "}
                      <span className="font-mono tabular-nums">
                        {oferta.cantidadPasajeros}
                      </span>{" "}
                      pasajeros
                    </p>
                    <p className="mt-1 text-xs text-meta">
                      Respondiste {formatearRelativo(r.createdAt)}
                      {ofertaAbierta && (
                        <>
                          {" "}
                          · la oferta cierra en{" "}
                          <span className="font-mono tabular-nums">
                            {formatearCuentaRegresiva(oferta.expiraEn, ahora)}
                          </span>
                        </>
                      )}
                    </p>
                    {r.nota && (
                      <p className="mt-2 max-w-lg text-sm text-ink/70">“{r.nota}”</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {vehiculo && (
                      <PlacaPatente patente={vehiculo.patente} tamano="sm" />
                    )}
                    <div className="text-right">
                      <p className="font-mono text-lg font-medium tabular-nums text-ink">
                        {formatearCLP(r.monto)}
                      </p>
                      <p className="font-mono text-xs tabular-nums text-meta">
                        recibes {formatearCLP(desglose.neto)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {r.estado === "activa" && ofertaAbierta && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            retirarRespuesta(r.id);
                            toast.success("Postulación retirada");
                          }}
                        >
                          <Undo2 className="size-4" aria-hidden />
                          Retirar
                        </Button>
                      )}
                      {viaje && r.estado === "ganadora" ? (
                        <Button size="sm" asChild>
                          <Link href={`/transportista/viajes/${viaje.id}`}>
                            Ver el viaje
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/transportista/ofertas/${oferta.id}`}>
                            Ver la oferta
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
