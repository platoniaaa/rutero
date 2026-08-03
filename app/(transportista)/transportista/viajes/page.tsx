"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bus } from "lucide-react";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaViaje } from "@/components/shared/tarjeta-viaje";
import { Button } from "@/components/ui/button";
import {
  agencia as buscarAgencia,
  oferta as buscarOferta,
  vehiculo as buscarVehiculo,
  viajesDeCarrier,
} from "@/lib/mock/selectores";
import type { EstadoViaje } from "@/lib/mock/types";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearCLP } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const FILTROS: { clave: string; etiqueta: string; estados: EstadoViaje[] }[] = [
  {
    clave: "proximos",
    etiqueta: "Próximos",
    estados: ["confirmada", "pago_retenido"],
  },
  { clave: "en_curso", etiqueta: "En curso", estados: ["en_curso"] },
  {
    clave: "cerrados",
    etiqueta: "Finalizados",
    estados: ["finalizada", "liberada"],
  },
  {
    clave: "problemas",
    etiqueta: "Cancelados y disputas",
    estados: [
      "cancelada_agencia",
      "cancelada_transportista",
      "no_show",
      "en_disputa",
    ],
  },
];

export default function ViajesTransportistaPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const [filtro, setFiltro] = useState("todos");

  const viajes = useMemo(
    () => (cargando ? [] : viajesDeCarrier(datos, carrierId)),
    [datos, carrierId, cargando],
  );

  const visibles = useMemo(() => {
    if (filtro === "todos") return viajes;
    const estados = FILTROS.find((f) => f.clave === filtro)?.estados ?? [];
    return viajes.filter((v) => estados.includes(v.estado));
  }, [viajes, filtro]);

  const proximos = viajes.filter((v) =>
    ["confirmada", "pago_retenido"].includes(v.estado),
  );
  const porCobrar = viajes.filter((v) =>
    ["pago_retenido", "en_curso", "finalizada"].includes(v.estado),
  );
  const enEscrow = porCobrar.reduce((s, v) => s + v.montoTransportista, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Mis viajes"
        descripcion="Los viajes que te adjudicaron, con su hoja de ruta y el chat con la agencia."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Viajes próximos" valor={proximos.length} />
        <Metrica
          etiqueta="Retenido en escrow"
          valor={formatearCLP(enEscrow)}
          detalle="Neto que vas a recibir"
          tono="signal"
        />
        <Metrica
          etiqueta="Viajes completados"
          valor={viajes.filter((v) => v.estado === "liberada").length}
          tono="go"
        />
      </div>

      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filtro === "todos"}
          onClick={() => setFiltro("todos")}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            filtro === "todos"
              ? "border-ink bg-ink text-white"
              : "border-line text-ink hover:border-meta",
          )}
        >
          Todos
          <span className="font-mono text-xs tabular-nums opacity-70">
            {viajes.length}
          </span>
        </button>
        {FILTROS.map((f) => (
          <button
            key={f.clave}
            type="button"
            aria-pressed={filtro === f.clave}
            onClick={() => setFiltro(f.clave)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              filtro === f.clave
                ? "border-ink bg-ink text-white"
                : "border-line text-ink hover:border-meta",
            )}
          >
            {f.etiqueta}
            <span className="font-mono text-xs tabular-nums opacity-70">
              {viajes.filter((v) => f.estados.includes(v.estado)).length}
            </span>
          </button>
        ))}
      </div>

      {cargando ? (
        <ListaCargando filas={3} />
      ) : visibles.length === 0 ? (
        <ListaVacia
          icono={Bus}
          titulo={
            filtro === "todos"
              ? "Todavía no tienes viajes adjudicados"
              : "Nada en este filtro"
          }
          detalle={
            filtro === "todos"
              ? "Responde ofertas del feed. Cuando una agencia te adjudique, el viaje aparece acá con su hoja de ruta imprimible."
              : "Prueba con otro filtro."
          }
          accion={
            filtro === "todos" ? (
              <Button asChild>
                <Link href="/transportista/ofertas">Ver el feed de ofertas</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visibles.map((viaje) => {
            const oferta = buscarOferta(datos, viaje.ofertaId);
            if (!oferta) return null;
            return (
              <li key={viaje.id}>
                <TarjetaViaje
                  viaje={viaje}
                  oferta={oferta}
                  vehiculo={buscarVehiculo(datos, viaje.vehiculoId)}
                  contraparte={
                    buscarAgencia(datos, viaje.agenciaId)?.razonSocial ?? ""
                  }
                  href={`/transportista/viajes/${viaje.id}`}
                  montoDestacado={viaje.montoTransportista}
                  etiquetaMonto="recibes tú"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
