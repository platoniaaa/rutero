"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bus, ClipboardList, Plus, Star, Wallet } from "lucide-react";

import { WizardOferta } from "@/components/agencia/wizard-oferta";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaOferta } from "@/components/shared/tarjeta-oferta";
import { TarjetaViaje } from "@/components/shared/tarjeta-viaje";
import { Button } from "@/components/ui/button";
import {
  oferta as buscarOferta,
  ofertasDeAgencia,
  pagoDeViaje,
  respuestasActivasDeOferta,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
  viajesDeAgencia,
  viajesPorCalificar,
} from "@/lib/mock/selectores";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearCLP } from "@/lib/utils/format";

export default function PanelAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const ahora = useAhora();
  const [wizard, setWizard] = useState(false);

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Agencia" titulo="Panel" />
        <ListaCargando filas={4} />
      </div>
    );
  }

  const ofertas = ofertasDeAgencia(datos, agenciaId);
  const abiertas = ofertas.filter((o) =>
    ["publicada", "con_respuestas"].includes(o.estado),
  );
  const viajes = viajesDeAgencia(datos, agenciaId);

  const proximos = viajes
    .filter((v) => ["confirmada", "pago_retenido", "en_curso"].includes(v.estado))
    .sort((a, b) => {
      const oa = buscarOferta(datos, a.ofertaId)?.fechaHoraSalida ?? "";
      const ob = buscarOferta(datos, b.ofertaId)?.fechaHoraSalida ?? "";
      return oa.localeCompare(ob);
    });

  const respuestasSinRevisar = abiertas.reduce(
    (s, o) => s + respuestasActivasDeOferta(datos, o.id).length,
    0,
  );
  const porPagar = viajes.filter(
    (v) => pagoDeViaje(datos, v.id)?.estado === "pendiente",
  );
  const porCalificar = viajesPorCalificar(datos, agenciaId, "agencia");

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Panel"
        descripcion="Lo que necesita tu atención hoy."
        acciones={
          <Button onClick={() => setWizard(true)}>
            <Plus className="size-4" aria-hidden />
            Nueva oferta
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="Ofertas abiertas"
          valor={abiertas.length}
          detalle="Recibiendo respuestas"
        />
        <Metrica
          etiqueta="Respuestas sin revisar"
          valor={respuestasSinRevisar}
          tono={respuestasSinRevisar > 0 ? "signal" : "neutro"}
        />
        <Metrica
          etiqueta="Viajes próximos"
          valor={proximos.length}
        />
        <Metrica
          etiqueta="Esperando tu pago"
          valor={porPagar.length}
          detalle={
            porPagar.length > 0
              ? formatearCLP(porPagar.reduce((s, v) => s + v.montoFinal, 0))
              : "Nada pendiente"
          }
          tono={porPagar.length > 0 ? "stop" : "neutro"}
        />
      </div>

      {/* Acciones que no pueden esperar */}
      {(porPagar.length > 0 || porCalificar.length > 0) && (
        <section className="flex flex-col gap-2">
          {porPagar.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-signal/40 bg-signal-soft p-4">
              <p className="text-sm text-ink">
                <span className="font-medium">
                  {porPagar.length === 1
                    ? "Un viaje espera tu pago"
                    : `${porPagar.length} viajes esperan tu pago`}
                </span>
                . Hasta que deposites no se revelan los contactos ni se abre el
                chat.
              </p>
              <Button asChild>
                <Link href="/agencia/pagos">
                  <Wallet className="size-4" aria-hidden />
                  Ir a pagos
                </Link>
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
                <Link href="/agencia/calificaciones">
                  <Star className="size-4" aria-hidden />
                  Calificar
                </Link>
              </Button>
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-display-sm text-ink">
              Viajes próximos
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agencia/viajes">
                Ver todos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {proximos.length === 0 ? (
            <ListaVacia
              icono={Bus}
              titulo="Sin viajes próximos"
              detalle="Cuando adjudiques una oferta, el viaje aparece acá."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {proximos.slice(0, 3).map((viaje) => {
                const oferta = buscarOferta(datos, viaje.ofertaId);
                if (!oferta) return null;
                return (
                  <li key={viaje.id}>
                    <TarjetaViaje
                      viaje={viaje}
                      oferta={oferta}
                      vehiculo={buscarVehiculo(datos, viaje.vehiculoId)}
                      contraparte={
                        buscarTransportista(datos, viaje.carrierId)?.nombre ?? ""
                      }
                      href={`/agencia/viajes/${viaje.id}`}
                      montoDestacado={viaje.montoFinal}
                      etiquetaMonto="total del viaje"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-display-sm text-ink">
              Ofertas abiertas
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agencia/ofertas">
                Ver todas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {abiertas.length === 0 ? (
            <ListaVacia
              icono={ClipboardList}
              titulo="No tienes ofertas abiertas"
              detalle="Publica una y los transportistas de la zona la ven al instante."
              accion={
                <Button onClick={() => setWizard(true)}>Publicar oferta</Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {abiertas.slice(0, 3).map((oferta) => {
                const n = respuestasActivasDeOferta(datos, oferta.id).length;
                return (
                  <li key={oferta.id}>
                    <Link
                      href={`/agencia/ofertas/${oferta.id}`}
                      className="block rounded-lg transition-shadow hover:shadow-md"
                    >
                      <TarjetaOferta
                        oferta={oferta}
                        ahora={ahora}
                        pie={
                          n > 0 ? (
                            <p className="text-sm font-medium text-ink">
                              {n} {n === 1 ? "respuesta" : "respuestas"} por revisar
                            </p>
                          ) : undefined
                        }
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <WizardOferta
        abierto={wizard}
        onAbrirCambio={setWizard}
        agenciaId={agenciaId}
      />
    </div>
  );
}
