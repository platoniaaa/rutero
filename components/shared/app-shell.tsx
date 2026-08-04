"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CentroNotificaciones } from "@/components/shared/centro-notificaciones";
import { MenuCuenta } from "@/components/shared/menu-cuenta";
import { cn } from "@/lib/utils";
import {
  INICIO_POR_ROL,
  NAVEGACION,
  rolDesdeRuta,
  type ItemNav,
} from "@/lib/navegacion";

function esRutaActiva(pathname: string, item: ItemNav, items: ItemNav[]) {
  if (pathname === item.href) return true;
  // El índice del rol no se marca activo cuando estamos en una subruta suya.
  const esIndice = items[0]?.href === item.href;
  if (esIndice) return false;
  return pathname.startsWith(`${item.href}/`);
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
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <Link
            href={rolActivo ? INICIO_POR_ROL[rolActivo] : "/"}
            className="font-display text-display-sm leading-none text-white"
          >
            Rutero
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            {rolActivo && <CentroNotificaciones rol={rolActivo} />}
            <MenuCuenta rolActivo={rolActivo} />
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
