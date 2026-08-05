import {
  BadgeCheck,
  Bus,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  Gauge,
  Handshake,
  LayoutDashboard,
  Percent,
  Receipt,
  Send,
  Star,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type Rol = "agencia" | "transportista" | "admin";

export type ItemNav = {
  href: string;
  etiqueta: string;
  /** Etiqueta para la barra inferior del celular, donde cada casilla mide
   *  unos 70px. Si no está, se usa `etiqueta`. */
  corto?: string;
  icono: LucideIcon;
};

export const ROLES: { rol: Rol; etiqueta: string; icono: LucideIcon }[] = [
  { rol: "agencia", etiqueta: "Agencia", icono: Handshake },
  { rol: "transportista", etiqueta: "Transportista", icono: Truck },
  { rol: "admin", etiqueta: "Admin", icono: BadgeCheck },
];

export const INICIO_POR_ROL: Record<Rol, string> = {
  agencia: "/agencia",
  transportista: "/transportista",
  admin: "/admin",
};

export const NAVEGACION: Record<Rol, ItemNav[]> = {
  agencia: [
    { href: "/agencia", etiqueta: "Panel", icono: LayoutDashboard },
    {
      href: "/agencia/ofertas",
      etiqueta: "Mis ofertas",
      corto: "Ofertas",
      icono: ClipboardList,
    },
    { href: "/agencia/viajes", etiqueta: "Viajes", icono: Bus },
    { href: "/agencia/grupos", etiqueta: "Grupos", icono: Users },
    { href: "/agencia/pagos", etiqueta: "Pagos", icono: Receipt },
    { href: "/agencia/calificaciones", etiqueta: "Calificaciones", icono: Star },
    { href: "/agencia/perfil", etiqueta: "Perfil", icono: BadgeCheck },
  ],
  transportista: [
    { href: "/transportista", etiqueta: "Panel", icono: LayoutDashboard },
    { href: "/transportista/ofertas", etiqueta: "Ofertas", icono: ClipboardList },
    {
      href: "/transportista/postulaciones",
      etiqueta: "Postulaciones",
      corto: "Enviadas",
      icono: Send,
    },
    { href: "/transportista/viajes", etiqueta: "Viajes", icono: Bus },
    { href: "/transportista/grupos", etiqueta: "Grupos", icono: Users },
    {
      href: "/transportista/flota",
      etiqueta: "Flota y agenda",
      corto: "Flota",
      icono: CalendarClock,
    },
    { href: "/transportista/billetera", etiqueta: "Billetera", icono: Wallet },
    { href: "/transportista/perfil", etiqueta: "Perfil", icono: BadgeCheck },
  ],
  admin: [
    { href: "/admin", etiqueta: "Métricas", icono: Gauge },
    {
      href: "/admin/verificacion",
      etiqueta: "Verificación",
      corto: "Verificar",
      icono: FileCheck2,
    },
    { href: "/admin/cuentas", etiqueta: "Cuentas", icono: Users },
    {
      href: "/admin/viajes",
      etiqueta: "Viajes y disputas",
      corto: "Viajes",
      icono: Bus,
    },
    { href: "/admin/comisiones", etiqueta: "Comisiones", icono: Percent },
  ],
};

/**
 * Las cuatro secciones que ocupan la barra inferior del celular; el resto vive
 * detrás de "Más". Se eligen por uso diario, no por el orden del menú: son las
 * que alguien abre varias veces al día trabajando desde el teléfono.
 */
const PRINCIPALES_MOVIL: Record<Rol, string[]> = {
  agencia: [
    "/agencia",
    "/agencia/ofertas",
    "/agencia/viajes",
    "/agencia/pagos",
  ],
  transportista: [
    "/transportista",
    "/transportista/ofertas",
    "/transportista/postulaciones",
    "/transportista/viajes",
  ],
  admin: ["/admin", "/admin/verificacion", "/admin/cuentas", "/admin/viajes"],
};

/** Reparte las secciones del rol entre la barra inferior y la hoja "Más". */
export function navegacionMovil(rol: Rol): {
  principales: ItemNav[];
  resto: ItemNav[];
} {
  const items = NAVEGACION[rol];
  const principales = PRINCIPALES_MOVIL[rol];

  return {
    principales: principales.flatMap((href) => {
      const item = items.find((i) => i.href === href);
      return item ? [item] : [];
    }),
    resto: items.filter((i) => !principales.includes(i.href)),
  };
}

/**
 * ¿Este item corresponde a la ruta actual? El índice del rol no se marca
 * activo cuando estamos parados en una de sus subrutas.
 */
export function esRutaActiva(
  pathname: string,
  item: ItemNav,
  items: ItemNav[],
): boolean {
  if (pathname === item.href) return true;
  const esIndice = items[0]?.href === item.href;
  if (esIndice) return false;
  return pathname.startsWith(`${item.href}/`);
}

/** Deriva el rol desde la URL. El pathname manda por sobre el store. */
export function rolDesdeRuta(pathname: string): Rol | null {
  if (pathname.startsWith("/transportista")) return "transportista";
  if (pathname.startsWith("/agencia")) return "agencia";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}
