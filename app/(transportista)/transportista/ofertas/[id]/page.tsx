"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Star } from "lucide-react";

import { DetalleOferta } from "@/components/shared/detalle-oferta";
import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaError } from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import {
  agencia as buscarAgencia,
  evaluarOfertaParaCarrier,
  oferta as buscarOferta,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";

export default function DetalleOfertaTransportistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Detalle de la oferta" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const oferta = buscarOferta(datos, id);

  if (!oferta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Detalle de la oferta" />
        <ListaError
          titulo="Esta oferta no existe"
          detalle="Puede que haya expirado o que la demo se haya reiniciado."
        />
        <Button variant="outline" className="w-fit" asChild>
          <Link href="/transportista/ofertas">
            <ArrowLeft className="size-4" aria-hidden />
            Volver al feed
          </Link>
        </Button>
      </div>
    );
  }

  const agencia = buscarAgencia(datos, oferta.agenciaId);
  const evaluacion = evaluarOfertaParaCarrier(datos, oferta.id, carrierId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/transportista/ofertas">
            <ArrowLeft className="size-4" aria-hidden />
            Feed de ofertas
          </Link>
        </Button>
        <EncabezadoPagina seccion={oferta.codigo} titulo={oferta.titulo} />
      </div>

      {/* Quién publica. Sin contacto: eso se revela con el escrow. */}
      {agencia && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded bg-muted text-meta">
              <Building2 className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-medium text-ink">{agencia.razonSocial}</p>
              <p className="flex items-center gap-3 text-sm text-meta">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 text-signal" aria-hidden />
                  <span className="font-mono tabular-nums">
                    {agencia.ratingPromedio.toFixed(1)}
                  </span>
                </span>
                <span>
                  <span className="font-mono tabular-nums">
                    {agencia.viajesCompletados}
                  </span>{" "}
                  viajes completados
                </span>
              </p>
            </div>
          </div>
          <p className="text-xs text-meta">
            El contacto se revela cuando te adjudican y pagan el escrow.
          </p>
        </section>
      )}

      {evaluacion.motivoAtenuada && (
        <div
          role="status"
          className="rounded-lg border border-line bg-muted px-4 py-3 text-sm text-ink/80"
        >
          {evaluacion.motivoAtenuada}
        </div>
      )}

      <DetalleOferta oferta={oferta} ahora={ahora} />

      {/* Aceptar / contraofertar llega en el Hito 4. */}
      <section className="rounded-lg border border-dashed border-line bg-muted p-5 text-center">
        <p className="text-sm text-meta">
          Aceptar al precio o contraofertar se habilita en el hito 4.
        </p>
      </section>
    </div>
  );
}
