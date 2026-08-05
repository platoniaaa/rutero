import type { NextConfig } from "next";

/**
 * En GitHub Pages el sitio cuelga de /rutero, en local de la raíz. Lo define
 * el workflow al construir, así que `npm run dev` sigue en localhost:3000.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Sitio 100% estático: no hay servidor Node donde publicarlo.
  output: "export",
  basePath,
  // Cada ruta queda como carpeta/index.html, que es lo que espera Pages.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
