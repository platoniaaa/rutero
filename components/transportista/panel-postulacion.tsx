"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, HandCoins, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  bloqueosDe,
  conductoresDe,
  contraofertasDeCarrierEnOferta,
  documentosDe,
  flotaDe,
  franjasOcupadas,
  respuestaDeCarrierEnOferta,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import type { Datos, Id, Oferta } from "@/lib/mock/types";
import {
  ETIQUETA_LICENCIA,
  formatearCLP,
  formatearNumero,
  formatearPatente,
  montoPorPasajero,
  parsearMonto,
} from "@/lib/utils/format";
import {
  MAXIMO_CONTRAOFERTAS,
  desglosarViaje,
  evaluarPostulacion,
  licenciaCubreCapacidad,
  type Impedimento,
} from "@/lib/utils/rules";
import { cn } from "@/lib/utils";

function armarContexto(
  datos: Datos,
  oferta: Oferta,
  carrierId: Id,
  vehiculoId: Id,
  conductorId: Id,
  ahora: Date,
) {
  const vehiculo = flotaDe(datos, carrierId).find((v) => v.id === vehiculoId);
  const conductor = conductoresDe(datos, carrierId).find(
    (c) => c.id === conductorId,
  );
  const cuenta = buscarTransportista(datos, carrierId);
  if (!vehiculo || !conductor || !cuenta) return null;

  // Los documentos críticos del carrier, el vehículo y el conductor pesan juntos.
  const documentos = [
    ...documentosDe(datos, carrierId),
    ...documentosDe(datos, vehiculoId),
    ...documentosDe(datos, conductorId),
  ];

  return {
    oferta,
    vehiculo,
    conductor,
    cuentaVerificada: cuenta.estadoVerificacion === "verificada",
    documentos,
    bloqueos: bloqueosDe(datos, carrierId),
    viajesDelVehiculo: franjasOcupadas(datos, carrierId, vehiculoId).map((f) => ({
      franja: f.franja,
    })),
    contraofertasPrevias: contraofertasDeCarrierEnOferta(
      datos,
      oferta.id,
      carrierId,
    ),
    ahora,
  };
}

/**
 * Aceptar al precio o contraofertar, asignando vehículo y conductor
 * específicos. Los impedimentos de la sección 8 bloquean el envío con el
 * motivo a la vista.
 */
export function PanelPostulacion({
  oferta,
  carrierId,
  ahora,
}: {
  oferta: Oferta;
  carrierId: Id;
  ahora: Date;
}) {
  const datos = useRutero((s) => s.datos);
  const responder = useRutero((s) => s.responder);

  const flota = flotaDe(datos, carrierId);
  const conductores = conductoresDe(datos, carrierId);

  const [vehiculoId, setVehiculoId] = useState(
    () =>
      flota.find((v) => v.capacidadPasajeros >= oferta.cantidadPasajeros)?.id ??
      flota[0]?.id ??
      "",
  );
  const [conductorId, setConductorId] = useState(() => {
    const vehiculo = flota.find((v) => v.id === vehiculoId) ?? flota[0];
    return (
      conductores.find(
        (c) =>
          vehiculo &&
          licenciaCubreCapacidad(c.licenciaClase, vehiculo.capacidadPasajeros),
      )?.id ??
      conductores[0]?.id ??
      ""
    );
  });
  const [tipo, setTipo] = useState<"aceptacion" | "contraoferta">("aceptacion");
  const [montoTexto, setMontoTexto] = useState("");
  const [nota, setNota] = useState("");

  const respuestaExistente = respuestaDeCarrierEnOferta(datos, oferta.id, carrierId);
  const contraofertasUsadas = contraofertasDeCarrierEnOferta(
    datos,
    oferta.id,
    carrierId,
  );

  // Barato de recalcular en cada render: son arrays de decenas de elementos.
  const contexto =
    vehiculoId && conductorId
      ? armarContexto(datos, oferta, carrierId, vehiculoId, conductorId, ahora)
      : null;
  const impedimentos: Impedimento[] = contexto ? evaluarPostulacion(contexto) : [];

  // El límite de contraofertas solo aplica si va a contraofertar de nuevo.
  const impedimentosAplicables = impedimentos.filter(
    (imp) => imp.motivo !== "limite_contraofertas" || tipo === "contraoferta",
  );

  const monto =
    tipo === "aceptacion"
      ? oferta.presupuestoReferencial
      : (parsearMonto(montoTexto) ?? 0);
  const desglose = desglosarViaje(monto, datos.comisiones.viajePct);
  const montoValido = tipo === "aceptacion" || monto > 0;

  const sinFlota = flota.length === 0 || conductores.length === 0;

  function enviar() {
    if (!montoValido || impedimentosAplicables.length > 0) return;
    responder({
      ofertaId: oferta.id,
      carrierId,
      vehiculoId,
      conductorId,
      tipo,
      monto,
      nota: nota.trim(),
    });
    toast.success(
      tipo === "aceptacion"
        ? "Aceptaste al precio publicado"
        : "Contraoferta enviada",
      {
        description:
          oferta.modoAdjudicacion === "automatico_primero" && tipo === "aceptacion"
            ? "Esta oferta adjudica automático al primero: revisa Viajes."
            : "La agencia la va a ver en su bandeja de respuestas.",
      },
    );
  }

  if (respuestaExistente) {
    return (
      <section className="rounded-lg border border-go/40 bg-go-soft p-5">
        <h2 className="flex items-center gap-2 font-display text-display-sm text-ink">
          <Check className="size-5 text-go" aria-hidden />
          Ya respondiste esta oferta
        </h2>
        <p className="mt-2 text-sm text-ink/80">
          {respuestaExistente.tipo === "aceptacion"
            ? `Aceptaste al precio publicado (${formatearCLP(respuestaExistente.monto)}).`
            : `Contraofertaste ${formatearCLP(respuestaExistente.monto)}.`}{" "}
          Puedes seguirla en{" "}
          <Link href="/transportista/postulaciones" className="font-medium underline underline-offset-4">
            Mis postulaciones
          </Link>
          .
        </p>
      </section>
    );
  }

  if (sinFlota) {
    return (
      <section className="rounded-lg border border-line bg-muted p-5">
        <h2 className="font-display text-display-sm text-ink">
          Te falta flota para postular
        </h2>
        <p className="mt-2 text-sm text-meta">
          Para responder necesitas al menos un vehículo y un conductor cargados.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/transportista/flota">Ir a Flota y agenda</Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-label="Responder la oferta"
      className="rounded-lg border border-line bg-surface p-5"
    >
      <h2 className="font-display text-display-sm text-ink">Responder</h2>
      <p className="mt-1 text-sm text-meta">
        Asignas un vehículo y un conductor específicos: son parte de tu respuesta.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-vehiculo">Vehículo</Label>
          <Select value={vehiculoId} onValueChange={setVehiculoId}>
            <SelectTrigger id="post-vehiculo">
              <SelectValue placeholder="Elige un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {flota.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {formatearPatente(v.patente)} · {v.marca} {v.modelo} ·{" "}
                  {v.capacidadPasajeros} pax
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="post-conductor">Conductor</Label>
          <Select value={conductorId} onValueChange={setConductorId}>
            <SelectTrigger id="post-conductor">
              <SelectValue placeholder="Elige un conductor" />
            </SelectTrigger>
            <SelectContent>
              {conductores.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre} · {ETIQUETA_LICENCIA[c.licenciaClase].split(" — ")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {impedimentosAplicables.length > 0 && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-2 rounded-lg border border-stop/40 bg-stop-soft p-4"
        >
          <p className="flex items-center gap-2 font-medium text-ink">
            <AlertTriangle className="size-4 text-stop" aria-hidden />
            No puedes postular con esta combinación
          </p>
          <ul className="flex flex-col gap-1 text-sm text-ink/80">
            {impedimentosAplicables.map((imp) => (
              <li key={imp.motivo}>· {imp.detalle}</li>
            ))}
          </ul>
          {impedimentosAplicables.some(
            (i) =>
              i.motivo === "documentos_vencidos" ||
              i.motivo === "cuenta_no_verificada",
          ) && (
            <Button variant="outline" size="sm" className="w-fit" asChild>
              <Link href="/transportista/flota">Revisar mis documentos</Link>
            </Button>
          )}
        </div>
      )}

      <RadioGroup
        value={tipo}
        onValueChange={(v) => setTipo(v as "aceptacion" | "contraoferta")}
        className="mt-4 grid gap-2 sm:grid-cols-2"
      >
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
            tipo === "aceptacion" ? "border-signal bg-signal-soft" : "border-line",
          )}
        >
          <RadioGroupItem value="aceptacion" className="mt-0.5" />
          <span>
            Aceptar al precio publicado
            <span className="mt-0.5 block font-mono text-base font-medium tabular-nums">
              {formatearCLP(oferta.presupuestoReferencial)}
            </span>
          </span>
        </label>
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
            tipo === "contraoferta" ? "border-signal bg-signal-soft" : "border-line",
            contraofertasUsadas >= MAXIMO_CONTRAOFERTAS && "opacity-50",
          )}
        >
          <RadioGroupItem
            value="contraoferta"
            className="mt-0.5"
            disabled={contraofertasUsadas >= MAXIMO_CONTRAOFERTAS}
          />
          <span>
            Contraofertar
            <span className="block text-xs text-meta">
              {contraofertasUsadas >= MAXIMO_CONTRAOFERTAS
                ? `Ya usaste tus ${MAXIMO_CONTRAOFERTAS} contraofertas en este viaje.`
                : `Te ${MAXIMO_CONTRAOFERTAS - contraofertasUsadas === 1 ? "queda" : "quedan"} ${MAXIMO_CONTRAOFERTAS - contraofertasUsadas} de ${MAXIMO_CONTRAOFERTAS}.`}
            </span>
          </span>
        </label>
      </RadioGroup>

      {tipo === "contraoferta" && (
        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="post-monto">Tu monto</Label>
          <Input
            id="post-monto"
            inputMode="numeric"
            value={montoTexto}
            onChange={(e) => setMontoTexto(e.target.value)}
            onBlur={() => {
              const n = parsearMonto(montoTexto);
              if (n) setMontoTexto(formatearNumero(n));
            }}
            placeholder={formatearNumero(oferta.presupuestoReferencial)}
            className="max-w-56 font-mono text-lg tabular-nums"
            aria-invalid={montoTexto !== "" && !montoValido}
          />
          {monto > 0 && (
            <p className="font-mono text-sm tabular-nums text-meta">
              ≈ {formatearCLP(montoPorPasajero(monto, oferta.cantidadPasajeros))}
              /pax · la agencia compara contra esa cifra
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="post-nota">Nota para la agencia</Label>
        <Textarea
          id="post-nota"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder={
            tipo === "contraoferta"
              ? "Explica el ajuste: «Incluye cadenas y peaje de la cuesta»."
              : "Opcional: «Llevo portaequipaje para 15 pares de esquíes»."
          }
          rows={2}
        />
      </div>

      {/* El desglose siempre visible: bruto, comisión, neto. */}
      {monto > 0 && (
        <dl className="mt-4 grid gap-1 rounded-lg border border-line bg-muted p-4 text-sm sm:max-w-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">La agencia paga</dt>
            <dd className="font-mono tabular-nums text-ink">{formatearCLP(desglose.bruto)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-meta">
              Comisión Rutero ({datos.comisiones.viajePct}%)
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

      {oferta.modoAdjudicacion === "automatico_primero" && tipo === "aceptacion" && (
        <p className="mt-3 flex items-start gap-2 text-sm text-meta">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Esta oferta adjudica automático: si eres el primero en aceptar, el viaje
          es tuyo al instante.
        </p>
      )}

      <Button
        className="mt-4"
        size="lg"
        onClick={enviar}
        disabled={impedimentosAplicables.length > 0 || !montoValido}
      >
        <HandCoins className="size-4" aria-hidden />
        {tipo === "aceptacion" ? "Aceptar al precio" : "Enviar contraoferta"}
      </Button>
    </section>
  );
}
