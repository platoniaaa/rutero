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
    { href: "/agencia/ofertas", etiqueta: "Mis ofertas", icono: ClipboardList },
    { href: "/agencia/viajes", etiqueta: "Viajes", icono: Bus },
    { href: "/agencia/grupos", etiqueta: "Grupos", icono: Users },
    { href: "/agencia/pagos", etiqueta: "Pagos", icono: Receipt },
    { href: "/agencia/calificaciones", etiqueta: "Calificaciones", icono: Star },
    { href: "/agencia/perfil", etiqueta: "Perfil", icono: BadgeCheck },
  ],
  transportista: [
    { href: "/transportista", etiqueta: "Panel", icono: LayoutDashboard },
    { href: "/transportista/ofertas", etiqueta: "Ofertas", icono: ClipboardList },
    { href: "/transportista/postulaciones", etiqueta: "Postulaciones", icono: Send },
    { href: "/transportista/viajes", etiqueta: "Viajes", icono: Bus },
    { href: "/transportista/grupos", etiqueta: "Grupos", icono: Users },
    { href: "/transportista/flota", etiqueta: "Flota y agenda", icono: CalendarClock },
    { href: "/transportista/billetera", etiqueta: "Billetera", icono: Wallet },
    { href: "/transportista/perfil", etiqueta: "Perfil", icono: BadgeCheck },
  ],
  admin: [
    { href: "/admin", etiqueta: "Métricas", icono: Gauge },
    { href: "/admin/verificacion", etiqueta: "Verificación", icono: FileCheck2 },
    { href: "/admin/cuentas", etiqueta: "Cuentas", icono: Users },
    { href: "/admin/viajes", etiqueta: "Viajes y disputas", icono: Bus },
    { href: "/admin/comisiones", etiqueta: "Comisiones", icono: Percent },
  ],
};

/** Deriva el rol desde la URL. El pathname manda por sobre el store. */
export function rolDesdeRuta(pathname: string): Rol | null {
  if (pathname.startsWith("/transportista")) return "transportista";
  if (pathname.startsWith("/agencia")) return "agencia";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}
