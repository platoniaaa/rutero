"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

import { BandejaRespuestas } from "@/components/agencia/bandeja-respuestas";
import { BadgeEstado } from "@/components/shared/badge-estado";
import { DetalleOferta } from "@/components/shared/detalle-oferta";
import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaError } from "@/components/shared/estado-lista";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRutero } from "@/lib/mock/store";
import {
  oferta as buscarOferta,
  respuestasDeOferta,
  viajePorOferta,
} from "@/lib/mock/selectores";
import { useAhora, useDatos } from "@/lib/mock/use-datos";
import { TONO_OFERTA } from "@/lib/ui/estados";
import { ETIQUETA_ESTADO_OFERTA } from "@/lib/utils/format";

export default function DetalleOfertaAgenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { datos, cargando } = useDatos();
  const ahora = useAhora();
  const publicarOferta = useRutero((s) => s.publicarOferta);
  const cancelarOferta = useRutero((s) => s.cancelarOferta);

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Detalle de la oferta" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const oferta = buscarOferta(datos, id);

  if (!oferta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Detalle de la oferta" />
        <ListaError
          titulo="Esta oferta no existe"
          detalle="Puede que el enlace esté malo o que la oferta ya no exista."
        />
        <Button variant="outline" className="w-fit" asChild>
          <Link href="/agencia/ofertas">
            <ArrowLeft className="size-4" aria-hidden />
            Volver a Mis ofertas
          </Link>
        </Button>
      </div>
    );
  }

  const respuestas = respuestasDeOferta(datos, oferta.id);
  const viaje = viajePorOferta(datos, oferta.id);
  const abierta =
    oferta.estado === "publicada" || oferta.estado === "con_respuestas";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/agencia/ofertas">
            <ArrowLeft className="size-4" aria-hidden />
            Mis ofertas
          </Link>
        </Button>
        <EncabezadoPagina
          seccion={oferta.codigo}
          titulo={oferta.titulo}
          acciones={
            <div className="flex flex-wrap items-center gap-2">
              <BadgeEstado tono={TONO_OFERTA[oferta.estado]}>
                {ETIQUETA_ESTADO_OFERTA[oferta.estado]}
              </BadgeEstado>

              {oferta.estado === "borrador" && (
                <Button
                  onClick={() => {
                    publicarOferta(oferta.id);
                    toast.success("Oferta publicada");
                  }}
                >
                  <Send className="size-4" aria-hidden />
                  Publicar
                </Button>
              )}

              {abierta && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <XCircle className="size-4" aria-hidden />
                      Cancelar oferta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-display-sm">
                        ¿Cancelar esta oferta?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Las respuestas que hayan llegado se rechazan y los
                        transportistas quedan notificados. Esto no se puede
                        deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Volver</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          cancelarOferta(oferta.id);
                          toast.success("Oferta cancelada");
                        }}
                      >
                        Cancelar la oferta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {viaje && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/agencia/viajes/${viaje.id}`)}
                >
                  Ver el viaje adjudicado
                </Button>
              )}
            </div>
          }
        />
      </div>

      <DetalleOferta oferta={oferta} ahora={ahora} />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-display-sm text-ink">
            Respuestas ({respuestas.length})
          </h2>
          {respuestas.length > 0 && abierta && (
            <p className="mt-1 text-sm text-meta">
              Compara el monto por pasajero, el rating y el vehículo propuesto.
              Adjudicar rechaza el resto automáticamente.
            </p>
          )}
        </div>
        <BandejaRespuestas oferta={oferta} respuestas={respuestas} />
      </section>
    </div>
  );
}
