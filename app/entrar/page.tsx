import Link from "next/link";
import { ArrowLeft, ArrowRight, Palette } from "lucide-react";

import { INICIO_POR_ROL, ROLES, type Rol } from "@/lib/navegacion";

const DESCRIPCION_ROL: Record<Rol, string> = {
  agencia:
    "Publica ofertas de viaje, compara respuestas, adjudica y paga. Es el lado que genera la demanda.",
  transportista:
    "Recibe ofertas que calzan con tu flota, acepta o contraoferta, y administra vehículos, conductores y agenda.",
  admin:
    "Verifica documentos, resuelve disputas, ajusta comisiones y mira las métricas del marketplace.",
};

export default function EntrarPage() {
  return (
    <div className="flex flex-col gap-8 py-6">
      <header className="max-w-2xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-meta underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio
        </Link>
        <p className="text-eyebrow font-display text-meta">Prototipo · Fase 1</p>
        <h1 className="font-display text-display-lg text-ink">
          Elige desde qué lado mirar
        </h1>
        <p className="mt-3 text-meta">
          Este prototipo no tiene login: se cambia de rol acá o en la barra
          superior, en cualquier momento.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-3">
        {ROLES.map(({ rol, etiqueta, icono: Icono }) => (
          <li key={rol}>
            <Link
              href={INICIO_POR_ROL[rol]}
              className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-signal"
            >
              <span className="flex size-11 items-center justify-center rounded bg-signal-soft text-signal-ink">
                <Icono className="size-5" aria-hidden />
              </span>
              <span className="font-display text-display-sm text-ink">
                {etiqueta}
              </span>
              <span className="flex-1 text-sm text-meta">
                {DESCRIPCION_ROL[rol]}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                Entrar
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/styleguide"
        className="flex w-fit items-center gap-2 text-sm text-meta underline-offset-4 hover:text-ink hover:underline"
      >
        <Palette className="size-4" aria-hidden />
        Ver la guía de estilos
      </Link>
    </div>
  );
}
