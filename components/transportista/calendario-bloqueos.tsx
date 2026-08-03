"use client";

import { useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ListaVacia } from "@/components/shared/estado-lista";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRutero } from "@/lib/mock/store";
import type { BloqueoAgenda, Id, NuevoBloqueo, Vehiculo } from "@/lib/mock/types";
import { formatearFecha, formatearFechaLarga, formatearPatente } from "@/lib/utils/format";

const DIAS = [
  { valor: 1, corto: "Lu", largo: "lunes" },
  { valor: 2, corto: "Ma", largo: "martes" },
  { valor: 3, corto: "Mi", largo: "miércoles" },
  { valor: 4, corto: "Ju", largo: "jueves" },
  { valor: 5, corto: "Vi", largo: "viernes" },
  { valor: 6, corto: "Sá", largo: "sábado" },
  { valor: 0, corto: "Do", largo: "domingo" },
];

function describirDias(diasSemana: number[]): string {
  if (diasSemana.length === 7) return "todos los días";
  const laborales = [1, 2, 3, 4, 5];
  if (
    diasSemana.length === 5 &&
    laborales.every((d) => diasSemana.includes(d))
  ) {
    return "de lunes a viernes";
  }
  const nombres = DIAS.filter((d) => diasSemana.includes(d.valor)).map((d) => d.largo);
  if (nombres.length === 0) return "sin días";
  if (nombres.length === 1) return `los ${nombres[0]}`;
  return `los ${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

function DialogoBloqueo({
  abierto,
  onAbrirCambio,
  carrierId,
  flota,
}: {
  abierto: boolean;
  onAbrirCambio: (abierto: boolean) => void;
  carrierId: Id;
  flota: Vehiculo[];
}) {
  const agregarBloqueo = useRutero((s) => s.agregarBloqueo);
  const [tipo, setTipo] = useState<"recurrente" | "puntual">("recurrente");
  const [motivo, setMotivo] = useState("");
  const [vehiculoId, setVehiculoId] = useState("todos");
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5]);
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("09:00");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [tocado, setTocado] = useState(false);

  function limpiar() {
    setTipo("recurrente");
    setMotivo("");
    setVehiculoId("todos");
    setDiasSemana([1, 2, 3, 4, 5]);
    setHoraInicio("07:00");
    setHoraFin("09:00");
    setDesde("");
    setHasta("");
    setInicio("");
    setFin("");
    setTocado(false);
  }

  const errorMotivo = !motivo.trim() ? "Escribe para qué es el bloqueo." : null;
  const errorDias =
    tipo === "recurrente" && diasSemana.length === 0 ? "Elige al menos un día." : null;
  const errorHoras =
    tipo === "recurrente" && horaFin <= horaInicio
      ? "La hora de término tiene que ser posterior a la de inicio."
      : null;
  const errorPuntual =
    tipo === "puntual" && (!inicio || !fin || fin < inicio)
      ? "Revisa las fechas: la de término no puede ser anterior a la de inicio."
      : null;

  const valido = !errorMotivo && !errorDias && !errorHoras && !errorPuntual;

  function guardar() {
    setTocado(true);
    if (!valido) return;

    const base = {
      carrierId,
      motivo: motivo.trim(),
      vehiculoId: vehiculoId === "todos" ? undefined : vehiculoId,
    };

    const bloqueo: NuevoBloqueo =
      tipo === "recurrente"
        ? {
            ...base,
            tipo: "recurrente",
            diasSemana,
            horaInicio,
            horaFin,
            desde: desde
              ? new Date(`${desde}T00:00:00`).toISOString()
              : new Date().toISOString(),
            hasta: hasta ? new Date(`${hasta}T23:59:00`).toISOString() : undefined,
          }
        : {
            ...base,
            tipo: "puntual",
            inicio: new Date(`${inicio}T00:00:00`).toISOString(),
            fin: new Date(`${fin}T23:59:00`).toISOString(),
          };

    agregarBloqueo(bloqueo);
    toast.success("Bloqueo agregado a tu agenda");
    limpiar();
    onAbrirCambio(false);
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) limpiar();
        onAbrirCambio(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm">
            Bloquear franja de agenda
          </DialogTitle>
          <DialogDescription>
            Las ofertas que caigan dentro de un bloqueo se muestran atenuadas en tu
            feed y no puedes postular a ellas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bl-motivo">¿Para qué es el bloqueo?</Label>
            <Input
              id="bl-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Recorrido escolar Colegio San Marcos"
              aria-invalid={tocado && !!errorMotivo}
            />
            {tocado && errorMotivo && <p className="text-xs text-stop">{errorMotivo}</p>}
          </div>

          {flota.length > 1 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="bl-vehiculo">¿Qué vehículo queda ocupado?</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger id="bl-vehiculo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Toda la flota</SelectItem>
                  {flota.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {formatearPatente(v.patente)} · {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Tipo de bloqueo
            </legend>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as "recurrente" | "puntual")}
              className="gap-2"
            >
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line px-3 text-sm">
                <RadioGroupItem value="recurrente" id="bl-recurrente" />
                <span>
                  Se repite cada semana
                  <span className="block text-xs text-meta">
                    Recorrido escolar, contrato de empresa, circuito propio
                  </span>
                </span>
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line px-3 text-sm">
                <RadioGroupItem value="puntual" id="bl-puntual" />
                <span>
                  Días puntuales
                  <span className="block text-xs text-meta">
                    Mantención, vacaciones, un viaje fuera de la plataforma
                  </span>
                </span>
              </label>
            </RadioGroup>
          </fieldset>

          {tipo === "recurrente" ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Días</p>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => {
                    const activo = diasSemana.includes(dia.valor);
                    return (
                      <button
                        key={dia.valor}
                        type="button"
                        aria-pressed={activo}
                        onClick={() =>
                          setDiasSemana((actual) =>
                            activo
                              ? actual.filter((d) => d !== dia.valor)
                              : [...actual, dia.valor],
                          )
                        }
                        className={`size-11 rounded-lg border text-sm font-medium transition-colors ${
                          activo
                            ? "border-signal bg-signal-soft text-ink"
                            : "border-line text-meta hover:border-meta"
                        }`}
                      >
                        <span className="sr-only">{dia.largo}</span>
                        <span aria-hidden>{dia.corto}</span>
                      </button>
                    );
                  })}
                </div>
                {tocado && errorDias && (
                  <p className="mt-1 text-xs text-stop">{errorDias}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bl-hora-inicio">Desde</Label>
                  <Input
                    id="bl-hora-inicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bl-hora-fin">Hasta</Label>
                  <Input
                    id="bl-hora-fin"
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    aria-invalid={tocado && !!errorHoras}
                  />
                </div>
              </div>
              {tocado && errorHoras && <p className="text-xs text-stop">{errorHoras}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bl-desde">Vigente desde</Label>
                  <Input
                    id="bl-desde"
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bl-hasta">Vigente hasta</Label>
                  <Input
                    id="bl-hasta"
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                  />
                  <p className="text-xs text-meta">Déjalo vacío si no tiene término.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bl-inicio">Primer día</Label>
                <Input
                  id="bl-inicio"
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  aria-invalid={tocado && !!errorPuntual}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bl-fin">Último día</Label>
                <Input
                  id="bl-fin"
                  type="date"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                  aria-invalid={tocado && !!errorPuntual}
                />
              </div>
              {tocado && errorPuntual && (
                <p className="text-xs text-stop sm:col-span-2">{errorPuntual}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onAbrirCambio(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Bloquear franja</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarioBloqueos({
  carrierId,
  bloqueos,
  flota,
}: {
  carrierId: Id;
  bloqueos: BloqueoAgenda[];
  flota: Vehiculo[];
}) {
  const [abierto, setAbierto] = useState(false);
  const eliminarBloqueo = useRutero((s) => s.eliminarBloqueo);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-display-sm text-ink">Agenda bloqueada</h2>
          <p className="mt-1 max-w-2xl text-sm text-meta">
            Tus recorridos propios — escolar, contratos de empresa, circuitos — dejan
            la van ocupada. Bloquéalos acá para que no te lleguen ofertas que no
            puedes tomar.
          </p>
        </div>
        <Button onClick={() => setAbierto(true)}>
          <Plus className="size-4" aria-hidden />
          Bloquear franja
        </Button>
      </div>

      {bloqueos.length === 0 ? (
        <ListaVacia
          icono={CalendarClock}
          titulo="No tienes franjas bloqueadas"
          detalle="Si haces recorrido escolar o tienes un contrato fijo, bloquea esas horas y el feed dejará de ofrecerte viajes que se cruzan."
          accion={
            <Button variant="outline" onClick={() => setAbierto(true)}>
              Bloquear la primera franja
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {bloqueos.map((bloqueo) => {
            const vehiculo = flota.find((v) => v.id === bloqueo.vehiculoId);
            return (
              <li
                key={bloqueo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{bloqueo.motivo}</p>
                  <p className="mt-0.5 text-sm text-meta">
                    {bloqueo.tipo === "recurrente" ? (
                      <>
                        {describirDias(bloqueo.diasSemana)} de{" "}
                        <span className="font-mono tabular-nums">
                          {bloqueo.horaInicio}
                        </span>{" "}
                        a{" "}
                        <span className="font-mono tabular-nums">{bloqueo.horaFin}</span>
                        {bloqueo.hasta && (
                          <> · hasta el {formatearFechaLarga(bloqueo.hasta)}</>
                        )}
                      </>
                    ) : (
                      <>
                        {formatearFecha(bloqueo.inicio)} — {formatearFecha(bloqueo.fin)}
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-meta">
                    {vehiculo
                      ? `Afecta a ${formatearPatente(vehiculo.patente)}`
                      : "Afecta a toda la flota"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    eliminarBloqueo(bloqueo.id);
                    toast.success("Bloqueo eliminado");
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Eliminar
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <DialogoBloqueo
        abierto={abierto}
        onAbrirCambio={setAbierto}
        carrierId={carrierId}
        flota={flota}
      />
    </section>
  );
}
