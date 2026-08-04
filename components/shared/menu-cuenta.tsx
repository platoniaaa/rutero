"use client";

import Link from "next/link";
import { Check, ChevronDown, LogOut, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  agencia as buscarAgencia,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import { INICIO_POR_ROL, ROLES, type Rol } from "@/lib/navegacion";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { cn } from "@/lib/utils";

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Menú de la cuenta activa, con el cambio de perfil adentro. */
export function MenuCuenta({ rolActivo }: { rolActivo: Rol | null }) {
  const { datos, cargando } = useDatos();
  const sesion = useSesion();

  const nombrePorRol = (rol: Rol): string => {
    if (cargando) return "";
    if (rol === "agencia") {
      return buscarAgencia(datos, sesion.agenciaId)?.razonSocial ?? "Agencia";
    }
    if (rol === "transportista") {
      return buscarTransportista(datos, sesion.carrierId)?.nombre ?? "Transportista";
    }
    return "Equipo Rutero";
  };

  const etiquetaPorRol: Record<Rol, string> = {
    agencia: "Agencia de turismo",
    transportista: "Transportista",
    admin: "Administración",
  };

  const nombreActual = rolActivo ? nombrePorRol(rolActivo) : "Elegir perfil";
  const Icono = rolActivo
    ? (ROLES.find((r) => r.rol === rolActivo)?.icono ?? Settings)
    : Settings;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* min-w-0 en el botón y en el bloque de texto: sin eso, un nombre
            largo como "Turismo Aconcagua Ltda." estira el header más allá del
            ancho del celular. En pantalla chica va solo el avatar. */}
        <button
          type="button"
          aria-label={`Cuenta: ${nombreActual}`}
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-left transition-colors hover:bg-white/10 sm:px-3"
        >
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-signal font-display text-sm text-ink"
          >
            {nombreActual ? iniciales(nombreActual) : <Icono className="size-4" />}
          </span>
          <span className="hidden min-w-0 flex-1 sm:block">
            <span className="block truncate text-sm font-medium text-white">
              {nombreActual}
            </span>
            {rolActivo && (
              <span className="block truncate text-xs text-white/60">
                {etiquetaPorRol[rolActivo]}
              </span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 text-white/60" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-meta">Cambiar de perfil</DropdownMenuLabel>
        {ROLES.map(({ rol, icono: IconoRol }) => {
          const activo = rol === rolActivo;
          return (
            <DropdownMenuItem key={rol} asChild>
              <Link
                href={INICIO_POR_ROL[rol]}
                className={cn("flex items-center gap-2", activo && "font-medium")}
              >
                <IconoRol className="size-4 shrink-0 text-meta" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{nombrePorRol(rol)}</span>
                  <span className="block truncate text-xs text-meta">
                    {etiquetaPorRol[rol]}
                  </span>
                </span>
                {activo && <Check className="size-4 shrink-0 text-go" aria-hidden />}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/">
            <LogOut className="size-4 text-meta" aria-hidden />
            Cerrar sesión
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
