"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
import { useRutero } from "@/lib/mock/store";

/**
 * Devuelve la demo al seed original. Vive en la barra superior porque durante
 * una sesión de validación con usuarios hay que poder empezar de cero rápido,
 * desde el rol que sea.
 */
export function ReiniciarDemo() {
  const reiniciarDemo = useRutero((s) => s.reiniciarDemo);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label="Reiniciar la demo"
          title="Reiniciar la demo"
          className="flex size-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-5" aria-hidden />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-display-sm">
            ¿Reiniciar la demo?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se pierde todo lo que hayas hecho en este navegador: ofertas
            publicadas, adjudicaciones, pagos, mensajes y calificaciones. Vuelve
            el seed original.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              reiniciarDemo();
              toast.success("Demo reiniciada");
            }}
          >
            Reiniciar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
