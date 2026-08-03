"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, SlidersHorizontal } from "lucide-react";

import { EncabezadoPagina } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaVacia } from "@/components/shared/estado-lista";
import { TarjetaOferta } from "@/components/shared/tarjeta-oferta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  evaluarOfertaParaCarrier,
  ofertasAbiertas,
  respuestaDeCarrierEnOferta,
} from "@/lib/mock/selectores";
import type { BloqueServicio } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { ETIQUETA_BLOQUE, parsearMonto } from "@/lib/utils/format";
import { parseISO } from "date-fns";

const BLOQUES: BloqueServicio[] = ["transfer", "medio_dia", "dia_completo", "multi_dia"];

export default function FeedOfertasPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();

  const [zona, setZona] = useState("todas");
  const [bloque, setBloque] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [pasajerosMax, setPasajerosMax] = useState("");
  const [montoMinimoTexto, setMontoMinimoTexto] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const abiertas = useMemo(
    () => (cargando ? [] : ofertasAbiertas(datos, ahora)),
    [datos, ahora, cargando],
  );

  const zonas = useMemo(
    () => [...new Set(abiertas.map((o) => o.zona))].sort(),
    [abiertas],
  );

  const evaluadas = useMemo(
    () =>
      abiertas.map((oferta) => ({
        oferta,
        evaluacion: evaluarOfertaParaCarrier(datos, oferta.id, carrierId),
        yaRespondida: !!respuestaDeCarrierEnOferta(datos, oferta.id, carrierId),
      })),
    [abiertas, datos, carrierId],
  );

  const filtradas = useMemo(() => {
    const montoMinimo = parsearMonto(montoMinimoTexto) ?? 0;
    return evaluadas.filter(({ oferta, evaluacion }) => {
      if (zona !== "todas" && oferta.zona !== zona) return false;
      if (bloque !== "todos" && oferta.bloqueServicio !== bloque) return false;
      if (fechaDesde && parseISO(oferta.fechaHoraSalida) < new Date(`${fechaDesde}T00:00:00`)) {
        return false;
      }
      if (pasajerosMax && oferta.cantidadPasajeros > Number(pasajerosMax)) {
        return false;
      }
      if (montoMinimo > 0 && oferta.presupuestoReferencial < montoMinimo) {
        return false;
      }
      if (soloDisponibles && evaluacion.motivoAtenuada) return false;
      return true;
    });
  }, [evaluadas, zona, bloque, fechaDesde, pasajerosMax, montoMinimoTexto, soloDisponibles]);

  const hayFiltros =
    zona !== "todas" ||
    bloque !== "todos" ||
    fechaDesde !== "" ||
    pasajerosMax !== "" ||
    montoMinimoTexto !== "" ||
    soloDisponibles;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Feed de ofertas"
        descripcion="Las ofertas abiertas que calzan con tus zonas. Las atenuadas chocan con tu agenda o tu flota: el motivo está a la vista."
      />

      {/* Filtros */}
      <section
        aria-label="Filtros"
        className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-zona" className="text-xs">
            Zona
          </Label>
          <Select value={zona} onValueChange={setZona}>
            <SelectTrigger id="f-zona" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {zonas.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-bloque" className="text-xs">
            Bloque de servicio
          </Label>
          <Select value={bloque} onValueChange={setBloque}>
            <SelectTrigger id="f-bloque" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {BLOQUES.map((b) => (
                <SelectItem key={b} value={b}>
                  {ETIQUETA_BLOQUE[b]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-fecha" className="text-xs">
            Desde la fecha
          </Label>
          <Input
            id="f-fecha"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-pax" className="text-xs">
            Pasajeros hasta
          </Label>
          <Input
            id="f-pax"
            type="number"
            min={1}
            placeholder="19"
            value={pasajerosMax}
            onChange={(e) => setPasajerosMax(e.target.value)}
            className="h-8 font-mono tabular-nums"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-monto" className="text-xs">
            Monto mínimo
          </Label>
          <Input
            id="f-monto"
            inputMode="numeric"
            placeholder="200.000"
            value={montoMinimoTexto}
            onChange={(e) => setMontoMinimoTexto(e.target.value)}
            className="h-8 font-mono tabular-nums"
          />
        </div>

        <div className="flex items-end">
          <label className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
              className="size-4 accent-[#f2a413]"
            />
            Solo disponibles
          </label>
        </div>
      </section>

      {cargando ? (
        <ListaCargando filas={4} />
      ) : filtradas.length === 0 ? (
        hayFiltros ? (
          <ListaVacia
            icono={SlidersHorizontal}
            titulo="Ninguna oferta pasa estos filtros"
            detalle="Afloja algún filtro o revisa más tarde: las agencias publican durante todo el día."
          />
        ) : (
          <ListaVacia
            icono={Inbox}
            titulo="No hay ofertas abiertas en este momento"
            detalle="Cuando una agencia publique un viaje que calce con tu perfil te llega una notificación."
          />
        )
      ) : (
        <>
          <p className="text-sm text-meta" aria-live="polite">
            <span className="font-mono tabular-nums">{filtradas.length}</span>{" "}
            {filtradas.length === 1 ? "oferta" : "ofertas"}
            {hayFiltros && " con los filtros aplicados"}
          </p>
          <ul className="flex flex-col gap-3">
            {filtradas.map(({ oferta, evaluacion, yaRespondida }) => (
              <li key={oferta.id}>
                <Link
                  href={`/transportista/ofertas/${oferta.id}`}
                  className="block rounded-lg outline-offset-2 transition-shadow hover:shadow-md"
                >
                  <TarjetaOferta
                    oferta={oferta}
                    ahora={ahora}
                    mostrarEstado={false}
                    atenuada={!!evaluacion.motivoAtenuada}
                    motivoAtenuada={evaluacion.motivoAtenuada ?? undefined}
                    pie={
                      yaRespondida ? (
                        <p className="text-sm font-medium text-ink">
                          Ya respondiste esta oferta — mírala en Postulaciones
                        </p>
                      ) : undefined
                    }
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
