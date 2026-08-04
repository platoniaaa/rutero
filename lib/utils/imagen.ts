/**
 * La demo guarda las fotos de documentos dentro de `localStorage`, así que
 * antes hay que achicarlas: una foto de celular pesa varios megas y el cupo
 * del navegador ronda los 5 MB en total.
 */

const LADO_MAXIMO = 900;
const CALIDAD = 0.6;
/** Sobre este peso no se guarda la foto y se cae al placeholder. */
const PESO_MAXIMO_BYTES = 350_000;

export type ResultadoImagen =
  | { ok: true; dataUrl: string }
  | { ok: false; motivo: string };

/** Reduce la imagen y la devuelve como data URL JPEG. */
export async function comprimirImagen(archivo: File): Promise<ResultadoImagen> {
  if (!archivo.type.startsWith("image/")) {
    return { ok: false, motivo: "El archivo tiene que ser una imagen." };
  }

  const bitmap = await createImageBitmap(archivo).catch(() => null);
  if (!bitmap) {
    return { ok: false, motivo: "No pudimos leer esta imagen. Prueba con otra foto." };
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { ok: false, motivo: "Tu navegador no pudo procesar la imagen." };
  }

  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", CALIDAD);

  // Un data URL en base64 ocupa aproximadamente 4/3 de los bytes originales.
  if (dataUrl.length * 0.75 > PESO_MAXIMO_BYTES) {
    return {
      ok: false,
      motivo: "La foto quedó muy pesada. Prueba con una más chica.",
    };
  }

  return { ok: true, dataUrl };
}
