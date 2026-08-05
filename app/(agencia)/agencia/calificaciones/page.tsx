"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { TarjetaCalificacion } from "@/components/shared/calificar";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import {
  agencia as buscarAgencia,
  calificacionesDeViaje,
  calificacionesRecibidas,
  oferta as buscarOferta,
  transportista as buscarTransportista,
  viaje as buscarViaje,
  viajesPorCalificar,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearFecha } from "@/lib/utils/format";
import { calificacionesVisibles, promedio } from "@/lib/utils/rules";

export default function CalificacionesAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Calificaciones" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const cuenta = buscarAgencia(datos, agenciaId);
  const recibidas = calificacionesRecibidas(datos, agenciaId);
  const pendientes = viajesPorCalificar(datos, agenciaId, "agencia");

  const visiblesParaMi = recibidas.filter((c) =>
    calificacionesVisibles(
      calificacionesDeViaje(datos, c.viajeId),
      buscarViaje(datos, c.viajeId)?.finalizadoEn,
      ahora,
    ),
  );

  const promedioReal = promedio(
    visiblesParaMi.map((c) => c.puntuacionGeneral),
  );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Calificaciones"
        descripcion="Los transportistas te califican en claridad del brief, puntualidad de los pasajeros y pago."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <Metrica
          etiqueta="Tu promedio"
          valor={
            promedioReal > 0
              ? promedioReal.toFixed(1)
              : cuenta?.ratingPromedio.toFixed(1) ?? "—"
          }
          detalle="Sobre 5"
          tono="go"
        />
        <Metrica etiqueta="Calificaciones recibidas" valor={recibidas.length} />
        <Metrica
          etiqueta="Te faltan por calificar"
          valor={pendientes.length}
          tono={pendientes.length > 0 ? "signal" : "neutro"}
        />
      </div>

      {pendientes.length > 0 && (
        <section className="rounded-lg border border-signal/40 bg-signal-soft p-4">
          <h2 className="font-display text-display-sm text-ink">
            {pendientes.length === 1
              ? "Un viaje espera tu calificación"
              : `${pendientes.length} viajes esperan tu calificación`}
          </h2>
          <p className="mt-1 text-sm text-ink/80">
            Se te va a pedir antes de tu próxima publicación, pero la puedes saltar.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {pendientes.map((viaje) => {
              const oferta = buscarOferta(datos, viaje.ofertaId);
              return (
                <li
                  key={viaje.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3"
                >
                  <div>
                    <p className="font-medium text-ink">{oferta?.titulo}</p>
                    <p className="text-sm text-meta">
                      {buscarTransportista(datos, viaje.carrierId)?.nombre}
                      {viaje.finalizadoEn && (
                        <> · {formatearFecha(viaje.finalizadoEn)}</>
                      )}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/agencia/viajes/${viaje.id}`}>Calificar</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-display-sm text-ink">
          Lo que dicen de ti
        </h2>

        {recibidas.length === 0 ? (
          <ListaVacia
            icono={Star}
            titulo="Todavía no te califican"
            detalle="Después de cada viaje completado, el transportista te califica en claridad del brief, puntualidad de los pasajeros y pago."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {recibidas.map((c) => {
              const viaje = buscarViaje(datos, c.viajeId);
              const oferta = viaje ? buscarOferta(datos, viaje.ofertaId) : undefined;
              const visible = calificacionesVisibles(
                calificacionesDeViaje(datos, c.viajeId),
                viaje?.finalizadoEn,
                ahora,
              );
              return (
                <li key={c.id}>
                  {oferta && (
                    <p className="mb-1 text-xs text-meta">
                      <span className="font-mono">{oferta.codigo}</span> ·{" "}
                      {oferta.titulo}
                    </p>
                  )}
                  <TarjetaCalificacion
                    calificacion={c}
                    autor={
                      buscarTransportista(datos, c.autorId)?.nombre ??
                      "Transportista"
                    }
                    visible={visible}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
