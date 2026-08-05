"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando } from "@/components/shared/estado-lista";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRutero } from "@/lib/mock/store";
import { useDatos } from "@/lib/mock/use-datos";
import { formatearCLP } from "@/lib/utils/format";
import { desglosarReferido, desglosarViaje } from "@/lib/utils/rules";

export default function ComisionesPage() {
  const { datos, cargando } = useDatos();
  const actualizarComisiones = useRutero((s) => s.actualizarComisiones);
  const reiniciarDemo = useRutero((s) => s.reiniciarDemo);

  const [viajePct, setViajePct] = useState<string | null>(null);
  const [referidoPct, setReferidoPct] = useState<string | null>(null);

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Admin" titulo="Configuración de comisiones" />
        <ListaCargando filas={2} />
      </div>
    );
  }

  const viaje = viajePct ?? String(datos.comisiones.viajePct);
  const referido = referidoPct ?? String(datos.comisiones.referidoPct);
  const nViaje = Number(viaje);
  const nReferido = Number(referido);
  const valido =
    nViaje > 0 && nViaje <= 30 && nReferido > 0 && nReferido <= 50;
  const hayCambios =
    nViaje !== datos.comisiones.viajePct ||
    nReferido !== datos.comisiones.referidoPct;

  // Ejemplo anclado al dato del rubro: Farellones, 15 pax.
  const EJEMPLO_VIAJE = 280000;
  const EJEMPLO_TICKET = 512000;
  const dViaje = desglosarViaje(EJEMPLO_VIAJE, nViaje || 0);
  const dReferido = desglosarReferido(EJEMPLO_TICKET, 10, nReferido || 0);

  // Lo que ya generó la plataforma con las comisiones actuales.
  const generado = datos.pagos
    .filter((p) => p.estado === "liberado")
    .reduce((s, p) => s + p.comisionPlataforma, 0);
  const generadoReferidos = datos.referidos
    .filter((r) => r.estado === "liberada")
    .reduce((s, r) => s + r.comisionPlataforma, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Admin"
        titulo="Configuración de comisiones"
        descripcion="Los porcentajes que Rutero cobra en cada flujo. Se aplican a las adjudicaciones nuevas, no a las ya cerradas."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <Metrica
          etiqueta="Comisión de viaje"
          valor={`${datos.comisiones.viajePct}%`}
          detalle="Al transportista, al liberar"
          tono="signal"
        />
        <Metrica
          etiqueta="Comisión de referido"
          valor={`${datos.comisiones.referidoPct}%`}
          detalle="Sobre la comisión del transportista"
          tono="signal"
        />
        <Metrica
          etiqueta="Generado hasta hoy"
          valor={formatearCLP(generado + generadoReferidos)}
          detalle="Comisiones ya liberadas"
          tono="go"
        />
      </div>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-display-sm text-ink">Ajustar</h2>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="com-viaje">Comisión de viaje (%)</Label>
              <Input
                id="com-viaje"
                type="number"
                min={1}
                max={30}
                value={viaje}
                onChange={(e) => setViajePct(e.target.value)}
                className="max-w-32 font-mono text-lg tabular-nums"
                aria-invalid={!(nViaje > 0 && nViaje <= 30)}
              />
              <p className="text-xs text-meta">
                La agencia paga el total y este porcentaje se le descuenta al
                transportista al liberar el pago.
              </p>
            </div>

            <dl className="rounded-lg border border-line bg-muted p-3 text-sm">
              <p className="mb-2 text-eyebrow font-display text-meta">
                Ejemplo: Farellones día completo, 15 pax
              </p>
              <div className="flex justify-between gap-4">
                <dt className="text-meta">La agencia paga</dt>
                <dd className="font-mono tabular-nums">
                  {formatearCLP(dViaje.bruto)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-meta">Comisión Rutero</dt>
                <dd className="font-mono tabular-nums text-go-ink">
                  {formatearCLP(dViaje.comision)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-1">
                <dt className="font-medium text-ink">Recibe el transportista</dt>
                <dd className="font-mono font-medium tabular-nums">
                  {formatearCLP(dViaje.neto)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="com-referido">Comisión de referido (%)</Label>
              <Input
                id="com-referido"
                type="number"
                min={1}
                max={50}
                value={referido}
                onChange={(e) => setReferidoPct(e.target.value)}
                className="max-w-32 font-mono text-lg tabular-nums"
                aria-invalid={!(nReferido > 0 && nReferido <= 50)}
              />
              <p className="text-xs text-meta">
                Se cobra sobre la comisión que la agencia le paga al transportista,
                no sobre el ticket del tour.
              </p>
            </div>

            <dl className="rounded-lg border border-line bg-muted p-3 text-sm">
              <p className="mb-2 text-eyebrow font-display text-meta">
                Ejemplo: grupo de 16 con ticket de {formatearCLP(EJEMPLO_TICKET)}
              </p>
              <div className="flex justify-between gap-4">
                <dt className="text-meta">Comisión del transportista (10%)</dt>
                <dd className="font-mono tabular-nums">
                  {formatearCLP(dReferido.comisionTransportista)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-meta">Comisión Rutero</dt>
                <dd className="font-mono tabular-nums text-go-ink">
                  {formatearCLP(dReferido.comision)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-1">
                <dt className="font-medium text-ink">Recibe el transportista</dt>
                <dd className="font-mono font-medium tabular-nums">
                  {formatearCLP(dReferido.neto)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          <Button
            disabled={!valido || !hayCambios}
            onClick={() => {
              actualizarComisiones({
                viajePct: nViaje,
                referidoPct: nReferido,
              });
              setViajePct(null);
              setReferidoPct(null);
              toast.success("Comisiones actualizadas", {
                description: `Viaje ${nViaje}% · referido ${nReferido}%.`,
              });
            }}
          >
            <Save className="size-4" aria-hidden />
            Guardar cambios
          </Button>
          {hayCambios && (
            <Button
              variant="ghost"
              onClick={() => {
                setViajePct(null);
                setReferidoPct(null);
              }}
            >
              Descartar
            </Button>
          )}
        </div>
      </section>

      {/* Mantenimiento: el reinicio vive solo acá, en una pantalla interna que
          ni la agencia ni el transportista ven. */}
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-display-sm text-ink">Mantenimiento</h2>
        <p className="mt-1 max-w-2xl text-sm text-meta">
          Restablece la plataforma a su estado inicial. Se pierden las ofertas,
          adjudicaciones, pagos, mensajes y calificaciones registrados en este
          equipo.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              <RotateCcw className="size-4" aria-hidden />
              Restablecer datos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-display-sm">
                ¿Restablecer los datos?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se pierde todo lo registrado en este equipo: ofertas publicadas,
                adjudicaciones, pagos, mensajes y calificaciones. Esto no se
                puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  reiniciarDemo();
                  toast.success("Datos restablecidos");
                }}
              >
                Restablecer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
