import type { MetadataRoute } from "next";

/**
 * Manifiesto para "agregar a la pantalla de inicio".
 *
 * Con esto Rutero se abre en su propia ventana, sin la barra de direcciones
 * del navegador: es la diferencia entre parecer una página y parecer una app.
 *
 * Las rutas van con el `basePath` adelante porque el sitio no cuelga de la
 * raíz del dominio sino de `/rutero`. Next prefija sola la etiqueta
 * `<link rel="manifest">`, pero no lo que va adentro del JSON.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Sin esto `output: export` no sabe que la ruta se puede escribir a disco. */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rutero",
    short_name: "Rutero",
    description:
      "Marketplace que conecta agencias de turismo con transportistas de pasajeros en Chile.",
    lang: "es-CL",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b3c5d",
    theme_color: "#0b3c5d",
    icons: [
      {
        src: `${base}/icono.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${base}/icono.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
