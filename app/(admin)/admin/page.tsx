"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando } from "@/components/shared/estado-lista";
import {
  FilaTarjeta,
  ListaTarjetas,
  TablaEscritorio,
} from "@/components/shared/tabla-responsiva";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { horasHastaPrimeraRespuesta } from "@/lib/mock/selectores";
import { useAhora, useDatos } from "@/lib/mock/use-datos";
import { ETIQUETA_BLOQUE, formatearCLP } from "@/lib/utils/format";
import { estadoEfectivoDocumento } from "@/lib/utils/rules";
import type { BloqueServicio } from "@/lib/mock/types";

export default function MetricasPage() {
  const { datos, cargando } = useDatos();
  const ahora = useAhora();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Admin" titulo="Métricas" />
        <ListaCargando filas={4} />
      </div>
    );
  }

  // --- Ofertas y adjudicación ---
  const publicadas = datos.ofertas.filter((o) => o.estado !== "borrador");
  const adjudicadas = datos.ofertas.filter((o) =>
    ["adjudicada", "cerrada"].includes(o.estado),
  );
  const tasaAdjudicacion =
    publicadas.length > 0
      ? Math.round((adjudicadas.length / publicadas.length) * 100)
      : 0;

  const sinRespuestas = datos.ofertas.filter(
    (o) => o.estado === "sin_respuestas" || o.estado === "expirada",
  ).length;

  // --- Tiempo hasta la primera respuesta ---
  const tiempos = publicadas
    .map((o) => horasHastaPrimeraRespuesta(datos, o.id))
    .filter((h): h is number => h !== null);
  const medianaHoras =
    tiempos.length > 0
      ? [...tiempos].sort((a, b) => a - b)[Math.floor(tiempos.length / 2)]
      : null;

  // --- GMV y comisión ---
  const gmv = datos.viajes
    .filter((v) => !v.estado.startsWith("cancelada"))
    .reduce((s, v) => s + v.montoFinal, 0);
  const gmvLiberado = datos.pagos
    .filter((p) => p.estado === "liberado")
    .reduce((s, p) => s + p.montoBruto, 0);
  const comisionGenerada = datos.pagos
    .filter((p) => p.estado === "liberado")
    .reduce((s, p) => s + p.comisionPlataforma, 0);
  const comisionReferidos = datos.referidos
    .filter((r) => r.estado === "liberada")
    .reduce((s, r) => s + r.comisionPlataforma, 0);
  const comisionPorCobrar = datos.pagos
    .filter((p) => p.estado === "retenido")
    .reduce((s, p) => s + p.comisionPlataforma, 0);

  const ticketPromedio =
    datos.viajes.length > 0 ? Math.round(gmv / datos.viajes.length) : 0;

  // --- Respuestas ---
  const aceptaciones = datos.respuestas.filter((r) => r.tipo === "aceptacion").length;
  const contraofertas = datos.respuestas.filter(
    (r) => r.tipo === "contraoferta",
  ).length;
  const respuestasPorOferta =
    publicadas.length > 0
      ? (datos.respuestas.length / publicadas.length).toFixed(1)
      : "0";

  // --- Por bloque de servicio ---
  const bloques: BloqueServicio[] = [
    "transfer",
    "medio_dia",
    "dia_completo",
    "multi_dia",
  ];
  const porBloque = bloques.map((b) => {
    const ofertas = datos.ofertas.filter((o) => o.bloqueServicio === b);
    const cerradas = ofertas.filter((o) =>
      ["adjudicada", "cerrada"].includes(o.estado),
    );
    const viajesDelBloque = datos.viajes.filter((v) => {
      const o = datos.ofertas.find((x) => x.id === v.ofertaId);
      return o?.bloqueServicio === b;
    });
    const montos = viajesDelBloque.map((v) => v.montoFinal);
    return {
      bloque: b,
      ofertas: ofertas.length,
      adjudicadas: cerradas.length,
      promedio:
        montos.length > 0
          ? Math.round(montos.reduce((s, m) => s + m, 0) / montos.length)
          : 0,
      minimo: montos.length > 0 ? Math.min(...montos) : 0,
      maximo: montos.length > 0 ? Math.max(...montos) : 0,
    };
  });

  // --- Salud operacional ---
  const docsPendientes = datos.documentos.filter(
    (d) => estadoEfectivoDocumento(d, ahora) === "pendiente",
  ).length;
  const docsVencidos = datos.documentos.filter(
    (d) => estadoEfectivoDocumento(d, ahora) === "vencido",
  ).length;
  const disputas = datos.viajes.filter((v) => v.estado === "en_disputa").length;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Admin"
        titulo="Métricas"
        descripcion="Cómo se está moviendo el marketplace. Con estos números se decide si el modelo de comisión y la ventana de cierre están bien calibrados."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="GMV"
          valor={formatearCLP(gmv)}
          detalle={`${formatearCLP(gmvLiberado)} ya liberado`}
        />
        <Metrica
          etiqueta="Comisión generada"
          valor={formatearCLP(comisionGenerada + comisionReferidos)}
          detalle={`${formatearCLP(comisionPorCobrar)} en escrow`}
          tono="go"
        />
        <Metrica
          etiqueta="Tasa de adjudicación"
          valor={`${tasaAdjudicacion}%`}
          detalle={`${adjudicadas.length} de ${publicadas.length} publicadas`}
          tono={tasaAdjudicacion >= 50 ? "go" : "signal"}
        />
        <Metrica
          etiqueta="Primera respuesta"
          valor={medianaHoras !== null ? `${medianaHoras.toFixed(1)} h` : "—"}
          detalle="Mediana desde que se publica"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="Ofertas publicadas"
          valor={publicadas.length}
          detalle={`${datos.ofertas.length - publicadas.length} en borrador`}
        />
        <Metrica
          etiqueta="Respuestas por oferta"
          valor={respuestasPorOferta}
          detalle={`${aceptaciones} al precio · ${contraofertas} contraofertas`}
        />
        <Metrica
          etiqueta="Ticket promedio"
          valor={formatearCLP(ticketPromedio)}
          detalle="Por viaje adjudicado"
        />
        <Metrica
          etiqueta="Ofertas sin cerrar"
          valor={sinRespuestas}
          detalle="Expiradas o sin respuestas"
          tono={sinRespuestas > 0 ? "stop" : "neutro"}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-display-sm text-ink">
            Precios por bloque de servicio
          </h2>
          <p className="mt-1 text-sm text-meta">
            Este es el dataset que en unos meses permite sugerir un rango por ruta
            y temporada, en vez de que cada agencia tire un precio a ciegas.
          </p>
        </div>

        {/* Seis columnas de montos no caben en un celular: cada bloque pasa a
            ser una tarjeta con el promedio destacado y el rango debajo. */}
        <ListaTarjetas>
          {porBloque.map((b) => (
            <FilaTarjeta
              key={b.bloque}
              titulo={ETIQUETA_BLOQUE[b.bloque]}
              subtitulo={`${b.ofertas} ofertas · ${b.adjudicadas} adjudicadas`}
              destacado={b.promedio > 0 ? formatearCLP(b.promedio) : "—"}
              detalleDestacado={b.promedio > 0 ? "promedio" : undefined}
              datos={[
                {
                  etiqueta: "Mínimo",
                  valor: b.minimo > 0 ? formatearCLP(b.minimo) : "—",
                },
                {
                  etiqueta: "Máximo",
                  valor: b.maximo > 0 ? formatearCLP(b.maximo) : "—",
                },
              ]}
            />
          ))}
        </ListaTarjetas>

        <TablaEscritorio>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bloque</TableHead>
                <TableHead className="text-right">Ofertas</TableHead>
                <TableHead className="text-right">Adjudicadas</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Promedio</TableHead>
                <TableHead className="text-right">Máximo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porBloque.map((b) => (
                <TableRow key={b.bloque}>
                  <TableCell className="font-medium text-ink">
                    {ETIQUETA_BLOQUE[b.bloque]}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {b.ofertas}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {b.adjudicadas}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-meta">
                    {b.minimo > 0 ? formatearCLP(b.minimo) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    {b.promedio > 0 ? formatearCLP(b.promedio) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-meta">
                    {b.maximo > 0 ? formatearCLP(b.maximo) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TablaEscritorio>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-eyebrow font-display text-meta">Cola de verificación</p>
          <p className="mt-1 font-mono text-display-sm tabular-nums text-ink">
            {docsPendientes}
          </p>
          <p className="mt-1 text-sm text-meta">
            documentos esperando revisión ·{" "}
            <span className={docsVencidos > 0 ? "text-stop" : ""}>
              {docsVencidos} vencidos
            </span>
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/admin/verificacion">
              Revisar
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-eyebrow font-display text-meta">Disputas abiertas</p>
          <p className="mt-1 font-mono text-display-sm tabular-nums text-ink">
            {disputas}
          </p>
          <p className="mt-1 text-sm text-meta">
            con el pago congelado hasta resolver
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/admin/viajes">
              Ver viajes
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-eyebrow font-display text-meta">Grupos de pasajeros</p>
          <p className="mt-1 font-mono text-display-sm tabular-nums text-ink">
            {datos.grupos.length}
          </p>
          <p className="mt-1 text-sm text-meta">
            {datos.referidos.length} adjudicados ·{" "}
            {formatearCLP(comisionReferidos)} de comisión
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/admin/comisiones">
              Configurar comisiones
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
