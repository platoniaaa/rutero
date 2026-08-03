/**
 * Las fixtures se anclan a la fecha en que se genera el seed, no a fechas
 * fijas, para que la demo siempre tenga viajes próximos y documentos por
 * vencer. Todo se calcula por offsets y es determinista dado el mismo `hoy`.
 */

function conHora(base: Date, horaMinuto: string): Date {
  const [hora, minuto] = horaMinuto.split(":").map(Number);
  const fecha = new Date(base);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha;
}

/** `dias(hoy, 3, "08:30")` → tres días después de hoy a las 08:30, en ISO. */
export function dias(hoy: Date, offset: number, horaMinuto = "00:00"): string {
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + offset);
  return conHora(fecha, horaMinuto).toISOString();
}

/** Igual que `dias` pero en horas, para expiraciones y marcas de tiempo. */
export function horas(hoy: Date, offset: number): string {
  return new Date(hoy.getTime() + offset * 3_600_000).toISOString();
}

/** Igual que `dias` pero en minutos, para hilos de chat. */
export function minutos(hoy: Date, offset: number): string {
  return new Date(hoy.getTime() + offset * 60_000).toISOString();
}

/**
 * El sábado o domingo más cercano que quede al menos `minimoDias` adelante.
 * Sirve para que ciertas ofertas de la demo no choquen con el recorrido
 * escolar de lunes a viernes, se genere el seed el día que se genere.
 */
export function finDeSemana(
  hoy: Date,
  minimoDias: number,
  dia: "sabado" | "domingo",
  horaMinuto = "08:00",
): string {
  const objetivo = dia === "sabado" ? 6 : 0;
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + minimoDias);
  while (fecha.getDay() !== objetivo) fecha.setDate(fecha.getDate() + 1);
  const [hora, minuto] = horaMinuto.split(":").map(Number);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha.toISOString();
}
