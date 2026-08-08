"use client";

import Link from "next/link";
import { BadgeCheck, Mail, MapPin, Phone, ShieldCheck, Star } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { TarjetaCalificacion } from "@/components/shared/calificar";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import {
  ListaCargando,
  ListaError,
  ListaVacia,
} from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  agencia as buscarAgencia,
  calificacionesDeViaje,
  calificacionesRecibidas,
  documentosDelTransportista,
  flotaDe,
  oferta as buscarOferta,
  resumirDocumentos,
  transportista as buscarTransportista,
  viaje as buscarViaje,
  viajesPorCalificar,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { TONO_VERIFICACION } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VERIFICACION,
  formatearRut,
  formatearTelefono,
} from "@/lib/utils/format";
import { COMISION_VIAJE_PCT, calificacionesVisibles } from "@/lib/utils/rules";

export default function PerfilTransportistaPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Perfil" />
        <ListaCargando filas={2} />
      </div>
    );
  }

  const cuenta = buscarTransportista(datos, carrierId);
  if (!cuenta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Perfil" />
        <ListaError titulo="No encontramos tu cuenta" />
      </div>
    );
  }

  const flota = flotaDe(datos, carrierId);
  const resumen = resumirDocumentos(
    documentosDelTransportista(datos, carrierId),
    ahora,
  );
  const recibidas = calificacionesRecibidas(datos, carrierId);
  const pendientes = viajesPorCalificar(datos, carrierId, "transportista");
  const verificada = cuenta.estadoVerificacion === "verificada";
  const puedePostular = verificada && resumen.vencidos === 0;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Perfil"
        descripcion="Esto es lo que ve la agencia cuando respondes una de sus ofertas."
        acciones={
          <BadgeEstado tono={TONO_VERIFICACION[cuenta.estadoVerificacion]}>
            <BadgeCheck className="size-3.5" aria-hidden />
            {ETIQUETA_ESTADO_VERIFICACION[cuenta.estadoVerificacion]}
          </BadgeEstado>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Metrica
          etiqueta="Calificación"
          valor={cuenta.ratingPromedio > 0 ? cuenta.ratingPromedio.toFixed(1) : "—"}
          detalle={
            cuenta.ratingPromedio > 0
              ? "Promedio de las agencias"
              : "Todavía sin calificaciones"
          }
          tono={cuenta.ratingPromedio >= 4.5 ? "go" : "neutro"}
        />
        <Metrica
          etiqueta="Viajes completados"
          valor={cuenta.viajesCompletados}
        />
        <Metrica
          etiqueta={flota.length === 1 ? "Vehículo" : "Vehículos"}
          valor={flota.length}
        />
        <Metrica
          etiqueta="Comisión Rutero"
          valor={`${COMISION_VIAJE_PCT}%`}
          detalle="Se descuenta al liberar el pago"
          tono="signal"
        />
      </div>

      <section
        className={`flex items-start gap-3 rounded-lg border p-4 ${
          puedePostular
            ? "border-go/40 bg-go-soft"
            : "border-stop/40 bg-stop-soft"
        }`}
      >
        <ShieldCheck
          className={`mt-0.5 size-5 shrink-0 ${puedePostular ? "text-go" : "text-stop"}`}
          aria-hidden
        />
        <div>
          <p className="font-medium text-ink">
            {puedePostular
              ? "Puedes postular a ofertas"
              : "Todavía no puedes postular"}
          </p>
          <p className="mt-0.5 max-w-2xl text-sm text-ink/80">
            {!verificada
              ? "Tu cuenta está pendiente de verificación. Sube los documentos que falten y el equipo de Rutero los revisa."
              : resumen.vencidos > 0
                ? `Tienes ${resumen.vencidos} ${resumen.vencidos === 1 ? "documento crítico sin vigencia" : "documentos críticos sin vigencia"}. Actualízalos para volver a postular.`
                : "Tu cuenta está verificada y los documentos críticos están vigentes."}
          </p>
          {!puedePostular && (
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/transportista/flota">Ir a mis documentos</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-display-sm text-ink">Datos de la cuenta</h2>
        <p className="mt-1 text-sm text-meta">
          {cuenta.esEmpresa
            ? "Cuenta de empresa con flota."
            : "Cuenta de transportista independiente. Es la misma cuenta que usa una empresa: la diferencia son los vehículos que tienes."}
        </p>
        <Separator className="my-4" />

        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-eyebrow font-display text-meta">
              {cuenta.esEmpresa ? "Razón social" : "Nombre"}
            </dt>
            <dd className="mt-1 text-ink">{cuenta.nombre}</dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">RUT</dt>
            <dd className="mt-1 font-mono tabular-nums text-ink">
              {cuenta.rut ? (
                formatearRut(cuenta.rut)
              ) : (
                <span className="font-sans text-meta">Por completar</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-eyebrow font-display text-meta">
              Zonas donde operas
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {cuenta.zonasOperacion.length === 0 && (
                <span className="text-sm text-meta">Por completar</span>
              )}
              {cuenta.zonasOperacion.map((zona) => (
                <span
                  key={zona}
                  className="flex items-center gap-1.5 rounded border border-line bg-muted px-2 py-1 text-sm text-ink"
                >
                  <MapPin className="size-3.5 text-meta" aria-hidden />
                  {zona}
                </span>
              ))}
            </dd>
            <p className="mt-2 text-xs text-meta">
              Recibes notificación de las ofertas que caen en estas zonas.
            </p>
          </div>
        </dl>

        <Separator className="my-6" />

        <h2 className="font-display text-display-sm text-ink">Contacto</h2>
        <p className="mt-1 text-sm text-meta">
          La agencia ve estos datos recién cuando adjudica y paga el escrow.
        </p>

        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-3">
          <div>
            <dt className="text-eyebrow font-display text-meta">Nombre</dt>
            <dd className="mt-1 text-ink">{cuenta.contacto.nombre}</dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">Teléfono</dt>
            <dd className="mt-1 flex items-center gap-2 font-mono tabular-nums text-ink">
              <Phone className="size-4 shrink-0 text-meta" aria-hidden />
              {formatearTelefono(cuenta.contacto.telefono)}
            </dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">Correo</dt>
            <dd className="mt-1 flex items-center gap-2 break-all text-ink">
              <Mail className="size-4 shrink-0 text-meta" aria-hidden />
              {cuenta.contacto.email || (
                <span className="text-meta">Por completar</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
            <Star className="size-5 text-signal" aria-hidden />
            Calificaciones recibidas
          </h2>
          {pendientes.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/transportista/viajes">
                Te faltan {pendientes.length} por calificar
              </Link>
            </Button>
          )}
        </div>

        {recibidas.length === 0 ? (
          <ListaVacia
            icono={Star}
            titulo="Todavía no te califican"
            detalle="Después de cada viaje completado, la agencia te califica en puntualidad, estado del vehículo, trato y comunicación."
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
                    autor={buscarAgencia(datos, c.autorId)?.razonSocial ?? "Agencia"}
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
