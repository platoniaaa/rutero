"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRutero } from "@/lib/mock/store";
import type { Equipamiento, Id, TipoVehiculo, Vehiculo } from "@/lib/mock/types";
import {
  ETIQUETA_EQUIPAMIENTO,
  ETIQUETA_TIPO_VEHICULO,
  esPatenteValida,
  formatearPatente,
} from "@/lib/utils/format";

const TIPOS: TipoVehiculo[] = ["van", "minibus", "sprinter", "bus"];
const EQUIPOS: Equipamiento[] = [
  "aire_acondicionado",
  "portaequipaje",
  "cadenas",
  "wifi",
  "rampa_accesibilidad",
];

type Formulario = {
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
  tipo: TipoVehiculo;
  capacidadPasajeros: string;
  capacidadEquipaje: string;
  equipamiento: Equipamiento[];
  interurbano: boolean;
};

const VACIO: Formulario = {
  patente: "",
  marca: "",
  modelo: "",
  anio: String(new Date().getFullYear()),
  tipo: "van",
  capacidadPasajeros: "",
  capacidadEquipaje: "",
  equipamiento: ["aire_acondicionado"],
  interurbano: true,
};

function desde(vehiculo: Vehiculo): Formulario {
  return {
    patente: vehiculo.patente,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    anio: String(vehiculo.anio),
    tipo: vehiculo.tipo,
    capacidadPasajeros: String(vehiculo.capacidadPasajeros),
    capacidadEquipaje: String(vehiculo.capacidadEquipaje),
    equipamiento: vehiculo.equipamiento,
    interurbano: vehiculo.interurbano,
  };
}

/**
 * El formulario vive en un hijo que se monta junto con el diálogo, así el
 * estado arranca limpio en cada apertura sin sincronizar con un efecto.
 */
function FormularioVehiculo({
  carrierId,
  vehiculo,
  onCerrar,
}: {
  carrierId: Id;
  vehiculo?: Vehiculo;
  onCerrar: () => void;
}) {
  const agregarVehiculo = useRutero((s) => s.agregarVehiculo);
  const actualizarVehiculo = useRutero((s) => s.actualizarVehiculo);
  const [form, setForm] = useState<Formulario>(() =>
    vehiculo ? desde(vehiculo) : VACIO,
  );
  const [tocado, setTocado] = useState(false);

  const pasajeros = Number(form.capacidadPasajeros);
  const errores = {
    patente: !esPatenteValida(form.patente)
      ? "Formato de patente chilena: cuatro letras y dos números, como BCDF12."
      : null,
    marca: !form.marca.trim() ? "Falta la marca." : null,
    modelo: !form.modelo.trim() ? "Falta el modelo." : null,
    capacidadPasajeros:
      !Number.isInteger(pasajeros) || pasajeros < 1
        ? "Indica cuántos pasajeros lleva."
        : null,
  };
  const valido = Object.values(errores).every((e) => e === null);

  function guardar() {
    setTocado(true);
    if (!valido) return;

    const datos = {
      carrierId,
      patente: form.patente.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      anio: Number(form.anio) || new Date().getFullYear(),
      tipo: form.tipo,
      capacidadPasajeros: pasajeros,
      capacidadEquipaje: Number(form.capacidadEquipaje) || 0,
      fotos: vehiculo?.fotos ?? [],
      equipamiento: form.equipamiento,
      interurbano: form.interurbano,
    };

    if (vehiculo) {
      actualizarVehiculo(vehiculo.id, datos);
      toast.success(`${formatearPatente(datos.patente)} actualizado`);
    } else {
      agregarVehiculo(datos);
      toast.success(`${formatearPatente(datos.patente)} agregado a tu flota`);
    }
    onCerrar();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-display-sm">
          {vehiculo ? "Editar vehículo" : "Agregar vehículo"}
        </DialogTitle>
        <DialogDescription>
          Los datos del vehículo se muestran a la agencia cuando postulas a una
          oferta.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-patente">Patente</Label>
            <Input
              id="ve-patente"
              value={form.patente}
              onChange={(e) => setForm({ ...form, patente: e.target.value })}
              placeholder="BCDF12"
              className="font-mono uppercase"
              aria-invalid={tocado && !!errores.patente}
            />
            {tocado && errores.patente && (
              <p className="text-xs text-stop">{errores.patente}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-tipo">Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) => setForm({ ...form, tipo: v as TipoVehiculo })}
            >
              <SelectTrigger id="ve-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ETIQUETA_TIPO_VEHICULO[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-marca">Marca</Label>
            <Input
              id="ve-marca"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Mercedes-Benz"
              aria-invalid={tocado && !!errores.marca}
            />
            {tocado && errores.marca && (
              <p className="text-xs text-stop">{errores.marca}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-modelo">Modelo</Label>
            <Input
              id="ve-modelo"
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="Sprinter 516"
              aria-invalid={tocado && !!errores.modelo}
            />
            {tocado && errores.modelo && (
              <p className="text-xs text-stop">{errores.modelo}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-anio">Año</Label>
            <Input
              id="ve-anio"
              type="number"
              min={1980}
              max={new Date().getFullYear() + 1}
              value={form.anio}
              onChange={(e) => setForm({ ...form, anio: e.target.value })}
              className="font-mono tabular-nums"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-pasajeros">Capacidad de pasajeros</Label>
            <Input
              id="ve-pasajeros"
              type="number"
              min={1}
              value={form.capacidadPasajeros}
              onChange={(e) =>
                setForm({ ...form, capacidadPasajeros: e.target.value })
              }
              className="font-mono tabular-nums"
              aria-invalid={tocado && !!errores.capacidadPasajeros}
            />
            {tocado && errores.capacidadPasajeros && (
              <p className="text-xs text-stop">{errores.capacidadPasajeros}</p>
            )}
            {pasajeros > 17 && (
              <p className="text-xs text-meta">
                Sobre 17 asientos el conductor necesita licencia A3.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ve-equipaje">Capacidad de equipaje</Label>
            <Input
              id="ve-equipaje"
              type="number"
              min={0}
              value={form.capacidadEquipaje}
              onChange={(e) => setForm({ ...form, capacidadEquipaje: e.target.value })}
              className="font-mono tabular-nums"
              placeholder="Maletas"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 sm:col-span-2">
            <div>
              <Label htmlFor="ve-interurbano">Presta servicios interurbanos</Label>
              <p className="mt-0.5 text-xs text-meta">
                Si viaja entre ciudades, se le exige tacógrafo al día.
              </p>
            </div>
            <Switch
              id="ve-interurbano"
              checked={form.interurbano}
              onCheckedChange={(v) => setForm({ ...form, interurbano: v })}
            />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-ink">Equipamiento</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {EQUIPOS.map((equipo) => (
                <label
                  key={equipo}
                  className="flex min-h-11 items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={form.equipamiento.includes(equipo)}
                    onCheckedChange={(marcado) =>
                      setForm({
                        ...form,
                        equipamiento: marcado
                          ? [...form.equipamiento, equipo]
                          : form.equipamiento.filter((e) => e !== equipo),
                      })
                    }
                  />
                  {ETIQUETA_EQUIPAMIENTO[equipo]}
                </label>
              ))}
            </div>
        </fieldset>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button onClick={guardar}>
          {vehiculo ? "Guardar cambios" : "Agregar vehículo"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function DialogoVehiculo({
  abierto,
  onAbrirCambio,
  carrierId,
  vehiculo,
}: {
  abierto: boolean;
  onAbrirCambio: (abierto: boolean) => void;
  carrierId: Id;
  vehiculo?: Vehiculo;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onAbrirCambio}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <FormularioVehiculo
          carrierId={carrierId}
          vehiculo={vehiculo}
          onCerrar={() => onAbrirCambio(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
