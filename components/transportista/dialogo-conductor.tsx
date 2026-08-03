"use client";

import { useState } from "react";
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
import { useRutero } from "@/lib/mock/store";
import type { ClaseLicencia, Conductor, Id } from "@/lib/mock/types";
import { ETIQUETA_LICENCIA, esRutValido, formatearRut } from "@/lib/utils/format";

type Formulario = {
  nombre: string;
  rut: string;
  telefono: string;
  licenciaClase: ClaseLicencia;
  licenciaVencimiento: string;
  idiomas: string;
};

const VACIO: Formulario = {
  nombre: "",
  rut: "",
  telefono: "",
  licenciaClase: "A2",
  licenciaVencimiento: "",
  idiomas: "Español",
};

function aFechaInput(iso: string): string {
  return iso.slice(0, 10);
}

/** Se monta con el diálogo, así el estado arranca limpio en cada apertura. */
function FormularioConductor({
  carrierId,
  conductor,
  onCerrar,
}: {
  carrierId: Id;
  conductor?: Conductor;
  onCerrar: () => void;
}) {
  const agregarConductor = useRutero((s) => s.agregarConductor);
  const actualizarConductor = useRutero((s) => s.actualizarConductor);
  const [form, setForm] = useState<Formulario>(() =>
    conductor
      ? {
          nombre: conductor.nombre,
          rut: conductor.rut,
          telefono: conductor.telefono,
          licenciaClase: conductor.licenciaClase,
          licenciaVencimiento: aFechaInput(conductor.licenciaVencimiento),
          idiomas: conductor.idiomas.join(", "),
        }
      : VACIO,
  );
  const [tocado, setTocado] = useState(false);

  const errores = {
    nombre: !form.nombre.trim() ? "Falta el nombre." : null,
    rut: !esRutValido(form.rut)
      ? "El RUT no es válido. Revisa el dígito verificador."
      : null,
    telefono: form.telefono.replace(/\D/g, "").length < 9 ? "Falta el teléfono." : null,
    licenciaVencimiento: !form.licenciaVencimiento
      ? "Indica cuándo vence la licencia."
      : null,
  };
  const valido = Object.values(errores).every((e) => e === null);

  function guardar() {
    setTocado(true);
    if (!valido) return;

    const datos = {
      carrierId,
      nombre: form.nombre.trim(),
      rut: form.rut.replace(/[^0-9kK]/g, "").toUpperCase(),
      foto: conductor?.foto ?? "",
      telefono: form.telefono.replace(/\D/g, ""),
      licenciaClase: form.licenciaClase,
      licenciaVencimiento: new Date(
        `${form.licenciaVencimiento}T12:00:00`,
      ).toISOString(),
      idiomas: form.idiomas
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    };

    if (conductor) {
      actualizarConductor(conductor.id, datos);
      toast.success(`${datos.nombre} actualizado`);
    } else {
      agregarConductor(datos);
      toast.success(`${datos.nombre} agregado`);
    }
    onCerrar();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-display-sm">
          {conductor ? "Editar conductor" : "Agregar conductor"}
        </DialogTitle>
        <DialogDescription>
          La clase de licencia determina qué vehículos puede manejar.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="co-nombre">Nombre completo</Label>
            <Input
              id="co-nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              aria-invalid={tocado && !!errores.nombre}
            />
            {tocado && errores.nombre && (
              <p className="text-xs text-stop">{errores.nombre}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="co-rut">RUT</Label>
            <Input
              id="co-rut"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              onBlur={() =>
                esRutValido(form.rut) && setForm({ ...form, rut: formatearRut(form.rut) })
              }
              placeholder="12.845.663-5"
              className="font-mono tabular-nums"
              aria-invalid={tocado && !!errores.rut}
            />
            {tocado && errores.rut && <p className="text-xs text-stop">{errores.rut}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="co-telefono">Teléfono</Label>
            <Input
              id="co-telefono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="56912345678"
              className="font-mono tabular-nums"
              aria-invalid={tocado && !!errores.telefono}
            />
            {tocado && errores.telefono && (
              <p className="text-xs text-stop">{errores.telefono}</p>
            )}
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              Clase de licencia
            </legend>
            <RadioGroup
              value={form.licenciaClase}
              onValueChange={(v) =>
                setForm({ ...form, licenciaClase: v as ClaseLicencia })
              }
              className="gap-2"
            >
              {(["A2", "A3"] as ClaseLicencia[]).map((clase) => (
                <label
                  key={clase}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-line px-3 text-sm"
                >
                  <RadioGroupItem value={clase} id={`licencia-${clase}`} />
                  {ETIQUETA_LICENCIA[clase]}
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="co-vencimiento">Vencimiento de la licencia</Label>
            <Input
              id="co-vencimiento"
              type="date"
              value={form.licenciaVencimiento}
              onChange={(e) =>
                setForm({ ...form, licenciaVencimiento: e.target.value })
              }
              aria-invalid={tocado && !!errores.licenciaVencimiento}
            />
            {tocado && errores.licenciaVencimiento && (
              <p className="text-xs text-stop">{errores.licenciaVencimiento}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="co-idiomas">Idiomas</Label>
            <Input
              id="co-idiomas"
              value={form.idiomas}
              onChange={(e) => setForm({ ...form, idiomas: e.target.value })}
              placeholder="Español, Inglés"
            />
          <p className="text-xs text-meta">Separados por coma.</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={guardar}>
          {conductor ? "Guardar cambios" : "Agregar conductor"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function DialogoConductor({
  abierto,
  onAbrirCambio,
  carrierId,
  conductor,
}: {
  abierto: boolean;
  onAbrirCambio: (abierto: boolean) => void;
  carrierId: Id;
  conductor?: Conductor;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onAbrirCambio}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <FormularioConductor
          carrierId={carrierId}
          conductor={conductor}
          onCerrar={() => onAbrirCambio(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
