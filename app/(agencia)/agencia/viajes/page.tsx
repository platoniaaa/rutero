"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bus } from "lucide-react";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaViaje } from "@/components/shared/tarjeta-viaje";
import { Button } from "@/components/ui/button";
import {
  oferta as buscarOferta,
  transportista as buscarTransportista,
  vehiculo as buscarVehiculo,
  viajesDeAgencia,
} from "@/lib/mock/selectores";
import type { EstadoViaje } from "@/lib/mock/types";
import { useDatos, useSesion } from "@/lib/mock/use-datos";
import { formatearCLP } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const FILTROS: { clave: string; etiqueta: string; estados: EstadoViaje[] }[] = [
  {
    clave: "activos",
    etiqueta: "Activos",
    estados: ["confirmada", "pago_retenido", "en_curso"],
  },
  { clave: "por_confirmar", etiqueta: "Por confirmar", estados: ["finalizada"] },
  { clave: "cerrados", etiqueta: "Cerrados", estados: ["liberada"] },
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

export default function ViajesAgenciaPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const [filtro, setFiltro] = useState("todos");

  const viajes = useMemo(
    () => (cargando ? [] : viajesDeAgencia(datos, agenciaId)),
    [datos, agenciaId, cargando],
  );

  const visibles = useMemo(() => {
    if (filtro === "todos") return viajes;
    const estados = FILTROS.find((f) => f.clave === filtro)?.estados ?? [];
    return viajes.filter((v) => estados.includes(v.estado));
  }, [viajes, filtro]);

  const activos = viajes.filter((v) =>
    ["confirmada", "pago_retenido", "en_curso"].includes(v.estado),
  );
  const porPagar = viajes.filter((v) => v.estado === "confirmada");
  const comprometido = activos.reduce((s, v) => s + v.montoFinal, 0);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Viajes adjudicados"
        descripcion="Los viajes que ya tienen transportista asignado, desde el pago hasta el cierre."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Viajes activos" valor={activos.length} />
        <Metrica
          etiqueta="Esperando tu pago"
          valor={porPagar.length}
          tono={porPagar.length > 0 ? "signal" : "neutro"}
          detalle={porPagar.length > 0 ? "El escrow no se ha depositado" : undefined}
        />
        <Metrica
          etiqueta="Monto comprometido"
          valor={formatearCLP(comprometido)}
          detalle="Suma de los viajes activos"
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
              ? "Cuando adjudiques una de tus ofertas, el viaje aparece acá con su chat, la lista de embarque y el estado del pago."
              : "Prueba con otro filtro."
          }
          accion={
            filtro === "todos" ? (
              <Button asChild>
                <Link href="/agencia/ofertas">Ver mis ofertas</Link>
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
                    buscarTransportista(datos, viaje.carrierId)?.nombre ?? ""
                  }
                  href={`/agencia/viajes/${viaje.id}`}
                  montoDestacado={viaje.montoFinal}
                  etiquetaMonto="total del viaje"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
