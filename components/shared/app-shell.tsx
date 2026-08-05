"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarraInferior } from "@/components/shared/barra-inferior";
import { CentroNotificaciones } from "@/components/shared/centro-notificaciones";
import { MenuCuenta } from "@/components/shared/menu-cuenta";
import { cn } from "@/lib/utils";
import { esRutaActiva, INICIO_POR_ROL, NAVEGACION, rolDesdeRuta } from "@/lib/navegacion";

export function AppShell({ children }: { children: React.ReactNode }) {
  // El sitio estático se sirve con barra final (/agencia/), pero los href del
  // menú no la llevan. Se normaliza acá para que ambos comparen igual.
  const pathname = usePathname().replace(/(.)\/$/, "$1");

  // La landing es pública y trae su propio encabezado.
  if (pathname === "/") return <>{children}</>;

  // La URL es la fuente de verdad del rol. En la pantalla de entrada y en la
  // guía de estilos no hay rol encarnado, así que el switch va sin selección.
  const rolActivo = rolDesdeRuta(pathname);
  const items = rolActivo ? NAVEGACION[rolActivo] : [];

  return (
    <div className="flex min-h-full flex-col">
      {/* Pegado arriba: en celular la cabecera es la única referencia fija de
          dónde estás parado, y que se vaya con el scroll se siente web. */}
      <header className="surface-dark sticky top-0 z-30 bg-base pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <Link
            href={rolActivo ? INICIO_POR_ROL[rolActivo] : "/"}
            className="flex min-h-11 items-center font-display text-display-sm leading-none text-white"
          >
            Rutero
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            {rolActivo && <CentroNotificaciones rol={rolActivo} />}
            <MenuCuenta rolActivo={rolActivo} />
          </div>
        </div>

        {/* El menú horizontal es de escritorio. En celular las secciones viven
            en la barra inferior, donde llega el pulgar. */}
        {items.length > 0 && (
          <nav
            aria-label="Secciones"
            className="hidden border-t border-white/10 bg-base-soft lg:block"
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
          desplazarse —tablas, nav de secciones— tiene su propio contenedor.
          El padding de abajo deja libre la barra inferior. */}
      <main
        className={cn(
          "mx-auto w-full max-w-[1400px] flex-1 overflow-x-clip px-4 py-5 sm:py-6",
          rolActivo
            ? "pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-6"
            : "pb-8",
        )}
      >
        {children}
      </main>

      {rolActivo && <BarraInferior rol={rolActivo} />}
    </div>
  );
}
