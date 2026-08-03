"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
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
import { comprimirImagen } from "@/lib/utils/imagen";
import { cn } from "@/lib/utils";

/** Las caras que se piden de un documento. El carnet de conducir lleva dos. */
export type Cara = "frente" | "dorso";

type Capturas = Partial<Record<Cara, string>>;

function CapturaCara({
  cara,
  etiqueta,
  valor,
  onCambio,
  onLimpiar,
}: {
  cara: Cara;
  etiqueta: string;
  valor?: string;
  onCambio: (dataUrl: string) => void;
  onLimpiar: () => void;
}) {
  const camaraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);

  async function tomar(archivo: File | undefined) {
    if (!archivo) return;
    setProcesando(true);
    const resultado = await comprimirImagen(archivo);
    setProcesando(false);

    if (!resultado.ok) {
      toast.error(resultado.motivo);
      return;
    }
    onCambio(resultado.dataUrl);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`captura-${cara}`}>{etiqueta}</Label>

      <div
        className={cn(
          "relative flex aspect-[8/5] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line bg-muted",
          valor && "border-solid border-line bg-surface",
        )}
      >
        {valor ? (
          // Es un data URL generado en el navegador, no un asset del proyecto.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valor}
            alt={`Vista previa del ${etiqueta.toLowerCase()}`}
            className="size-full object-contain"
          />
        ) : (
          <p className="px-4 text-center text-sm text-meta">
            {procesando ? "Procesando la foto…" : "Sin foto todavía"}
          </p>
        )}
      </div>

      <input
        ref={camaraRef}
        id={`captura-${cara}`}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => void tomar(e.target.files?.[0])}
      />
      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void tomar(e.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => camaraRef.current?.click()}
          disabled={procesando}
        >
          <Camera className="size-4" aria-hidden />
          Tomar foto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => galeriaRef.current?.click()}
          disabled={procesando}
        >
          <ImageIcon className="size-4" aria-hidden />
          Elegir de galería
        </Button>
        {valor && (
          <Button type="button" variant="ghost" size="sm" onClick={onLimpiar}>
            <RotateCcw className="size-4" aria-hidden />
            Repetir
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Captura de documento con vista previa antes de confirmar. No se le pide un
 * PDF escaneado a un furgonero: se saca la foto con el celular y listo.
 */
export function DialogoSubirDocumento({
  abierto,
  onAbrirCambio,
  titulo,
  descripcion,
  dosCaras = false,
  pideVencimiento = true,
  onConfirmar,
}: {
  abierto: boolean;
  onAbrirCambio: (abierto: boolean) => void;
  titulo: string;
  descripcion?: string;
  dosCaras?: boolean;
  pideVencimiento?: boolean;
  onConfirmar: (datos: {
    archivo: string;
    fechaEmision: string;
    fechaVencimiento?: string;
  }) => void;
}) {
  const [capturas, setCapturas] = useState<Capturas>({});
  const [emision, setEmision] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  const faltaFrente = !capturas.frente;
  const faltaDorso = dosCaras && !capturas.dorso;
  const faltaVencimiento = pideVencimiento && !vencimiento;
  const puedeConfirmar = !faltaFrente && !faltaDorso && !faltaVencimiento;

  function limpiar() {
    setCapturas({});
    setEmision("");
    setVencimiento("");
  }

  function confirmar() {
    if (!capturas.frente) return;
    onConfirmar({
      archivo: capturas.frente,
      fechaEmision: emision
        ? new Date(`${emision}T12:00:00`).toISOString()
        : new Date().toISOString(),
      fechaVencimiento: vencimiento
        ? new Date(`${vencimiento}T12:00:00`).toISOString()
        : undefined,
    });
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm">{titulo}</DialogTitle>
          <DialogDescription>
            {descripcion ??
              "Saca la foto con el celular o elige una de la galería. Revisa que se lea bien antes de confirmar."}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("grid gap-4", dosCaras && "sm:grid-cols-2")}>
          <CapturaCara
            cara="frente"
            etiqueta={dosCaras ? "Frente" : "Documento"}
            valor={capturas.frente}
            onCambio={(dataUrl) => setCapturas((c) => ({ ...c, frente: dataUrl }))}
            onLimpiar={() => setCapturas((c) => ({ ...c, frente: undefined }))}
          />
          {dosCaras && (
            <CapturaCara
              cara="dorso"
              etiqueta="Dorso"
              valor={capturas.dorso}
              onCambio={(dataUrl) => setCapturas((c) => ({ ...c, dorso: dataUrl }))}
              onLimpiar={() => setCapturas((c) => ({ ...c, dorso: undefined }))}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="doc-emision">Fecha de emisión</Label>
            <Input
              id="doc-emision"
              type="date"
              value={emision}
              onChange={(e) => setEmision(e.target.value)}
            />
          </div>
          {pideVencimiento && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-vencimiento">Fecha de vencimiento</Label>
              <Input
                id="doc-vencimiento"
                type="date"
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                aria-invalid={faltaVencimiento && vencimiento !== ""}
              />
            </div>
          )}
        </div>

        {!puedeConfirmar && (
          <p className="text-sm text-meta">
            {faltaFrente
              ? "Falta la foto del documento."
              : faltaDorso
                ? "Falta la foto del dorso."
                : "Falta la fecha de vencimiento."}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onAbrirCambio(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!puedeConfirmar}>
            <Upload className="size-4" aria-hidden />
            Confirmar y enviar a revisión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
