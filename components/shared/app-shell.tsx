"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CentroNotificaciones } from "@/components/shared/centro-notificaciones";
import { ReiniciarDemo } from "@/components/shared/reiniciar-demo";
import { cn } from "@/lib/utils";
import {
  INICIO_POR_ROL,
  NAVEGACION,
  ROLES,
  rolDesdeRuta,
  type ItemNav,
  type Rol,
} from "@/lib/navegacion";

function esRutaActiva(pathname: string, item: ItemNav, items: ItemNav[]) {
  if (pathname === item.href) return true;
  // El índice del rol no se marca activo cuando estamos en una subruta suya.
  const esIndice = items[0]?.href === item.href;
  if (esIndice) return false;
  return pathname.startsWith(`${item.href}/`);
}

/**
 * El switch de rol es la herramienta central de la demo, así que en celular no
 * se esconde detrás de un menú: baja a su propia fila y los tres botones se
 * reparten el ancho.
 */
function SwitchRol({ rolActivo }: { rolActivo: Rol | null }) {
  return (
    <div
      role="group"
      aria-label="Cambiar de rol"
      className="flex w-full items-center gap-1 rounded-md border border-white/15 bg-white/5 p-1 sm:w-auto"
    >
      {ROLES.map(({ rol, etiqueta, icono: Icono }) => {
        const activo = rol === rolActivo;
        return (
          <Link
            key={rol}
            href={INICIO_POR_ROL[rol]}
            aria-current={activo ? "true" : undefined}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded px-2 text-sm font-medium transition-colors sm:flex-none sm:justify-start sm:px-3",
              activo
                ? "bg-signal text-ink"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icono className="size-4 shrink-0" aria-hidden />
            {etiqueta}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // La landing es pública y trae su propio encabezado.
  if (pathname === "/") return <>{children}</>;

  // La URL es la fuente de verdad del rol. En la pantalla de entrada y en la
  // guía de estilos no hay rol encarnado, así que el switch va sin selección.
  const rolActivo = rolDesdeRuta(pathname);
  const items = rolActivo ? NAVEGACION[rolActivo] : [];

  return (
    <div className="flex min-h-full flex-col">
      <header className="surface-dark bg-base">
        {/* En celular son dos filas: marca con acciones arriba y el switch de
            rol abajo, a todo el ancho. En desktop, una sola. */}
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex items-baseline gap-2 font-display text-display-sm leading-none text-white"
            >
              Rutero
              <span className="text-eyebrow font-display text-signal">
                Prototipo
              </span>
            </Link>

            {/* Las acciones acompañan a la marca en celular para que el switch
                tenga la fila completa. */}
            <div className="flex items-center gap-1 sm:hidden">
              {rolActivo && <CentroNotificaciones rol={rolActivo} />}
              <ReiniciarDemo />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/50 lg:inline">
              {rolActivo ? "Estás viendo la app como" : "Entra como"}
            </span>
            <SwitchRol rolActivo={rolActivo} />
            <div className="hidden items-center gap-1 sm:flex">
              {rolActivo && <CentroNotificaciones rol={rolActivo} />}
              <ReiniciarDemo />
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <nav
            aria-label="Secciones"
            className="border-t border-white/10 bg-base-soft"
          >
            <ul className="mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-4">
              {items.map((item) => {
                const activo = esRutaActiva(pathname, item, items);
                const Icono = item.icono;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={activo ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm transition-colors",
                        activo
                          ? "border-signal font-medium text-white"
                          : "border-transparent text-white/60 hover:text-white",
                      )}
                    >
                      <Icono className="size-4" aria-hidden />
                      {item.etiqueta}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      {/* overflow-x-clip: red de seguridad para que un elemento suelto no
          genere scroll lateral en celular. El contenido que sí necesita
          desplazarse —tablas, nav de secciones— tiene su propio contenedor. */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 overflow-x-clip px-4 py-6">
        {children}
      </main>
    </div>
  );
}
