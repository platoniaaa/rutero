import type { StaticImageData } from "next/image";

import fotoBus from "@/fotos/tipo-bus.jpg";
import fotoMinibus from "@/fotos/tipo-minibus.jpg";
import fotoSprinter from "@/fotos/tipo-sprinter.jpg";
import fotoVan from "@/fotos/tipo-van.jpg";
import type { TipoVehiculo } from "@/lib/mock/types";

/**
 * Foto genérica por tipo de vehículo, para las tarjetas de flota.
 *
 * Van importadas (no desde `public/`) para que el build las copie con hash y
 * el `basePath` de GitHub Pages se resuelva solo. Origen y licencias en
 * `fotos/CREDITOS.md`.
 */
export const FOTO_TIPO_VEHICULO: Record<TipoVehiculo, StaticImageData> = {
  van: fotoVan,
  minibus: fotoMinibus,
  sprinter: fotoSprinter,
  bus: fotoBus,
};

/**
 * El Coaster de la foto de minibús trae publicidad en el costado; este
 * encuadre la deja fuera y muestra el frente del vehículo.
 */
export const ENCUADRE_TIPO: Record<TipoVehiculo, string> = {
  van: "object-center",
  minibus: "object-[78%_center]",
  sprinter: "object-[center_65%]",
  bus: "object-center",
};
