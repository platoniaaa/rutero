"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Phone, Star } from "lucide-react";

import { ListaEmbarque } from "@/components/agencia/lista-embarque";
import { BadgeEstado } from "@/components/shared/badge-estado";
import { ChatViaje } from "@/components/shared/chat-viaje";
import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import { AccionesViaje, LineaEstados } from "@/components/shared/estado-viaje";
import { ListaCargando, ListaError } from "@/components/shared/estado-lista";
import { PanelCalificaciones } from "@/components/shared/panel-calificaciones";
import { PanelEscrow } from "@/components/shared/panel-escrow";
import { PlacaPatente } from "@/components/shared/placa-patente";
import { Button } from "@/components/ui/button";
import {
  conductor as buscarConductor,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
  documentosDe,
  mensajesDeViaje,
  oferta as buscarOferta,
  pagoDeViaje,
  pasajerosDeViaje,
  resumirDocumentos,
  viaje as buscarViaje,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_VIAJE } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VIAJE,
  ETIQUETA_TIPO_VEHICULO,
  formatearFecha,
  formatearTelefono,
} from "@/lib/utils/format";

export default function DetalleViajeAgenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Detalle del viaje" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const viaje = buscarViaje(datos, id);
  const oferta = viaje ? buscarOferta(datos, viaje.ofertaId) : undefined;

  if (!viaje || !oferta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Detalle del viaje" />
        <ListaError
          titulo="Este viaje no existe"
          detalle="Puede que el enlace esté malo o que la demo se haya reiniciado."
        />
        <Button variant="outline" className="w-fit" asChild>
          <Link href="/agencia/viajes">
            <ArrowLeft className="size-4" aria-hidden />
            Volver a Viajes
          </Link>
        </Button>
      </div>
    );
  }

  const carrier = buscarTransportista(datos, viaje.carrierId);
  const vehiculo = buscarVehiculo(datos, viaje.vehiculoId);
  const conductor = buscarConductor(datos, viaje.conductorId);
  const pago = pagoDeViaje(datos, viaje.id);
  const pasajeros = pasajerosDeViaje(datos, viaje.id);
  const mensajes = mensajesDeViaje(datos, viaje.id);

  const docsVehiculo = vehiculo
    ? resumirDocumentos(documentosDe(datos, vehiculo.id), ahora)
    : undefined;

  const editable = !["liberada", "cancelada_agencia", "cancelada_transportista"].includes(
    viaje.estado,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/agencia/viajes">
            <ArrowLeft className="size-4" aria-hidden />
            Viajes
          </Link>
        </Button>
        <EncabezadoPagina
          seccion={`${oferta.codigo} · ${formatearFecha(oferta.fechaHoraSalida)}`}
          titulo={oferta.titulo}
          acciones={
            <div className="flex flex-wrap items-center gap-2">
              <BadgeEstado tono={TONO_VIAJE[viaje.estado]}>
                {ETIQUETA_ESTADO_VIAJE[viaje.estado]}
              </BadgeEstado>
              <span className="rounded border border-line bg-muted px-2 py-1 font-mono text-sm tracking-wider text-ink">
                {viaje.codigoAbordaje}
              </span>
            </div>
          }
        />
      </div>

      <LineaEstados viaje={viaje} />
      <AccionesViaje viaje={viaje} oferta={oferta} rol="agencia" ahora={ahora} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          {/* Transportista asignado */}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-display-sm text-ink">
              Transportista asignado
            </h2>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{carrier?.nombre}</p>
                <p className="mt-0.5 flex items-center gap-3 text-sm text-meta">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 text-signal" aria-hidden />
                    <span className="font-mono tabular-nums">
                      {carrier?.ratingPromedio.toFixed(1)}
                    </span>
                  </span>
                  <span>
                    <span className="font-mono tabular-nums">
                      {carrier?.viajesCompletados}
                    </span>{" "}
                    viajes
                  </span>
                </p>

                {conductor && (
                  <p className="mt-3 text-sm text-ink">
                    Conductor: {conductor.nombre} ·{" "}
                    <span className="text-meta">
                      licencia {conductor.licenciaClase}
                      {conductor.idiomas.length > 0 &&
                        ` · ${conductor.idiomas.join(", ")}`}
                    </span>
                  </p>
                )}
              </div>

              {vehiculo && (
                <div className="text-right">
                  <PlacaPatente patente={vehiculo.patente} />
                  <p className="mt-1 text-sm text-ink">
                    {vehiculo.marca} {vehiculo.modelo}
                  </p>
                  <p className="text-xs text-meta">
                    {ETIQUETA_TIPO_VEHICULO[vehiculo.tipo]} ·{" "}
                    <span className="font-mono tabular-nums">
                      {vehiculo.capacidadPasajeros}
                    </span>{" "}
                    pasajeros
                  </p>
                  {docsVehiculo && (
                    <p className="mt-1 text-xs">
                      {docsVehiculo.vencidos > 0 ? (
                        <span className="text-stop">
                          {docsVehiculo.vencidos} documento
                          {docsVehiculo.vencidos > 1 ? "s" : ""} sin vigencia
                        </span>
                      ) : (
                        <span className="text-go-ink">Papeles al día</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Contacto: oculto hasta que entra el pago al escrow */}
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-eyebrow font-display text-meta">Contacto</p>
              {viaje.contactosRevelados ? (
                <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Nombre</dt>
                    <dd className="text-ink">{carrier?.contacto.nombre}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-meta" aria-hidden />
                    <dt className="sr-only">Teléfono</dt>
                    <dd className="font-mono tabular-nums text-ink">
                      {formatearTelefono(carrier?.contacto.telefono ?? "")}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-meta" aria-hidden />
                    <dt className="sr-only">Correo</dt>
                    <dd className="break-all text-ink">{carrier?.contacto.email}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-sm text-meta">
                  <Lock className="size-4" aria-hidden />
                  Se revela cuando pagues el escrow.
                </p>
              )}
            </div>
          </section>

          <ListaEmbarque
            viajeId={viaje.id}
            pasajeros={pasajeros}
            cupos={oferta.cantidadPasajeros}
            editable={editable}
          />

          <PanelCalificaciones
            viaje={viaje}
            rol="agencia"
            autorId={agenciaId}
            ahora={ahora}
          />

          <ChatViaje
            viajeId={viaje.id}
            mensajes={mensajes}
            rol="agencia"
            autorId={agenciaId}
            nombreContraparte={carrier?.nombre ?? "el transportista"}
            habilitado={viaje.contactosRevelados}
          />
        </div>

        <div className="flex flex-col gap-4">
          <PanelEscrow
            viaje={viaje}
            pago={pago}
            rol="agencia"
            comisionPct={datos.comisiones.viajePct}
          />

          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-display-sm text-ink">Código de abordaje</h2>
            <p className="mt-2 font-mono text-display tracking-[0.15em] tabular-nums text-ink">
              {viaje.codigoAbordaje}
            </p>
            <p className="mt-2 text-sm text-meta">
              Dáselo a tu grupo. El conductor lo lleva en la hoja de ruta y sirve
              para confirmar que la van es la correcta.
            </p>
          </section>

          <Button variant="outline" asChild>
            <Link href={`/agencia/ofertas/${oferta.id}`}>Ver la oferta original</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
