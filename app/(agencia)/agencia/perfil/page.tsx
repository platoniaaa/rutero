"use client";

import { BadgeCheck, Building2, Mail, MapPin, Phone, Star } from "lucide-react";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaError } from "@/components/shared/estado-lista";
import { Separator } from "@/components/ui/separator";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { agencia as buscarAgencia } from "@/lib/mock/selectores";
import { TONO_VERIFICACION } from "@/lib/ui/estados";
import {
  ETIQUETA_ESTADO_VERIFICACION,
  formatearRut,
  formatearTelefono,
} from "@/lib/utils/format";

export default function PerfilAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Perfil de la agencia" />
        <ListaCargando filas={2} />
      </div>
    );
  }

  const cuenta = buscarAgencia(datos, agenciaId);

  if (!cuenta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Perfil de la agencia" />
        <ListaError
          titulo="No encontramos esta cuenta"
          detalle="No pudimos cargar los datos de tu cuenta. Recarga la página para volver a intentarlo."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Perfil de la agencia"
        descripcion="Esto es lo que ve el transportista cuando le llega una oferta tuya."
        acciones={
          <BadgeEstado tono={TONO_VERIFICACION[cuenta.estadoVerificacion]}>
            <BadgeCheck className="size-3.5" aria-hidden />
            {ETIQUETA_ESTADO_VERIFICACION[cuenta.estadoVerificacion]}
          </BadgeEstado>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica
          etiqueta="Calificación"
          valor={cuenta.ratingPromedio.toFixed(1)}
          detalle="Promedio de los transportistas"
          tono="go"
        />
        <Metrica
          etiqueta="Viajes completados"
          valor={cuenta.viajesCompletados}
          detalle="Desde que la cuenta existe"
        />
        <Metrica
          etiqueta="Comisión que pagas"
          valor="0%"
          detalle="La agencia no paga fee de plataforma"
          tono="signal"
        />
      </div>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-display-sm text-ink">Datos de la empresa</h2>
        <Separator className="my-4" />

        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-eyebrow font-display text-meta">Razón social</dt>
            <dd className="mt-1 flex items-center gap-2 text-ink">
              <Building2 className="size-4 shrink-0 text-meta" aria-hidden />
              {cuenta.razonSocial}
            </dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">RUT</dt>
            <dd className="mt-1 font-mono tabular-nums text-ink">
              {formatearRut(cuenta.rut)}
            </dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">Giro</dt>
            <dd className="mt-1 text-ink">{cuenta.giro}</dd>
          </div>
          <div>
            <dt className="text-eyebrow font-display text-meta">Dirección</dt>
            <dd className="mt-1 flex items-start gap-2 text-ink">
              <MapPin className="mt-0.5 size-4 shrink-0 text-meta" aria-hidden />
              {cuenta.direccion}
            </dd>
          </div>
        </dl>

        <Separator className="my-6" />

        <h2 className="font-display text-display-sm text-ink">Contacto</h2>
        <p className="mt-1 text-sm text-meta">
          El teléfono y el correo quedan ocultos para el transportista hasta que
          adjudicas y pagas el escrow.
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
              {cuenta.contacto.email}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <div className="flex items-start gap-3">
          <Star className="mt-0.5 size-5 shrink-0 text-signal" aria-hidden />
          <div>
            <h2 className="font-display text-display-sm text-ink">
              Cómo te ven los transportistas
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-meta">
              Los transportistas te califican en claridad del brief, puntualidad de
              los pasajeros y pago. Un promedio alto hace que más vans respondan tus
              ofertas y con mejores precios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
