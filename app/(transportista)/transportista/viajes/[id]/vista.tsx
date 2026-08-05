"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Lock, Mail, Phone, Star } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { ChatViaje } from "@/components/shared/chat-viaje";
import { DetalleOferta } from "@/components/shared/detalle-oferta";
import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import { AccionesViaje, LineaEstados } from "@/components/shared/estado-viaje";
import { ListaCargando, ListaError } from "@/components/shared/estado-lista";
import { PanelCalificaciones } from "@/components/shared/panel-calificaciones";
import { PanelEscrow } from "@/components/shared/panel-escrow";
import { HojaRuta } from "@/components/transportista/hoja-ruta";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  agencia as buscarAgencia,
  conductor as buscarConductor,
  mensajesDeViaje,
  oferta as buscarOferta,
  pagoDeViaje,
  pasajerosDeViaje,
  vehiculo as buscarVehiculo,
  viaje as buscarViaje,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_VIAJE } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VIAJE,
  formatearFecha,
  formatearTelefono,
} from "@/lib/utils/format";

export function VistaViajeTransportista({ id }: { id: string }) {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Detalle del viaje" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const viaje = buscarViaje(datos, id);
  const oferta = viaje ? buscarOferta(datos, viaje.ofertaId) : undefined;

  if (!viaje || !oferta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Detalle del viaje" />
        <ListaError
          titulo="Este viaje no existe"
          detalle="Puede que el enlace esté malo o que el viaje ya no exista."
        />
        <Button variant="outline" className="w-fit" asChild>
          <Link href="/transportista/viajes">
            <ArrowLeft className="size-4" aria-hidden />
            Volver a Mis viajes
          </Link>
        </Button>
      </div>
    );
  }

  const agencia = buscarAgencia(datos, viaje.agenciaId);
  const vehiculo = buscarVehiculo(datos, viaje.vehiculoId);
  const conductor = buscarConductor(datos, viaje.conductorId);
  const pago = pagoDeViaje(datos, viaje.id);
  const pasajeros = pasajerosDeViaje(datos, viaje.id);
  const mensajes = mensajesDeViaje(datos, viaje.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/transportista/viajes">
            <ArrowLeft className="size-4" aria-hidden />
            Mis viajes
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

      <div className="print:hidden">
        <LineaEstados viaje={viaje} />
      </div>
      <div className="print:hidden">
        <AccionesViaje
          viaje={viaje}
          oferta={oferta}
          rol="transportista"
          ahora={ahora}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <Tabs defaultValue="hoja">
            <TabsList className="print:hidden">
              <TabsTrigger value="hoja" className="min-h-11">
                Hoja de ruta
              </TabsTrigger>
              <TabsTrigger value="detalle" className="min-h-11">
                Detalle de la oferta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hoja" className="mt-4">
              <HojaRuta
                viaje={viaje}
                oferta={oferta}
                vehiculo={vehiculo}
                conductor={conductor}
                agencia={agencia}
                pasajeros={pasajeros}
              />
            </TabsContent>

            <TabsContent value="detalle" className="mt-4">
              <DetalleOferta oferta={oferta} ahora={ahora} />
            </TabsContent>
          </Tabs>

          <div className="print:hidden">
            <PanelCalificaciones
              viaje={viaje}
              rol="transportista"
              autorId={carrierId}
              ahora={ahora}
            />
          </div>

          <div className="print:hidden">
            <ChatViaje
              viajeId={viaje.id}
              mensajes={mensajes}
              rol="transportista"
              autorId={carrierId}
              nombreContraparte={agencia?.razonSocial ?? "la agencia"}
              habilitado={viaje.contactosRevelados}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 print:hidden">
          <PanelEscrow
            viaje={viaje}
            pago={pago}
            rol="transportista"
            comisionPct={datos.comisiones.viajePct}
          />

          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
              <Building2 className="size-5 text-meta" aria-hidden />
              La agencia
            </h2>
            <p className="mt-3 font-medium text-ink">{agencia?.razonSocial}</p>
            <p className="mt-0.5 flex items-center gap-3 text-sm text-meta">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 text-signal" aria-hidden />
                <span className="font-mono tabular-nums">
                  {agencia?.ratingPromedio.toFixed(1)}
                </span>
              </span>
              <span>
                <span className="font-mono tabular-nums">
                  {agencia?.viajesCompletados}
                </span>{" "}
                viajes
              </span>
            </p>

            <div className="mt-4 border-t border-line pt-4">
              <p className="text-eyebrow font-display text-meta">Contacto</p>
              {viaje.contactosRevelados ? (
                <dl className="mt-2 flex flex-col gap-2 text-sm">
                  <div>
                    <dt className="sr-only">Nombre</dt>
                    <dd className="text-ink">{agencia?.contacto.nombre}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-meta" aria-hidden />
                    <dt className="sr-only">Teléfono</dt>
                    <dd className="font-mono tabular-nums text-ink">
                      {formatearTelefono(agencia?.contacto.telefono ?? "")}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-meta" aria-hidden />
                    <dt className="sr-only">Correo</dt>
                    <dd className="break-all text-ink">{agencia?.contacto.email}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-sm text-meta">
                  <Lock className="size-4" aria-hidden />
                  Se revela cuando la agencia pague el escrow.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
