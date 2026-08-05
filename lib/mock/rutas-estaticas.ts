/**
 * Rangos de ids para prerenderizar las rutas `[id]`.
 *
 * El sitio se publica como export estático: no hay servidor que resuelva un
 * `[id]` en caliente, así que cada ruta tiene que existir como archivo al
 * momento de construir. Los ids del store son correlativos (`of-26`, `of-27`,
 * ...), así que un rango cubre todo lo que alguien alcance a crear en su
 * navegador. Si alguna vez se llega al techo, súbelo y vuelve a construir.
 */
export const TECHO_IDS = 150;

/** `[{ id: "of-1" }, ..., { id: "of-150" }]` */
export function rangoIds(prefijo: string): { id: string }[] {
  return Array.from({ length: TECHO_IDS }, (_, i) => ({
    id: `${prefijo}-${i + 1}`,
  }));
}
