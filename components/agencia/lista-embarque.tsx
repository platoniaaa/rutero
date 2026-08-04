"use client";

import { useState } from "react";
import { ClipboardPaste, Plus, Trash2, Users } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRutero } from "@/lib/mock/store";
import type { Id, Pasajero } from "@/lib/mock/types";

type NuevoPasajero = Omit<Pasajero, "id" | "viajeId">;

/**
 * Convierte lo pegado desde una planilla en pasajeros. Acepta tabulaciones,
 * punto y coma o comas como separador, y salta la fila de encabezado si viene.
 */
export function parsearPlanilla(texto: string): NuevoPasajero[] {
  const filas = texto
    .split(/\r?\n/)
    .map((f) => f.trim())
    .filter(Boolean);

  return filas
    .map((fila) => {
      const separador = fila.includes("\t") ? "\t" : fila.includes(";") ? ";" : ",";
      const celdas = fila.split(separador).map((c) => c.trim());
      return {
        nombreCompleto: celdas[0] ?? "",
        documento: celdas[1] ?? "",
        telefono: celdas[2] ?? "",
        puntoRecogida: celdas[3] ?? "",
        observaciones: celdas.slice(4).join(" ").trim(),
      };
    })
    .filter((p, i) => {
      if (!p.nombreCompleto) return false;
      // Descarta la fila de encabezado si el usuario copió la tabla completa.
      if (i === 0 && /^(nombre|pasajero|nombre completo)$/i.test(p.nombreCompleto)) {
        return false;
      }
      return true;
    });
}

function DialogoPegar({
  abierto,
  onAbrirCambio,
  onConfirmar,
}: {
  abierto: boolean;
  onAbrirCambio: (v: boolean) => void;
  onConfirmar: (pasajeros: NuevoPasajero[]) => void;
}) {
  const [texto, setTexto] = useState("");
  const previsualizados = parsearPlanilla(texto);

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) setTexto("");
        onAbrirCambio(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm">
            Pegar desde una planilla
          </DialogTitle>
          <DialogDescription>
            Copia las filas desde Excel o Google Sheets en este orden: nombre,
            documento, teléfono, punto de recogida y observaciones.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          className="font-mono text-xs"
          placeholder={
            "Andrea Solís Bravo\t16552398-9\t56961234567\tHotel Plaza San Francisco\n" +
            "Tomás Solís Herrera\t12907441-8\t56961234567\tHotel Plaza San Francisco\tMenor de edad"
          }
          aria-label="Filas de la planilla"
        />

        {previsualizados.length > 0 && (
          <div className="rounded-lg border border-line">
            <p className="border-b border-line px-3 py-2 text-sm text-meta">
              Se van a agregar{" "}
              <span className="font-mono font-medium tabular-nums text-ink">
                {previsualizados.length}
              </span>{" "}
              {previsualizados.length === 1 ? "pasajero" : "pasajeros"}
            </p>
            <ul className="max-h-48 overflow-y-auto px-3 py-2 text-sm">
              {previsualizados.map((p, i) => (
                <li key={i} className="py-0.5 text-ink">
                  <span className="font-mono text-xs text-meta">{i + 1}.</span>{" "}
                  {p.nombreCompleto}
                  {p.documento && (
                    <span className="font-mono text-xs text-meta"> · {p.documento}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onAbrirCambio(false)}>
            Cancelar
          </Button>
          <Button
            disabled={previsualizados.length === 0}
            onClick={() => {
              onConfirmar(previsualizados);
              setTexto("");
              onAbrirCambio(false);
            }}
          >
            Agregar {previsualizados.length || ""}{" "}
            {previsualizados.length === 1 ? "pasajero" : "pasajeros"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoUnoPorUno({
  abierto,
  onAbrirCambio,
  onConfirmar,
}: {
  abierto: boolean;
  onAbrirCambio: (v: boolean) => void;
  onConfirmar: (pasajero: NuevoPasajero) => void;
}) {
  const [p, setP] = useState<NuevoPasajero>({
    nombreCompleto: "",
    documento: "",
    telefono: "",
    puntoRecogida: "",
    observaciones: "",
  });

  const valido = p.nombreCompleto.trim().length > 0;

  function limpiar() {
    setP({
      nombreCompleto: "",
      documento: "",
      telefono: "",
      puntoRecogida: "",
      observaciones: "",
    });
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) limpiar();
        onAbrirCambio(v);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm">
            Agregar pasajero
          </DialogTitle>
          <DialogDescription>
            El conductor lleva esta lista impresa el día del viaje.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="pax-nombre">Nombre completo</Label>
            <Input
              id="pax-nombre"
              value={p.nombreCompleto}
              onChange={(e) => setP({ ...p, nombreCompleto: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pax-doc">RUT o pasaporte</Label>
            <Input
              id="pax-doc"
              value={p.documento}
              onChange={(e) => setP({ ...p, documento: e.target.value })}
              className="font-mono tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pax-fono">Teléfono</Label>
            <Input
              id="pax-fono"
              value={p.telefono}
              onChange={(e) => setP({ ...p, telefono: e.target.value })}
              className="font-mono tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="pax-recogida">Punto de recogida</Label>
            <Input
              id="pax-recogida"
              value={p.puntoRecogida}
              onChange={(e) => setP({ ...p, puntoRecogida: e.target.value })}
              placeholder="Hotel Plaza San Francisco"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="pax-obs">Observaciones</Label>
            <Input
              id="pax-obs"
              value={p.observaciones}
              onChange={(e) => setP({ ...p, observaciones: e.target.value })}
              placeholder="Menor de edad, silla de ruedas, alergias"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onAbrirCambio(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!valido}
            onClick={() => {
              onConfirmar(p);
              limpiar();
              onAbrirCambio(false);
            }}
          >
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** La agencia carga la nómina; el transportista la ve e imprime. */
export function ListaEmbarque({
  viajeId,
  pasajeros,
  cupos,
  editable,
}: {
  viajeId: Id;
  pasajeros: Pasajero[];
  cupos: number;
  editable: boolean;
}) {
  const agregarPasajeros = useRutero((s) => s.agregarPasajeros);
  const eliminarPasajero = useRutero((s) => s.eliminarPasajero);
  const [pegarAbierto, setPegarAbierto] = useState(false);
  const [unoAbierto, setUnoAbierto] = useState(false);

  const sobrecupo = pasajeros.length > cupos;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-display-sm text-ink">
            Lista de embarque
          </h2>
          <p className="mt-1 text-sm text-meta">
            <span className="font-mono tabular-nums">{pasajeros.length}</span> de{" "}
            <span className="font-mono tabular-nums">{cupos}</span> pasajeros
            cargados.{" "}
            {editable && "El conductor la lleva impresa el día del viaje."}
          </p>
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPegarAbierto(true)}>
              <ClipboardPaste className="size-4" aria-hidden />
              Pegar planilla
            </Button>
            <Button onClick={() => setUnoAbierto(true)}>
              <Plus className="size-4" aria-hidden />
              Agregar pasajero
            </Button>
          </div>
        )}
      </div>

      {sobrecupo && (
        <p role="alert" className="text-sm text-stop">
          Cargaste {pasajeros.length} pasajeros y el viaje se adjudicó por {cupos}.
          Quita los que sobran o coordina con el transportista por el chat.
        </p>
      )}

      {pasajeros.length === 0 ? (
        <ListaVacia
          icono={Users}
          titulo="Todavía no cargas la lista"
          detalle={
            editable
              ? "Pega la nómina desde tu planilla o agrégalos uno por uno. Sin la lista el conductor sale a ciegas."
              : "La agencia todavía no carga los pasajeros de este viaje."
          }
          accion={
            editable ? (
              <Button onClick={() => setPegarAbierto(true)}>
                Pegar desde planilla
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* En celular la tabla de siete columnas no sirve: cada pasajero es
              una tarjeta. */}
          <ul className="flex flex-col gap-2 md:hidden">
            {pasajeros.map((p, i) => (
              <li
                key={p.id}
                className="rounded-lg border border-line bg-surface p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      <span className="font-mono text-xs text-meta">
                        {i + 1}.
                      </span>{" "}
                      {p.nombreCompleto}
                    </p>
                    {p.documento && (
                      <p className="font-mono text-xs tabular-nums text-meta">
                        {p.documento}
                      </p>
                    )}
                  </div>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Quitar a ${p.nombreCompleto}`}
                      onClick={() => {
                        eliminarPasajero(p.id);
                        toast.success(`${p.nombreCompleto} quitado de la lista`);
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  )}
                </div>

                <dl className="mt-2 flex flex-col gap-1 border-t border-line pt-2 text-sm">
                  {p.telefono && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-meta">Teléfono</dt>
                      <dd className="font-mono tabular-nums text-ink">
                        {p.telefono}
                      </dd>
                    </div>
                  )}
                  {p.puntoRecogida && (
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-meta">Recogida</dt>
                      <dd className="text-right text-ink">{p.puntoRecogida}</dd>
                    </div>
                  )}
                  {p.observaciones && (
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-meta">Observaciones</dt>
                      <dd className="text-right text-ink">{p.observaciones}</dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Pasajero</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Punto de recogida</TableHead>
                <TableHead>Observaciones</TableHead>
                {editable && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pasajeros.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono tabular-nums text-meta">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium text-ink">
                    {p.nombreCompleto}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {p.documento || "—"}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {p.telefono || "—"}
                  </TableCell>
                  <TableCell>{p.puntoRecogida || "—"}</TableCell>
                  <TableCell className="text-meta">
                    {p.observaciones || "—"}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Quitar a ${p.nombreCompleto}`}
                        onClick={() => {
                          eliminarPasajero(p.id);
                          toast.success(`${p.nombreCompleto} quitado de la lista`);
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </>
      )}

      <DialogoPegar
        abierto={pegarAbierto}
        onAbrirCambio={setPegarAbierto}
        onConfirmar={(nuevos) => {
          agregarPasajeros(viajeId, nuevos);
          toast.success(
            `${nuevos.length} ${nuevos.length === 1 ? "pasajero agregado" : "pasajeros agregados"}`,
          );
        }}
      />
      <DialogoUnoPorUno
        abierto={unoAbierto}
        onAbrirCambio={setUnoAbierto}
        onConfirmar={(p) => {
          agregarPasajeros(viajeId, [p]);
          toast.success(`${p.nombreCompleto} agregado`);
        }}
      />
    </section>
  );
}
