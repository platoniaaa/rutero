"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  esRutaActiva,
  navegacionMovil,
  NAVEGACION,
  type ItemNav,
  type Rol,
} from "@/lib/navegacion";

const casilla =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 transition-colors";
const casillaActiva = "text-signal";
const casillaInactiva = "text-white/60 hover:text-white";

/**
 * Navegación de celular.
 *
 * En pantalla chica la tira de pestañas de arriba mostraba tres secciones de
 * siete y escondía el resto tras un scroll horizontal que nadie descubre. Acá
 * las cuatro principales quedan fijas abajo, al alcance del pulgar, y "Más"
 * abre una hoja con las que faltan. Sobre `lg` esto desaparece y manda el menú
 * horizontal del encabezado.
 */
export function BarraInferior({ rol }: { rol: Rol }) {
  const [abierta, setAbierta] = useState(false);
  // El sitio estático se sirve con barra final (/agencia/) y los href del menú
  // no la traen: se normaliza para que ambos comparen igual.
  const pathname = usePathname().replace(/(.)\/$/, "$1");

  const { principales, resto } = navegacionMovil(rol);
  const items = NAVEGACION[rol];
  const restoActivo = resto.some((i) => esRutaActiva(pathname, i, items));

  return (
    <>
      {/* `pb-[env(safe-area-inset-bottom)]`: en los teléfonos con barra de
          gestos la franja de abajo la ocupa el sistema. Sin esto los rótulos
          quedan debajo de la barra del propio celular. */}
      <nav
        aria-label="Secciones"
        className="surface-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-base pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {principales.map((item) => (
            <li key={item.href}>
              <Casilla
                item={item}
                activo={esRutaActiva(pathname, item, items)}
              />
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={() => setAbierta(true)}
              aria-haspopup="dialog"
              aria-expanded={abierta}
              className={cn(
                casilla,
                restoActivo ? casillaActiva : casillaInactiva,
              )}
            >
              {restoActivo && <Indicador />}
              <MoreHorizontal className="size-5 shrink-0" aria-hidden />
              <span className="w-full truncate text-center text-[10px] leading-none">
                Más
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={abierta} onOpenChange={setAbierta}>
        <DialogContent
          showCloseButton={false}
          // La hoja sube desde abajo y ocupa el ancho completo: es el gesto de
          // una app, no el de un cuadro de diálogo centrado.
          className="fixed inset-x-0 top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 gap-0 rounded-t-xl rounded-b-none p-0 pb-[env(safe-area-inset-bottom)] data-open:slide-in-from-bottom data-closed:slide-out-to-bottom"
        >
          <div className="flex flex-col gap-1 border-b border-line px-4 pt-4 pb-3">
            <DialogTitle className="font-display text-display-sm text-ink">
              Secciones
            </DialogTitle>
            <DialogDescription className="text-sm text-meta">
              El resto de tu cuenta, fuera de las cuatro de la barra.
            </DialogDescription>
          </div>

          <ul className="flex flex-col p-2">
            {resto.map((item) => {
              const activo = esRutaActiva(pathname, item, items);
              const Icono = item.icono;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setAbierta(false)}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "flex min-h-13 items-center gap-3 rounded-lg px-3 text-base transition-colors",
                      activo
                        ? "bg-signal-soft font-medium text-signal-ink"
                        : "text-ink hover:bg-muted",
                    )}
                  >
                    <Icono
                      className={cn(
                        "size-5 shrink-0",
                        activo ? "text-signal-ink" : "text-meta",
                      )}
                      aria-hidden
                    />
                    {item.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Casilla({ item, activo }: { item: ItemNav; activo: boolean }) {
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={cn(casilla, activo ? casillaActiva : casillaInactiva)}
    >
      {activo && <Indicador />}
      <Icono className="size-5 shrink-0" aria-hidden />
      <span className="w-full truncate text-center text-[10px] leading-none">
        {item.corto ?? item.etiqueta}
      </span>
    </Link>
  );
}

/** Barrita superior que marca la casilla activa. */
function Indicador() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-signal"
    />
  );
}
