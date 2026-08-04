"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CenefaCordillera } from "@/components/marketing/paisajes";
import {
  agencia as buscarAgencia,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import { INICIO_POR_ROL, ROLES, type Rol } from "@/lib/navegacion";
import { useDatos, useSesion } from "@/lib/mock/use-datos";

const DESCRIPCION_ROL: Record<Rol, string> = {
  agencia: "Publica viajes, compara respuestas y paga con respaldo",
  transportista: "Recibe ofertas que calzan con tu flota y tu agenda",
  admin: "Verificación, disputas y métricas de la plataforma",
};

export default function EntrarPage() {
  const { datos, cargando } = useDatos();
  const sesion = useSesion();

  const nombreDe = (rol: Rol): string => {
    if (cargando) return "—";
    if (rol === "agencia") {
      return buscarAgencia(datos, sesion.agenciaId)?.razonSocial ?? "Agencia";
    }
    if (rol === "transportista") {
      return buscarTransportista(datos, sesion.carrierId)?.nombre ?? "Transportista";
    }
    return "Equipo Rutero";
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-10">
      <header className="text-center">
        <p className="font-display text-display text-ink">Rutero</p>
        <h1 className="mt-4 font-titular text-[1.75rem] leading-tight font-bold text-ink">
          Continúa con tu cuenta
        </h1>
        <p className="mt-2 text-sm text-meta">
          Elige con qué perfil quieres entrar.
        </p>
      </header>

      <CenefaCordillera className="h-6 text-line" />

      <ul className="flex flex-col gap-3">
        {ROLES.map(({ rol, icono: Icono }) => (
          <li key={rol}>
            <Link
              href={INICIO_POR_ROL[rol]}
              className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-signal"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-ink">
                <Icono className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">
                  {nombreDe(rol)}
                </span>
                <span className="block truncate text-sm text-meta">
                  {DESCRIPCION_ROL[rol]}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-meta transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="mx-auto flex w-fit items-center gap-1.5 text-sm text-meta underline-offset-4 hover:text-ink hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al inicio
      </Link>
    </div>
  );
}
