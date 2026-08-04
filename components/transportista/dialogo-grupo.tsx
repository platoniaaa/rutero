"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type { Id, VentanaCierre } from "@/lib/mock/types";
import { formatearCLP, formatearNumero, parsearMonto } from "@/lib/utils/format";
import { desglosarReferido } from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

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

function FormularioGrupo({
  carrierId,
  comisionPlataformaPct,
  onCerrar,
}: {
  carrierId: Id;
  comisionPlataformaPct: number;
  onCerrar: () => void;
}) {
  const publicarGrupo = useRutero((s) => s.publicarGrupo);

  const [titulo, setTitulo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [zona, setZona] = useState("Cordillera");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("08:00");
  const [pasajeros, setPasajeros] = useState("14");
  const [ticketTexto, setTicketTexto] = useState("");
  const [comisionPct, setComisionPct] = useState("10");
  const [ventana, setVentana] = useState<VentanaCierre>(24);
  const [notas, setNotas] = useState("");
  const [tocado, setTocado] = useState(false);

  const cantidad = Number(pasajeros) || 0;
  const ticket = parsearMonto(ticketTexto) ?? 0;
  const pct = Number(comisionPct) || 0;
  const ticketTotal = ticket * cantidad;
  const desglose = desglosarReferido(ticketTotal, pct, comisionPlataformaPct);

  const errores = {
    titulo: !titulo.trim() ? "Ponle un título al grupo." : null,
    destino: !destino.trim() ? "Falta el destino o el tour." : null,
    fecha: !fecha ? "Falta la fecha." : null,
    pasajeros: cantidad < 1 ? "Indica cuántas personas son." : null,
    ticket: ticket <= 0 ? "Indica el ticket estimado por pasajero." : null,
    comision:
      pct <= 0 || pct > 50 ? "La comisión tiene que estar entre 1% y 50%." : null,
  };
  const valido = Object.values(errores).every((e) => !e);

  function guardar() {
    setTocado(true);
    if (!valido) return;

    const cuando = new Date(`${fecha}T${hora}:00`);
    const publicadoEn = new Date();
    publicarGrupo({
      carrierId,
      titulo: titulo.trim(),
      origen: origen.trim(),
      destinoOTour: destino.trim(),
      zona,
      fecha: cuando.toISOString(),
      cantidadPasajeros: cantidad,
      ticketEstimadoPorPasajero: ticket,
      comisionSolicitadaPct: pct,
      notas: notas.trim(),
      expiraEn: new Date(
        publicadoEn.getTime() + ventana * 3_600_000,
      ).toISOString(),
    });

    toast.success("Grupo publicado", {
      description: "Las agencias de la zona lo van a ver en su bandeja de grupos.",
    });
    onCerrar();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-display-sm">
          Publicar grupo de pasajeros
        </DialogTitle>
        <DialogDescription>
          Tienes gente que quiere ir a algún lado pero no eres agencia. Publica el
          grupo, una agencia se lo lleva y te paga comisión por el dato.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="gr-titulo">Título</Label>
          <Input
            id="gr-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="14 personas al Valle Nevado el sábado"
            aria-invalid={tocado && !!errores.titulo}
          />
          {tocado && errores.titulo && (
            <p className="text-xs text-stop">{errores.titulo}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-origen">Desde dónde salen</Label>
          <Input
            id="gr-origen"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            placeholder="Santiago Centro"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-destino">Destino o tour</Label>
          <Input
            id="gr-destino"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder="Valle Nevado, día de nieve"
            aria-invalid={tocado && !!errores.destino}
          />
          {tocado && errores.destino && (
            <p className="text-xs text-stop">{errores.destino}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-zona">Zona</Label>
          <Select value={zona} onValueChange={setZona}>
            <SelectTrigger id="gr-zona">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZONAS.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-fecha">Fecha</Label>
          <div className="flex gap-2">
            <Input
              id="gr-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-invalid={tocado && !!errores.fecha}
            />
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-28"
              aria-label="Hora"
            />
          </div>
          {tocado && errores.fecha && (
            <p className="text-xs text-stop">{errores.fecha}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-pax">Cuántas personas</Label>
          <Input
            id="gr-pax"
            type="number"
            min={1}
            value={pasajeros}
            onChange={(e) => setPasajeros(e.target.value)}
            className="font-mono tabular-nums"
            aria-invalid={tocado && !!errores.pasajeros}
          />
          {tocado && errores.pasajeros && (
            <p className="text-xs text-stop">{errores.pasajeros}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-ticket">Ticket estimado por pasajero</Label>
          <Input
            id="gr-ticket"
            inputMode="numeric"
            value={ticketTexto}
            onChange={(e) => setTicketTexto(e.target.value)}
            onBlur={() => {
              const n = parsearMonto(ticketTexto);
              if (n) setTicketTexto(formatearNumero(n));
            }}
            placeholder="45.000"
            className="font-mono tabular-nums"
            aria-invalid={tocado && !!errores.ticket}
          />
          {tocado && errores.ticket && (
            <p className="text-xs text-stop">{errores.ticket}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gr-comision">Comisión que pides</Label>
          <div className="flex items-center gap-2">
            <Input
              id="gr-comision"
              type="number"
              min={1}
              max={50}
              value={comisionPct}
              onChange={(e) => setComisionPct(e.target.value)}
              className="w-24 font-mono tabular-nums"
              aria-invalid={tocado && !!errores.comision}
            />
            <span className="text-sm text-meta">% del ticket total</span>
          </div>
          {tocado && errores.comision && (
            <p className="text-xs text-stop">{errores.comision}</p>
          )}
        </div>
      </div>

      {/* Desglose del referido: el 5% de Rutero sale de la comisión, no del ticket */}
      {ticketTotal > 0 && pct > 0 && (
        <dl className="grid gap-1 rounded-lg border border-line bg-muted p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">
              Ticket total del grupo ({cantidad} × {formatearCLP(ticket)})
            </dt>
            <dd className="font-mono tabular-nums text-ink">
              {formatearCLP(ticketTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">Tu comisión ({pct}%)</dt>
            <dd className="font-mono tabular-nums text-ink">
              {formatearCLP(desglose.comisionTransportista)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">
              Comisión Rutero ({comisionPlataformaPct}% de la tuya)
            </dt>
            <dd className="font-mono tabular-nums text-stop">
              −{formatearCLP(desglose.comision)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-1">
            <dt className="font-medium text-ink">Recibes</dt>
            <dd className="font-mono font-medium tabular-nums text-go-ink">
              {formatearCLP(desglose.neto)}
            </dd>
          </div>
        </dl>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Ventana de cierre
        </legend>
        <RadioGroup
          value={String(ventana)}
          onValueChange={(v) => setVentana(Number(v) as VentanaCierre)}
          className="flex gap-2"
        >
          {([6, 24, 72] as VentanaCierre[]).map((h) => (
            <label
              key={h}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm",
                ventana === h ? "border-signal bg-signal-soft" : "border-line",
              )}
            >
              <RadioGroupItem value={String(h)} />
              {h} h
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gr-notas">Notas</Label>
        <Textarea
          id="gr-notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Son pasajeros que me contactaron directo. Necesitan entrada y clase de ski."
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={guardar}>
          <Users className="size-4" aria-hidden />
          Publicar grupo
        </Button>
      </DialogFooter>
    </>
  );
}

export function DialogoGrupo({
  abierto,
  onAbrirCambio,
  carrierId,
  comisionPlataformaPct,
}: {
  abierto: boolean;
  onAbrirCambio: (v: boolean) => void;
  carrierId: Id;
  comisionPlataformaPct: number;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onAbrirCambio}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <FormularioGrupo
          carrierId={carrierId}
          comisionPlataformaPct={comisionPlataformaPct}
          onCerrar={() => onAbrirCambio(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
