/**
 * Utilidades de formato chileno. En el Hito 1 se agregan montos en CLP, fechas
 * y RUT; por ahora solo vive acá lo que necesita la placa patente.
 */

/**
 * Normaliza una patente chilena al formato de placa: `BCDF·12` para las de
 * cuatro letras y `AB·1234` para las antiguas de dos. Si no reconoce el
 * formato devuelve el original en mayúsculas, sin inventar separadores.
 */
export function formatearPatente(patente: string): string {
  const limpia = patente.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const moderna = /^([A-Z]{4})(\d{2})$/.exec(limpia);
  if (moderna) return `${moderna[1]}·${moderna[2]}`;

  const antigua = /^([A-Z]{2})(\d{4})$/.exec(limpia);
  if (antigua) return `${antigua[1]}·${antigua[2]}`;

  return patente.toUpperCase();
}
