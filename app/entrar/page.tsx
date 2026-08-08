"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Handshake,
  Truck,
  UserPlus,
} from "lucide-react";

import { CenefaCordillera } from "@/components/marketing/paisajes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  agencia as buscarAgencia,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import { INICIO_POR_ROL, ROLES, type Rol } from "@/lib/navegacion";
import { useRutero } from "@/lib/mock/store";
import { useDatos, useSesion } from "@/lib/mock/use-datos";

const DESCRIPCION_ROL: Record<Rol, string> = {
  agencia: "Publica viajes, compara respuestas y paga con respaldo",
  transportista: "Recibe ofertas que calzan con tu flota y tu agenda",
  admin: "Verificación, disputas y métricas de la plataforma",
};

/** Los dos roles con los que se puede crear cuenta (admin no se registra). */
type RolNuevo = Exclude<Rol, "admin">;

type Paso = { vista: "camino" } | { vista: "rol" } | { vista: "datos"; rol: RolNuevo };

export default function EntrarPage() {
  const [paso, setPaso] = useState<Paso>({ vista: "camino" });

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-10">
      {paso.vista === "camino" && <PasoCamino onCrear={() => setPaso({ vista: "rol" })} />}
      {paso.vista === "rol" && (
        <PasoRol
          onVolver={() => setPaso({ vista: "camino" })}
          onElegir={(rol) => setPaso({ vista: "datos", rol })}
        />
      )}
      {paso.vista === "datos" && (
        // key: cambiar de rol vuelve a montar el formulario con estado fresco.
        <PasoDatos
          key={paso.rol}
          rol={paso.rol}
          onVolver={() => setPaso({ vista: "rol" })}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Paso inicial */

function PasoCamino({ onCrear }: { onCrear: () => void }) {
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
    <>
      <header className="text-center">
        <p className="font-display text-display text-ink">Rutero</p>
        <h1 className="mt-4 font-titular text-[1.75rem] leading-tight font-bold text-ink">
          Entra a Rutero
        </h1>
        <p className="mt-2 text-sm text-meta">
          Crea tu cuenta en menos de un minuto, o continúa con la tuya.
        </p>
      </header>

      <CenefaCordillera className="h-6 text-line" />

      <Button size="lg" className="min-h-12 w-full" onClick={onCrear}>
        <UserPlus className="size-4" aria-hidden />
        Crear mi cuenta
      </Button>

      <div className="flex items-center gap-3" role="presentation">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-meta">o entra con tu cuenta</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <ul className="flex flex-col gap-3">
        {ROLES.map(({ rol, icono: Icono }) => (
          <li key={rol}>
            <Link
              href={INICIO_POR_ROL[rol]}
              className="group flex min-h-11 items-center gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-signal"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-ink">
                <Icono className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">
                  {nombreDe(rol)}
                </span>
                {/* Sin `truncate`: en celular la línea cabía a la mitad y
                    cortaba justo la frase que explica para qué sirve el
                    perfil. Que envuelva en dos líneas es mejor que perderla. */}
                <span className="block text-sm text-meta">
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
        className="mx-auto flex min-h-11 w-fit items-center gap-1.5 px-3 text-sm text-meta underline-offset-4 hover:text-ink hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al inicio
      </Link>
    </>
  );
}

/* ----------------------------------------------------------- Elegir el rol */

function PasoRol({
  onVolver,
  onElegir,
}: {
  onVolver: () => void;
  onElegir: (rol: RolNuevo) => void;
}) {
  const opciones: {
    rol: RolNuevo;
    icono: typeof Handshake;
    titulo: string;
    detalle: string;
  }[] = [
    {
      rol: "agencia",
      icono: Handshake,
      titulo: "Soy una agencia",
      detalle: "Publico viajes y contrato transporte para mis grupos",
    },
    {
      rol: "transportista",
      icono: Truck,
      titulo: "Tengo una van",
      detalle: "Respondo ofertas y lleno los días libres de mi vehículo",
    },
  ];

  return (
    <>
      <BarraPaso onVolver={onVolver} etiqueta="Paso 1 de 2" />

      <header className="text-center">
        <h1 className="font-titular text-[1.75rem] leading-tight font-bold text-ink">
          ¿Cómo vas a usar Rutero?
        </h1>
        <p className="mt-2 text-sm text-meta">
          Esto define lo que ves al entrar. No se puede elegir mal: cada rol
          tiene su propio panel.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {opciones.map(({ rol, icono: Icono, titulo, detalle }) => (
          <li key={rol}>
            <button
              type="button"
              onClick={() => onElegir(rol)}
              className="group flex w-full items-center gap-4 rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-signal"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-signal-soft text-signal-ink">
                <Icono className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-display-sm text-ink">
                  {titulo}
                </span>
                <span className="mt-0.5 block text-sm text-meta">{detalle}</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-meta transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------- Datos de la cuenta */

const COPY_DATOS: Record<
  RolNuevo,
  { titulo: string; detalle: string; despues: string }
> = {
  agencia: {
    titulo: "Los datos de tu agencia",
    detalle: "Solo lo necesario para publicar tu primer viaje.",
    despues: "El RUT, el giro y la dirección los completas después en tu perfil.",
  },
  transportista: {
    titulo: "Tus datos",
    detalle: "Solo lo necesario para empezar. Tu van y tus papeles se cargan después.",
    despues: "El RUT y tus documentos los completas después en tu perfil.",
  },
};

function PasoDatos({ rol, onVolver }: { rol: RolNuevo; onVolver: () => void }) {
  const router = useRouter();
  const crearCuentaAgencia = useRutero((s) => s.crearCuentaAgencia);
  const crearCuentaTransportista = useRutero((s) => s.crearCuentaTransportista);

  const [razonSocial, setRazonSocial] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [creando, setCreando] = useState(false);

  const copy = COPY_DATOS[rol];
  const completo =
    nombre.trim().length > 0 &&
    telefono.trim().length > 0 &&
    (rol === "transportista" || razonSocial.trim().length > 0);

  const crear = () => {
    if (!completo || creando) return;
    setCreando(true);
    if (rol === "agencia") {
      crearCuentaAgencia({
        razonSocial: razonSocial.trim(),
        nombreContacto: nombre.trim(),
        telefono: telefono.trim(),
      });
    } else {
      crearCuentaTransportista({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
      });
    }
    router.push(INICIO_POR_ROL[rol]);
  };

  return (
    <>
      <BarraPaso onVolver={onVolver} etiqueta="Paso 2 de 2" />

      <header className="text-center">
        <h1 className="font-titular text-[1.75rem] leading-tight font-bold text-ink">
          {copy.titulo}
        </h1>
        <p className="mt-2 text-sm text-meta">{copy.detalle}</p>
      </header>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          crear();
        }}
      >
        {rol === "agencia" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="razon-social">Nombre de la agencia</Label>
            <Input
              id="razon-social"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Turismo Los Andes"
              autoComplete="organization"
              autoFocus
              className="h-12"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">
            {rol === "agencia" ? "Tu nombre" : "Tu nombre o el de tu empresa"}
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={rol === "agencia" ? "Carolina Reyes" : "Pedro Sandoval"}
            autoComplete="name"
            autoFocus={rol === "transportista"}
            className="h-12"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            inputMode="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+56 9 1234 5678"
            autoComplete="tel"
            className="h-12"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="min-h-12 w-full"
          disabled={!completo || creando}
        >
          Crear cuenta y entrar
          <ArrowRight className="size-4" aria-hidden />
        </Button>

        <p className="text-center text-xs text-meta">{copy.despues}</p>
      </form>
    </>
  );
}

/* --------------------------------------------------------------- Utilitarios */

function BarraPaso({
  onVolver,
  etiqueta,
}: {
  onVolver: () => void;
  etiqueta: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onVolver}
        className="flex min-h-11 items-center gap-1.5 pr-3 text-sm text-meta hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver
      </button>
      <span className="font-mono text-xs text-meta">{etiqueta}</span>
    </div>
  );
}
