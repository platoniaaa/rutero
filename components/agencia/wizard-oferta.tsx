"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Minus, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdjuntarDocumentos } from "@/components/shared/adjuntar-documentos";
import { useRutero } from "@/lib/mock/store";
import type {
  Adjunto,
  BloqueServicio,
  ModoAdjudicacion,
  Parada,
  Requerimiento,
  TipoServicio,
  VentanaCierre,
} from "@/lib/mock/types";
import {
  DETALLE_BLOQUE,
  ETIQUETA_BLOQUE,
  ETIQUETA_REQUERIMIENTO,
  ETIQUETA_TIPO_SERVICIO,
  formatearCLP,
  formatearNumero,
  montoPorPasajero,
  parsearMonto,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const BLOQUES: BloqueServicio[] = ["transfer", "medio_dia", "dia_completo", "multi_dia"];
const TIPOS_SERVICIO: TipoServicio[] = [
  "traslado_aeropuerto",
  "tour",
  "transfer_hotel",
  "evento_corporativo",
  "otro",
];
const REQUERIMIENTOS: Requerimiento[] = [
  "aire_acondicionado",
  "portaequipaje",
  "cadenas",
  "wifi",
  "rampa_accesibilidad",
  "conductor_bilingue",
  "segundo_conductor",
  "silla_infantil",
];

/** Horas estimadas por defecto según el bloque contratado. */
const HORAS_POR_BLOQUE: Record<BloqueServicio, number> = {
  transfer: 2,
  medio_dia: 5,
  dia_completo: 12,
  multi_dia: 24,
};

type Borrador = {
  titulo: string;
  bloqueServicio: BloqueServicio;
  tipoServicio: TipoServicio;
  origen: string;
  destino: string;
  paradas: Parada[];
  zona: string;
  fechaSalida: string;
  horaSalida: string;
  fechaRetorno: string;
  horaRetorno: string;
  esIdaYVuelta: boolean;
  cantidadPasajeros: number;
  requerimientos: Requerimiento[];
  /** El monto se guarda como total; el modo solo cambia cómo se escribe. */
  modoPrecio: "total" | "por_pasajero";
  montoTexto: string;
  tarifaHoraExtraTexto: string;
  modoAdjudicacion: ModoAdjudicacion;
  ventanaCierreHoras: VentanaCierre;
  notas: string;
  adjuntos: Omit<Adjunto, "id">[];
};

const INICIAL: Borrador = {
  titulo: "",
  bloqueServicio: "dia_completo",
  tipoServicio: "tour",
  origen: "",
  destino: "",
  paradas: [],
  zona: "Santiago",
  fechaSalida: "",
  horaSalida: "08:00",
  fechaRetorno: "",
  horaRetorno: "18:00",
  esIdaYVuelta: true,
  cantidadPasajeros: 15,
  requerimientos: [],
  modoPrecio: "total",
  montoTexto: "",
  tarifaHoraExtraTexto: "",
  modoAdjudicacion: "yo_elijo",
  ventanaCierreHoras: 24,
  notas: "",
  adjuntos: [],
};

const ZONAS = [
  "Santiago",
  "Cordillera",
  "Valparaíso",
  "Coquimbo",
  "Antofagasta",
  "Araucanía",
  "Los Lagos",
  "Magallanes",
  "Ñuble",
  "Otra",
];

function Paso({ numero, activo, titulo }: { numero: number; activo: boolean; titulo: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        activo ? "text-ink" : "text-meta",
      )}
      aria-current={activo ? "step" : undefined}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full font-mono text-sm",
          activo ? "bg-signal text-ink" : "border border-line",
        )}
      >
        {numero}
      </span>
      <span className="hidden text-sm font-medium sm:inline">{titulo}</span>
    </li>
  );
}

export function WizardOferta({
  abierto,
  onAbrirCambio,
  agenciaId,
}: {
  abierto: boolean;
  onAbrirCambio: (abierto: boolean) => void;
  agenciaId: string;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onAbrirCambio}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        {/* Montado con el diálogo para arrancar limpio en cada apertura. */}
        <FormularioOferta
          agenciaId={agenciaId}
          onCerrar={() => onAbrirCambio(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function FormularioOferta({
  agenciaId,
  onCerrar,
}: {
  agenciaId: string;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const crearOferta = useRutero((s) => s.crearOferta);
  const publicarOferta = useRutero((s) => s.publicarOferta);

  const [paso, setPaso] = useState(1);
  const [b, setB] = useState<Borrador>(INICIAL);
  const [tocado, setTocado] = useState(false);

  // ---- Derivados de precio: la doble lectura vive acá ----
  const montoIngresado = parsearMonto(b.montoTexto) ?? 0;
  const total =
    b.modoPrecio === "total"
      ? montoIngresado
      : montoIngresado * b.cantidadPasajeros;
  const porPasajero =
    b.modoPrecio === "total"
      ? montoPorPasajero(total, b.cantidadPasajeros)
      : montoIngresado;

  // ---- Validación por paso ----
  const erroresPaso1 = {
    titulo: !b.titulo.trim() ? "Ponle un título que el transportista entienda al tiro." : null,
    origen: !b.origen.trim() ? "Falta el punto de salida." : null,
    destino: !b.destino.trim() ? "Falta el destino." : null,
    fechaSalida: !b.fechaSalida ? "Falta la fecha de salida." : null,
    retorno:
      b.esIdaYVuelta && b.fechaRetorno && b.fechaRetorno < b.fechaSalida
        ? "El retorno no puede ser antes de la salida."
        : null,
  };
  const erroresPaso2 = {
    pasajeros:
      b.cantidadPasajeros < 1 ? "Tiene que viajar al menos una persona." : null,
  };
  const erroresPaso3 = {
    monto: total <= 0 ? "Falta el presupuesto referencial." : null,
  };

  const paso1Ok = Object.values(erroresPaso1).every((e) => !e);
  const paso2Ok = Object.values(erroresPaso2).every((e) => !e);
  const paso3Ok = Object.values(erroresPaso3).every((e) => !e);

  function armarOferta(creadaEn: Date) {
    const salida = new Date(`${b.fechaSalida}T${b.horaSalida}:00`);
    const retorno =
      b.esIdaYVuelta && b.fechaRetorno
        ? new Date(`${b.fechaRetorno}T${b.horaRetorno}:00`)
        : undefined;

    const horasEstimadas = retorno
      ? Math.max(
          1,
          Math.round((retorno.getTime() - salida.getTime()) / 3_600_000),
        )
      : HORAS_POR_BLOQUE[b.bloqueServicio];

    return {
      agenciaId,
      titulo: b.titulo.trim(),
      bloqueServicio: b.bloqueServicio,
      tipoServicio: b.tipoServicio,
      origen: b.origen.trim(),
      destino: b.destino.trim(),
      paradas: b.paradas.filter((p) => p.nombre.trim()),
      zona: b.zona,
      fechaHoraSalida: salida.toISOString(),
      fechaHoraRetorno: retorno?.toISOString(),
      esIdaYVuelta: b.esIdaYVuelta,
      horasEstimadas,
      cantidadPasajeros: b.cantidadPasajeros,
      requerimientos: b.requerimientos,
      presupuestoReferencial: total,
      tarifaHoraExtra: parsearMonto(b.tarifaHoraExtraTexto) ?? undefined,
      modoAdjudicacion: b.modoAdjudicacion,
      ventanaCierreHoras: b.ventanaCierreHoras,
      // Se recalcula al publicar; acá solo para el borrador.
      expiraEn: new Date(
        creadaEn.getTime() + b.ventanaCierreHoras * 3_600_000,
      ).toISOString(),
      notas: b.notas.trim(),
      adjuntos: b.adjuntos.map((a, i) => ({ ...a, id: `adj-${creadaEn.getTime()}-${i}` })),
      publicadaEn: undefined,
    };
  }

  function guardarBorrador() {
    setTocado(true);
    if (!paso1Ok) {
      setPaso(1);
      return;
    }
    crearOferta(armarOferta(new Date()));
    toast.success("Borrador guardado en Mis ofertas");
    onCerrar();
  }

  function publicar() {
    setTocado(true);
    if (!paso1Ok || !paso2Ok || !paso3Ok) return;
    const id = crearOferta(armarOferta(new Date()));
    publicarOferta(id);
    toast.success("Oferta publicada", {
      description: `Los transportistas de ${b.zona} con capacidad para ${b.cantidadPasajeros} la van a ver en su feed.`,
    });
    onCerrar();
    router.push("/agencia/ofertas");
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-display-sm">
          Nueva oferta de viaje
        </DialogTitle>
        <DialogDescription>
          El transportista ve exactamente lo que escribas acá. Mientras más claro
          el brief, mejores respuestas.
        </DialogDescription>
      </DialogHeader>

      <ol className="flex items-center justify-between gap-2 border-b border-line pb-4">
        <Paso numero={1} activo={paso === 1} titulo="Ruta y fecha" />
        <span className="h-px flex-1 bg-line" aria-hidden />
        <Paso numero={2} activo={paso === 2} titulo="Pasajeros" />
        <span className="h-px flex-1 bg-line" aria-hidden />
        <Paso numero={3} activo={paso === 3} titulo="Precio y cierre" />
      </ol>

      {/* ------------------------------------------------ Paso 1 */}
      {paso === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="of-titulo">Título de la oferta</Label>
            <Input
              id="of-titulo"
              value={b.titulo}
              onChange={(e) => setB({ ...b, titulo: e.target.value })}
              placeholder="Día de nieve en El Colorado"
              aria-invalid={tocado && !!erroresPaso1.titulo}
            />
            {tocado && erroresPaso1.titulo && (
              <p className="text-xs text-stop">{erroresPaso1.titulo}</p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Bloque de servicio
            </legend>
            <p className="mb-2 text-xs text-meta">
              La van y el conductor quedan bloqueados la jornada completa: el precio
              se piensa por bloque, no por kilómetro.
            </p>
            <RadioGroup
              value={b.bloqueServicio}
              onValueChange={(v) => setB({ ...b, bloqueServicio: v as BloqueServicio })}
              className="grid gap-2 sm:grid-cols-2"
            >
              {BLOQUES.map((bloque) => (
                <label
                  key={bloque}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                    b.bloqueServicio === bloque
                      ? "border-signal bg-signal-soft"
                      : "border-line",
                  )}
                >
                  <RadioGroupItem value={bloque} />
                  <span>
                    {ETIQUETA_BLOQUE[bloque]}
                    <span className="block text-xs text-meta">
                      {DETALLE_BLOQUE[bloque]}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="of-tipo">Tipo de servicio</Label>
              <Select
                value={b.tipoServicio}
                onValueChange={(v) => setB({ ...b, tipoServicio: v as TipoServicio })}
              >
                <SelectTrigger id="of-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERVICIO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {ETIQUETA_TIPO_SERVICIO[tipo]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="of-zona">Zona</Label>
              <Select value={b.zona} onValueChange={(v) => setB({ ...b, zona: v })}>
                <SelectTrigger id="of-zona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONAS.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-meta">
                Define a qué transportistas les llega la notificación.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="of-origen">Origen</Label>
              <Input
                id="of-origen"
                value={b.origen}
                onChange={(e) => setB({ ...b, origen: e.target.value })}
                placeholder="Hotel Panamericano, Santiago Centro"
                aria-invalid={tocado && !!erroresPaso1.origen}
              />
              {tocado && erroresPaso1.origen && (
                <p className="text-xs text-stop">{erroresPaso1.origen}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="of-destino">Destino</Label>
              <Input
                id="of-destino"
                value={b.destino}
                onChange={(e) => setB({ ...b, destino: e.target.value })}
                placeholder="Centro de Ski El Colorado"
                aria-invalid={tocado && !!erroresPaso1.destino}
              />
              {tocado && erroresPaso1.destino && (
                <p className="text-xs text-stop">{erroresPaso1.destino}</p>
              )}
            </div>
          </div>

          {/* Paradas */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Paradas intermedias</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setB({ ...b, paradas: [...b.paradas, { nombre: "", hora: "" }] })
                }
              >
                <Plus className="size-4" aria-hidden />
                Agregar parada
              </Button>
            </div>
            {b.paradas.length === 0 && (
              <p className="text-xs text-meta">Sin paradas: viaje directo.</p>
            )}
            {b.paradas.map((parada, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={parada.nombre}
                  onChange={(e) =>
                    setB({
                      ...b,
                      paradas: b.paradas.map((p, j) =>
                        j === i ? { ...p, nombre: e.target.value } : p,
                      ),
                    })
                  }
                  placeholder="Curva 17, Farellones"
                  aria-label={`Parada ${i + 1}`}
                />
                <Input
                  type="time"
                  value={parada.hora ?? ""}
                  onChange={(e) =>
                    setB({
                      ...b,
                      paradas: b.paradas.map((p, j) =>
                        j === i ? { ...p, hora: e.target.value } : p,
                      ),
                    })
                  }
                  className="w-28"
                  aria-label={`Hora de la parada ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setB({ ...b, paradas: b.paradas.filter((_, j) => j !== i) })
                  }
                  aria-label={`Quitar parada ${i + 1}`}
                >
                  <Minus className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="of-fecha-salida">Fecha de salida</Label>
              <div className="flex gap-2">
                <Input
                  id="of-fecha-salida"
                  type="date"
                  value={b.fechaSalida}
                  onChange={(e) => setB({ ...b, fechaSalida: e.target.value })}
                  aria-invalid={tocado && !!erroresPaso1.fechaSalida}
                />
                <Input
                  type="time"
                  value={b.horaSalida}
                  onChange={(e) => setB({ ...b, horaSalida: e.target.value })}
                  className="w-28"
                  aria-label="Hora de salida"
                />
              </div>
              {tocado && erroresPaso1.fechaSalida && (
                <p className="text-xs text-stop">{erroresPaso1.fechaSalida}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex min-h-6 items-center justify-between">
                <Label htmlFor="of-fecha-retorno">Retorno</Label>
                <label className="flex items-center gap-2 text-xs text-meta">
                  Ida y vuelta
                  <Switch
                    checked={b.esIdaYVuelta}
                    onCheckedChange={(v) => setB({ ...b, esIdaYVuelta: v })}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Input
                  id="of-fecha-retorno"
                  type="date"
                  value={b.fechaRetorno}
                  onChange={(e) => setB({ ...b, fechaRetorno: e.target.value })}
                  disabled={!b.esIdaYVuelta}
                  aria-invalid={tocado && !!erroresPaso1.retorno}
                />
                <Input
                  type="time"
                  value={b.horaRetorno}
                  onChange={(e) => setB({ ...b, horaRetorno: e.target.value })}
                  className="w-28"
                  disabled={!b.esIdaYVuelta}
                  aria-label="Hora de retorno"
                />
              </div>
              {tocado && erroresPaso1.retorno && (
                <p className="text-xs text-stop">{erroresPaso1.retorno}</p>
              )}
            </div>
          </div>

          {/* Detalles del servicio: texto libre y documentos del brief */}
          <fieldset className="border-t border-line pt-4">
            <legend className="text-sm font-medium text-ink">
              Detalles del servicio
            </legend>
            <p className="mt-1 mb-3 text-xs text-meta">
              Todo lo que el transportista tiene que saber y no cabe en los
              campos de arriba. Mientras más claro, mejores respuestas y menos
              llamadas el día del viaje.
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="of-notas">Notas para el transportista</Label>
              <Textarea
                id="of-notas"
                value={b.notas}
                onChange={(e) => setB({ ...b, notas: e.target.value })}
                placeholder={
                  "Grupo con equipos de ski propios, se necesita portaequipaje.\n" +
                  "Cuatro niños: manejo tranquilo en la subida.\n" +
                  "El guía se sube en la segunda parada."
                }
                rows={4}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Label>Documentos del viaje</Label>
              <p className="text-xs text-meta">
                Si tienes el itinerario o el programa en un archivo, súbelo acá y
                el transportista lo descarga desde el detalle de la oferta.
              </p>
              <AdjuntarDocumentos
                adjuntos={b.adjuntos}
                onCambio={(adjuntos) => setB({ ...b, adjuntos })}
              />
            </div>
          </fieldset>
        </div>
      )}

      {/* ------------------------------------------------ Paso 2 */}
      {paso === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="of-pasajeros">Cantidad de pasajeros</Label>
            <Input
              id="of-pasajeros"
              type="number"
              min={1}
              value={b.cantidadPasajeros || ""}
              onChange={(e) =>
                setB({ ...b, cantidadPasajeros: Number(e.target.value) })
              }
              className="max-w-40 font-mono tabular-nums"
              aria-invalid={tocado && !!erroresPaso2.pasajeros}
            />
            {tocado && erroresPaso2.pasajeros && (
              <p className="text-xs text-stop">{erroresPaso2.pasajeros}</p>
            )}
            <p className="text-xs text-meta">
              Solo ven la oferta los transportistas con un vehículo que los lleve a
              todos.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Requerimientos
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {REQUERIMIENTOS.map((req) => (
                <label
                  key={req}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm",
                    b.requerimientos.includes(req)
                      ? "border-signal bg-signal-soft"
                      : "border-line",
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={b.requerimientos.includes(req)}
                    onChange={(e) =>
                      setB({
                        ...b,
                        requerimientos: e.target.checked
                          ? [...b.requerimientos, req]
                          : b.requerimientos.filter((r) => r !== req),
                      })
                    }
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      b.requerimientos.includes(req)
                        ? "border-signal bg-signal text-ink"
                        : "border-line",
                    )}
                  >
                    {b.requerimientos.includes(req) && "✓"}
                  </span>
                  {ETIQUETA_REQUERIMIENTO[req]}
                </label>
              ))}
            </div>
          </fieldset>

        </div>
      )}

      {/* ------------------------------------------------ Paso 3 */}
      {paso === 3 && (
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Presupuesto referencial
            </legend>
            <p className="mb-3 text-xs text-meta">
              Tú piensas por pasajero, el transportista por jornada. Escríbelo como
              te acomode: la conversión se muestra siempre.
            </p>

            <RadioGroup
              value={b.modoPrecio}
              onValueChange={(v) =>
                setB({ ...b, modoPrecio: v as "total" | "por_pasajero", montoTexto: "" })
              }
              className="mb-3 flex gap-2"
            >
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm",
                  b.modoPrecio === "total" ? "border-signal bg-signal-soft" : "border-line",
                )}
              >
                <RadioGroupItem value="total" />
                Monto total
              </label>
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm",
                  b.modoPrecio === "por_pasajero"
                    ? "border-signal bg-signal-soft"
                    : "border-line",
                )}
              >
                <RadioGroupItem value="por_pasajero" />
                Por pasajero
              </label>
            </RadioGroup>

            <div className="flex flex-col gap-2">
              <Label htmlFor="of-monto" className="sr-only">
                {b.modoPrecio === "total" ? "Monto total" : "Monto por pasajero"}
              </Label>
              <Input
                id="of-monto"
                inputMode="numeric"
                value={b.montoTexto}
                onChange={(e) => setB({ ...b, montoTexto: e.target.value })}
                onBlur={() => {
                  const n = parsearMonto(b.montoTexto);
                  if (n) setB({ ...b, montoTexto: formatearNumero(n) });
                }}
                placeholder={b.modoPrecio === "total" ? "280.000" : "18.700"}
                className="max-w-56 font-mono text-lg tabular-nums"
                aria-invalid={tocado && !!erroresPaso3.monto}
              />
              {tocado && erroresPaso3.monto && (
                <p className="text-xs text-stop">{erroresPaso3.monto}</p>
              )}
              {total > 0 && (
                <p className="font-mono text-sm tabular-nums text-meta">
                  {formatearCLP(total)} · ≈ {formatearCLP(porPasajero)}/pax con{" "}
                  {b.cantidadPasajeros} pasajeros
                </p>
              )}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="of-hora-extra">Tarifa de hora extra (opcional)</Label>
            <Input
              id="of-hora-extra"
              inputMode="numeric"
              value={b.tarifaHoraExtraTexto}
              onChange={(e) => setB({ ...b, tarifaHoraExtraTexto: e.target.value })}
              onBlur={() => {
                const n = parsearMonto(b.tarifaHoraExtraTexto);
                if (n) setB({ ...b, tarifaHoraExtraTexto: formatearNumero(n) });
              }}
              placeholder="25.000"
              className="max-w-40 font-mono tabular-nums"
            />
            <p className="text-xs text-meta">
              Si la jornada se alarga más allá del bloque, esta es la tarifa por hora.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Adjudicación</legend>
            <RadioGroup
              value={b.modoAdjudicacion}
              onValueChange={(v) =>
                setB({ ...b, modoAdjudicacion: v as ModoAdjudicacion })
              }
              className="grid gap-2 sm:grid-cols-2"
            >
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
                  b.modoAdjudicacion === "yo_elijo"
                    ? "border-signal bg-signal-soft"
                    : "border-line",
                )}
              >
                <RadioGroupItem value="yo_elijo" className="mt-0.5" />
                <span>
                  Yo elijo
                  <span className="block text-xs text-meta">
                    Revisas las respuestas y adjudicas a quien quieras.
                  </span>
                </span>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
                  b.modoAdjudicacion === "automatico_primero"
                    ? "border-signal bg-signal-soft"
                    : "border-line",
                )}
              >
                <RadioGroupItem value="automatico_primero" className="mt-0.5" />
                <span>
                  Automático al primero
                  <span className="block text-xs text-meta">
                    El primero que acepte tu precio se lo lleva. Para traslados
                    estándar donde importa la velocidad.
                  </span>
                </span>
              </label>
            </RadioGroup>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Ventana de cierre
            </legend>
            <RadioGroup
              value={String(b.ventanaCierreHoras)}
              onValueChange={(v) =>
                setB({ ...b, ventanaCierreHoras: Number(v) as VentanaCierre })
              }
              className="flex gap-2"
            >
              {([6, 24, 72] as VentanaCierre[]).map((horas) => (
                <label
                  key={horas}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm",
                    b.ventanaCierreHoras === horas
                      ? "border-signal bg-signal-soft"
                      : "border-line",
                  )}
                >
                  <RadioGroupItem value={String(horas)} />
                  {horas} h
                </label>
              ))}
            </RadioGroup>
            <p className="mt-2 text-xs text-meta">
              Pasado el plazo, la oferta expira sola. Sin ventana las ofertas se
              pudren en el feed.
            </p>
          </fieldset>
        </div>
      )}

      {/* ------------------------------------------------ Navegación */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          {paso > 1 && (
            <Button variant="ghost" onClick={() => setPaso(paso - 1)}>
              <ArrowLeft className="size-4" aria-hidden />
              Atrás
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={guardarBorrador}>
            Guardar borrador
          </Button>
          {paso < 3 ? (
            <Button
              onClick={() => {
                setTocado(true);
                if (paso === 1 && !paso1Ok) return;
                if (paso === 2 && !paso2Ok) return;
                setTocado(false);
                setPaso(paso + 1);
              }}
            >
              Continuar
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={publicar}>
              <Send className="size-4" aria-hidden />
              Publicar oferta
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
