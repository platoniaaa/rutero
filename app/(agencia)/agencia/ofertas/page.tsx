"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { WizardOferta } from "@/components/agencia/wizard-oferta";
import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import {
  ListaCargando,
  ListaVacia,
} from "@/components/shared/estado-lista";
import { TarjetaOferta } from "@/components/shared/tarjeta-oferta";
import { Button } from "@/components/ui/button";
import { ofertasDeAgencia, respuestasActivasDeOferta } from "@/lib/mock/selectores";
import type { EstadoOferta } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { cn } from "@/lib/utils";

/** Los ocho estados agrupados en los cuatro filtros que la agencia usa. */
const FILTROS: { clave: string; etiqueta: string; estados: EstadoOferta[] }[] = [
  {
    clave: "abiertas",
    etiqueta: "Abiertas",
    estados: ["publicada", "con_respuestas"],
  },
  { clave: "borradores", etiqueta: "Borradores", estados: ["borrador"] },
  {
    clave: "adjudicadas",
    etiqueta: "Adjudicadas",
    estados: ["adjudicada", "cerrada"],
  },
  {
    clave: "caidas",
    etiqueta: "Expiradas y canceladas",
    estados: ["expirada", "sin_respuestas", "cancelada"],
  },
];

export default function MisOfertasPage() {
  const { datos, cargando } = useDatos();
  const { agenciaId } = useSesion();
  const ahora = useAhora();
  const [filtro, setFiltro] = useState("todas");
  const [wizardAbierto, setWizardAbierto] = useState(false);

  const ofertas = useMemo(
    () => (cargando ? [] : ofertasDeAgencia(datos, agenciaId)),
    [datos, agenciaId, cargando],
  );

  const visibles = useMemo(() => {
    if (filtro === "todas") return ofertas;
    const estados = FILTROS.find((f) => f.clave === filtro)?.estados ?? [];
    return ofertas.filter((o) => estados.includes(o.estado));
  }, [ofertas, filtro]);

  const conteo = (estados: EstadoOferta[]) =>
    ofertas.filter((o) => estados.includes(o.estado)).length;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Agencia"
        titulo="Mis ofertas"
        descripcion="Todo lo que has publicado, desde el borrador hasta el viaje cerrado."
        acciones={
          <Button onClick={() => setWizardAbierto(true)}>
            <Plus className="size-4" aria-hidden />
            Nueva oferta
          </Button>
        }
      />

      <div
        role="group"
        aria-label="Filtrar por estado"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={filtro === "todas"}
          onClick={() => setFiltro("todas")}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            filtro === "todas"
              ? "border-ink bg-ink text-white"
              : "border-line text-ink hover:border-meta",
          )}
        >
          Todas
          <span className="font-mono text-xs tabular-nums opacity-70">
            {ofertas.length}
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
              {conteo(f.estados)}
            </span>
          </button>
        ))}
      </div>

      {cargando ? (
        <ListaCargando filas={4} />
      ) : visibles.length === 0 ? (
        filtro === "todas" ? (
          <ListaVacia
            icono={ClipboardList}
            titulo="Todavía no publicas ninguna oferta"
            detalle="Publica tu primera oferta de viaje y los transportistas de la zona la ven al instante. Suben un 40% las respuestas cuando el presupuesto referencial está a precio de mercado."
            accion={
              <Button onClick={() => setWizardAbierto(true)}>
                Publicar la primera
              </Button>
            }
          />
        ) : (
          <ListaVacia
            titulo="Nada en este filtro"
            detalle="Prueba con otro estado o publica una oferta nueva."
          />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {visibles.map((oferta) => {
            const respuestas = respuestasActivasDeOferta(datos, oferta.id).length;
            return (
              <li key={oferta.id}>
                <Link
                  href={`/agencia/ofertas/${oferta.id}`}
                  className="block rounded-lg outline-offset-2 transition-shadow hover:shadow-md"
                >
                  <TarjetaOferta
                    oferta={oferta}
                    ahora={ahora}
                    pie={
                      respuestas > 0 ? (
                        <p className="text-sm text-ink">
                          <span className="font-mono font-medium tabular-nums">
                            {respuestas}
                          </span>{" "}
                          {respuestas === 1
                            ? "respuesta esperando revisión"
                            : "respuestas esperando revisión"}
                        </p>
                      ) : undefined
                    }
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <WizardOferta
        abierto={wizardAbierto}
        onAbrirCambio={setWizardAbierto}
        agenciaId={agenciaId}
      />
    </div>
  );
}
