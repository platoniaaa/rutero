import { comprimirImagen } from "@/lib/utils/imagen";
import type { Adjunto } from "@/lib/mock/types";

/**
 * Los adjuntos se guardan dentro de `localStorage`, que ronda los 5 MB en
 * total para todo el estado de la demo. Las imágenes se comprimen; el resto
 * tiene tope duro.
 */
const PESO_MAXIMO_BYTES = 450_000;

/** Tipos que aceptamos: itinerarios, programas y planos del punto de encuentro. */
export const TIPOS_ACEPTADOS =
  "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.csv,text/plain";

export type ResultadoAdjunto =
  | { ok: true; adjunto: Omit<Adjunto, "id"> }
  | { ok: false; motivo: string };

export function formatearPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(new Error("no se pudo leer"));
    lector.readAsDataURL(archivo);
  });
}

export async function prepararAdjunto(archivo: File): Promise<ResultadoAdjunto> {
  // Las imágenes se achican antes de guardarse; un PDF no se puede comprimir.
  if (archivo.type.startsWith("image/")) {
    const resultado = await comprimirImagen(archivo);
    if (!resultado.ok) return { ok: false, motivo: resultado.motivo };
    return {
      ok: true,
      adjunto: {
        nombre: archivo.name,
        tipo: archivo.type,
        tamano: archivo.size,
        contenido: resultado.dataUrl,
      },
    };
  }

  if (archivo.size > PESO_MAXIMO_BYTES) {
    return {
      ok: false,
      motivo: `${archivo.name} pesa ${formatearPeso(archivo.size)} y el máximo permitido es ${formatearPeso(PESO_MAXIMO_BYTES)}. Sube una versión más liviana o pega los detalles en el texto.`,
    };
  }

  const contenido = await leerComoDataUrl(archivo).catch(() => null);
  if (!contenido) {
    return { ok: false, motivo: `No pudimos leer ${archivo.name}.` };
  }

  return {
    ok: true,
    adjunto: {
      nombre: archivo.name,
      tipo: archivo.type || "application/octet-stream",
      tamano: archivo.size,
      contenido,
    },
  };
}

/** Etiqueta corta del tipo de archivo, para la ficha del adjunto. */
export function etiquetaTipo(tipo: string, nombre: string): string {
  if (tipo === "application/pdf") return "PDF";
  if (tipo.startsWith("image/")) return "Imagen";
  if (tipo.includes("word") || /\.docx?$/i.test(nombre)) return "Word";
  if (tipo.includes("sheet") || tipo.includes("excel") || /\.xlsx?$/i.test(nombre)) {
    return "Planilla";
  }
  if (tipo === "text/csv" || /\.csv$/i.test(nombre)) return "CSV";
  if (tipo.startsWith("text/")) return "Texto";
  return "Archivo";
}
