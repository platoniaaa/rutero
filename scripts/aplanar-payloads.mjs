/**
 * Aplana los payloads del caché de segmentos del router.
 *
 * Al exportar, Next escribe los payloads RSC anidados en carpetas:
 *
 *   agencia/ofertas/of-1/__next.!KGFnZW5jaWEp/agencia/ofertas/$d$id/__PAGE__.txt
 *
 * pero el cliente los pide con los tramos unidos por puntos:
 *
 *   agencia/ofertas/of-1/__next.!KGFnZW5jaWEp.agencia.ofertas.$d$id.__PAGE__.txt
 *
 * Con un servidor Next eso da igual, porque resuelve la ruta. En un hosting
 * estático como Pages no existe el archivo y cada prefetch se va a 404: la
 * navegación igual funciona (cae al payload completo), pero se descarga la
 * página de error entera cada vez. Acá se dejan además con el nombre plano.
 *
 * Solo copia archivos, nunca borra. Si Next cambia y ya los escribe planos,
 * este paso no encuentra nada que hacer y no molesta.
 */
import { copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const SALIDA = "out";
const PREFIJO = "__next.";

let copiados = 0;

/** Copia el contenido de una carpeta de payloads con el nombre punteado. */
async function copiarPlano(carpeta, destino, prefijo) {
  for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    const nombre = `${prefijo}.${entrada.name}`;
    if (entrada.isDirectory()) {
      await copiarPlano(ruta, destino, nombre);
    } else {
      await copyFile(ruta, join(destino, nombre));
      copiados += 1;
    }
  }
}

async function recorrer(carpeta) {
  for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
    if (!entrada.isDirectory()) continue;
    // _next son los assets compilados: ahí no hay payloads de segmento.
    if (entrada.name === "_next") continue;

    const ruta = join(carpeta, entrada.name);
    if (entrada.name.startsWith(PREFIJO)) {
      await copiarPlano(ruta, carpeta, entrada.name);
    } else {
      await recorrer(ruta);
    }
  }
}

await recorrer(SALIDA);
console.log(`Payloads aplanados: ${copiados}`);
