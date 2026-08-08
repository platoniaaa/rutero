"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bus, Inbox, Star, Truck } from "lucide-react";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaOferta } from "@/components/shared/tarjeta-oferta";
import { TarjetaViaje } from "@/components/shared/tarjeta-viaje";
import { Button } from "@/components/ui/button";
import {
  agencia as buscarAgencia,
  documentosDelTransportista,
  evaluarOfertaParaCarrier,
  flotaDe,
  oferta as buscarOferta,
  ofertasAbiertas,
  resumirDocumentos,
  respuestaDeCarrierEnOferta,
  respuestasDeCarrier,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
  viajesDeCarrier,
  viajesPorCalificar,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearCLP, formatearFecha } from "@/lib/utils/format";
import { parseISO } from "date-fns";

export default function PanelTransportistaPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Panel" />
        <ListaCargando filas={4} />
      </div>
    );
  }

  const cuenta = buscarTransportista(datos, carrierId);
  const viajes = viajesDeCarrier(datos, carrierId);
  const respuestas = respuestasDeCarrier(datos, carrierId);
  const activas = respuestas.filter((r) => r.estado === "activa");
  const porCalificar = viajesPorCalificar(datos, carrierId, "transportista");

  // Agenda de la semana: viajes vigentes ordenados por salida.
  const enSieteDias = new Date(ahora.getTime() + 7 * 86_400_000);
  const agenda = viajes
    .filter((v) => ["confirmada", "pago_retenido", "en_curso"].includes(v.estado))
    .map((v) => ({ viaje: v, oferta: buscarOferta(datos, v.ofertaId) }))
    .filter((x) => x.oferta && parseISO(x.oferta.fechaHoraSalida) <= enSieteDias)
    .sort((a, b) =>
      (a.oferta?.fechaHoraSalida ?? "").localeCompare(
        b.oferta?.fechaHoraSalida ?? "",
      ),
    );

  // Ofertas que calzan: abiertas, sin responder y sin impedimento.
  const calzan = ofertasAbiertas(datos, ahora)
    .filter((o) => !respuestaDeCarrierEnOferta(datos, o.id, carrierId))
    .filter((o) => !evaluarOfertaParaCarrier(datos, o.id, carrierId).motivoAtenuada);

  const enEscrow = viajes
    .filter((v) => ["pago_retenido", "en_curso", "finalizada"].includes(v.estado))
    .reduce((s, v) => s + v.montoTransportista, 0);

  const resumenDocs = resumirDocumentos(
    documentosDelTransportista(datos, carrierId),
    ahora,
  );
  const bloqueado =
    cuenta?.estadoVerificacion !== "verificada" || resumenDocs.vencidos > 0;

  // Cuenta recién creada: sin flota todavía. La bienvenida ordena los
  // primeros pasos y reemplaza al aviso de bloqueo, que sin contexto asusta.
  const sinFlota = flotaDe(datos, carrierId).length === 0;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Panel"
        descripcion="Tu semana, lo que puedes tomar y lo que tienes por cobrar."
      />

      {sinFlota && (
        <section className="rounded-xl border border-signal/40 bg-signal-soft p-5 sm:p-6">
          <p className="text-eyebrow font-display text-signal-ink">
            Te damos la bienvenida
          </p>
          <h2 className="mt-1 font-titular text-xl leading-tight font-bold text-ink">
            Carga tu vehículo para empezar a recibir viajes
          </h2>
          <ol className="mt-3 flex max-w-xl flex-col gap-1.5 text-sm text-meta">
            <li className="flex gap-2">
              <span className="font-mono text-xs leading-5 text-signal-ink">1.</span>
              Agrega tu vehículo, tu licencia y tus documentos.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-xs leading-5 text-signal-ink">2.</span>
              El equipo los revisa y tu cuenta queda verificada.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-xs leading-5 text-signal-ink">3.</span>
              Postulas a los viajes que calcen con tu agenda.
            </li>
          </ol>
          <Button className="mt-4" asChild>
            <Link href="/transportista/flota">
              <Truck className="size-4" aria-hidden />
              Cargar mi vehículo
            </Link>
          </Button>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica etiqueta="Viajes esta semana" valor={agenda.length} />
        <Metrica
          etiqueta="Ofertas que calzan"
          valor={calzan.length}
          tono={calzan.length > 0 ? "signal" : "neutro"}
        />
        <Metrica etiqueta="Postulaciones activas" valor={activas.length} />
        <Metrica
          etiqueta="Por cobrar"
          valor={formatearCLP(enEscrow)}
          detalle="Neto retenido en escrow"
          tono="go"
        />
      </div>

      {bloqueado && !sinFlota && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stop/40 bg-stop-soft p-4"
        >
          <p className="flex items-start gap-2 text-sm text-ink">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-stop" aria-hidden />
            {cuenta?.estadoVerificacion !== "verificada"
              ? "Tu cuenta todavía no está verificada, así que no puedes postular a ofertas."
              : `Tienes ${resumenDocs.vencidos} ${resumenDocs.vencidos === 1 ? "documento crítico sin vigencia" : "documentos críticos sin vigencia"}. Mientras tanto no puedes postular.`}
          </p>
          <Button variant="outline" asChild>
            <Link href="/transportista/flota">Revisar documentos</Link>
          </Button>
        </div>
      )}

      {porCalificar.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-muted p-4">
          <p className="text-sm text-ink">
            Te faltan{" "}
            <span className="font-medium">
              {porCalificar.length}{" "}
              {porCalificar.length === 1 ? "calificación" : "calificaciones"}
            </span>{" "}
            de viajes completados.
          </p>
          <Button variant="outline" asChild>
            <Link href="/transportista/viajes">
              <Star className="size-4" aria-hidden />
              Calificar
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-display-sm text-ink">
              Agenda de la semana
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transportista/viajes">
                Ver todos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {agenda.length === 0 ? (
            <ListaVacia
              icono={Bus}
              titulo="Sin viajes esta semana"
              detalle="Revisa el feed: las agencias publican durante todo el día."
              accion={
                <Button asChild>
                  <Link href="/transportista/ofertas">Ver ofertas</Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {agenda.slice(0, 3).map(({ viaje, oferta }) => (
                <li key={viaje.id}>
                  <TarjetaViaje
                    viaje={viaje}
                    oferta={oferta!}
                    vehiculo={buscarVehiculo(datos, viaje.vehiculoId)}
                    contraparte={
                      buscarAgencia(datos, viaje.agenciaId)?.razonSocial ?? ""
                    }
                    href={`/transportista/viajes/${viaje.id}`}
                    montoDestacado={viaje.montoTransportista}
                    etiquetaMonto="recibes tú"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-display-sm text-ink">
              Ofertas que calzan contigo
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transportista/ofertas">
                Ver el feed
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {calzan.length === 0 ? (
            <ListaVacia
              icono={Inbox}
              titulo="Nada que calce ahora"
              detalle="Las ofertas que chocan con tu agenda o superan la capacidad de tu flota quedan atenuadas en el feed, con el motivo."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {calzan.slice(0, 3).map((oferta) => (
                <li key={oferta.id}>
                  <Link
                    href={`/transportista/ofertas/${oferta.id}`}
                    className="block rounded-lg transition-shadow hover:shadow-md"
                  >
                    <TarjetaOferta
                      oferta={oferta}
                      ahora={ahora}
                      mostrarEstado={false}
                      pie={
                        <p className="text-sm text-meta">
                          Sale {formatearFecha(oferta.fechaHoraSalida)}
                        </p>
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
