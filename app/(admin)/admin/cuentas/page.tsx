"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando } from "@/components/shared/estado-lista";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FilaTarjeta,
  ListaTarjetas,
  TablaEscritorio,
} from "@/components/shared/tabla-responsiva";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRutero } from "@/lib/mock/store";
import {
  conductoresDe,
  documentosDelTransportista,
  flotaDe,
  resumirDocumentos,
} from "@/lib/mock/selectores";
import type { EstadoVerificacion } from "@/lib/mock/types";
import { useAhora, useDatos } from "@/lib/mock/use-datos";
import { ETIQUETA_ESTADO_VERIFICACION, formatearRut } from "@/lib/utils/format";

const ESTADOS: EstadoVerificacion[] = [
  "sin_enviar",
  "en_revision",
  "verificada",
  "rechazada",
];

/** El mismo selector sirve en la tabla de escritorio y en la tarjeta. */
function SelectorVerificacion({
  valor,
  onCambiar,
}: {
  valor: EstadoVerificacion;
  onCambiar: (estado: EstadoVerificacion) => void;
}) {
  return (
    <Select value={valor} onValueChange={(v) => onCambiar(v as EstadoVerificacion)}>
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS.map((e) => (
          <SelectItem key={e} value={e}>
            {ETIQUETA_ESTADO_VERIFICACION[e]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function InsigniaDocumentos({
  resumen,
}: {
  resumen: { vencidos: number; pendientes: number; total: number };
}) {
  if (resumen.vencidos > 0) {
    return <BadgeEstado tono="alerta">{resumen.vencidos} vencidos</BadgeEstado>;
  }
  if (resumen.pendientes > 0) {
    return (
      <BadgeEstado tono="espera">{resumen.pendientes} en revisión</BadgeEstado>
    );
  }
  if (resumen.total === 0) {
    return <BadgeEstado tono="neutro">Sin subir</BadgeEstado>;
  }
  return <BadgeEstado tono="listo">Al día</BadgeEstado>;
}

/** "1 vehículo" / "2 vehículos", sin el "1 vehículos" que delata la plantilla. */
function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function Rating({ valor }: { valor: number }) {
  if (valor <= 0) return <span className="text-meta">—</span>;
  return (
    <span className="flex items-center justify-end gap-1">
      <Star className="size-3.5 text-signal" aria-hidden />
      <span className="font-mono tabular-nums">{valor.toFixed(1)}</span>
    </span>
  );
}

export default function CuentasPage() {
  const { datos, cargando } = useDatos();
  const ahora = useAhora();
  const actualizarVerificacion = useRutero((s) => s.actualizarVerificacion);
  const [tab, setTab] = useState("transportistas");

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Admin" titulo="Cuentas" />
        <ListaCargando filas={5} />
      </div>
    );
  }

  const verificados = datos.transportistas.filter(
    (t) => t.estadoVerificacion === "verificada",
  ).length;
  const enRevision = [...datos.transportistas, ...datos.agencias].filter(
    (c) => c.estadoVerificacion === "en_revision",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        seccion="Admin"
        titulo="Cuentas"
        descripcion="Agencias y transportistas registrados, con su estado de verificación y sus papeles."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Metrica etiqueta="Agencias" valor={datos.agencias.length} />
        <Metrica etiqueta="Transportistas" valor={datos.transportistas.length} />
        <Metrica etiqueta="Verificados" valor={verificados} tono="go" />
        <Metrica
          etiqueta="En revisión"
          valor={enRevision}
          tono={enRevision > 0 ? "signal" : "neutro"}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transportistas" className="min-h-11">
            Transportistas
          </TabsTrigger>
          <TabsTrigger value="agencias" className="min-h-11">
            Agencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transportistas" className="mt-4">
          {/* En celular la tabla medía 1.054px y había que deslizarla de lado:
              cada fila pasa a ser una tarjeta. */}
          <ListaTarjetas>
            {datos.transportistas.map((t) => {
              const resumen = resumirDocumentos(
                documentosDelTransportista(datos, t.id),
                ahora,
              );
              return (
                <FilaTarjeta
                  key={t.id}
                  titulo={t.nombre}
                  subtitulo={`${t.esEmpresa ? "Empresa" : "Independiente"} · ${plural(t.viajesCompletados, "viaje", "viajes")}`}
                  destacado={<Rating valor={t.ratingPromedio} />}
                  datos={[
                    { etiqueta: "RUT", valor: formatearRut(t.rut) },
                    { etiqueta: "Zonas", valor: t.zonasOperacion.join(", ") },
                    {
                      etiqueta: "Flota",
                      valor: `${plural(flotaDe(datos, t.id).length, "vehículo", "vehículos")} · ${plural(conductoresDe(datos, t.id).length, "conductor", "conductores")}`,
                    },
                    {
                      etiqueta: "Documentos",
                      valor: <InsigniaDocumentos resumen={resumen} />,
                    },
                  ]}
                  pie={
                    <SelectorVerificacion
                      valor={t.estadoVerificacion}
                      onCambiar={(estado) => {
                        actualizarVerificacion("transportista", t.id, estado);
                        toast.success(
                          `${t.nombre}: ${ETIQUETA_ESTADO_VERIFICACION[estado].toLowerCase()}`,
                        );
                      }}
                    />
                  }
                />
              );
            })}
          </ListaTarjetas>

          <TablaEscritorio>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transportista</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Zonas</TableHead>
                  <TableHead className="text-right">Flota</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Verificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.transportistas.map((t) => {
                  const resumen = resumirDocumentos(
                    documentosDelTransportista(datos, t.id),
                    ahora,
                  );
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-medium text-ink">{t.nombre}</p>
                        <p className="text-xs text-meta">
                          {t.esEmpresa ? "Empresa" : "Independiente"} ·{" "}
                          <span className="font-mono tabular-nums">
                            {t.viajesCompletados}
                          </span>{" "}
                          viajes
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        {formatearRut(t.rut)}
                      </TableCell>
                      <TableCell className="text-sm text-meta">
                        {t.zonasOperacion.join(", ")}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {flotaDe(datos, t.id).length}v ·{" "}
                        {conductoresDe(datos, t.id).length}c
                      </TableCell>
                      <TableCell className="text-right">
                        <Rating valor={t.ratingPromedio} />
                      </TableCell>
                      <TableCell>
                        <InsigniaDocumentos resumen={resumen} />
                      </TableCell>
                      <TableCell>
                        <SelectorVerificacion
                          valor={t.estadoVerificacion}
                          onCambiar={(estado) => {
                            actualizarVerificacion("transportista", t.id, estado);
                            toast.success(
                              `${t.nombre}: ${ETIQUETA_ESTADO_VERIFICACION[estado].toLowerCase()}`,
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TablaEscritorio>
        </TabsContent>

        <TabsContent value="agencias" className="mt-4">
          <ListaTarjetas>
            {datos.agencias.map((a) => (
              <FilaTarjeta
                key={a.id}
                titulo={a.razonSocial}
                subtitulo={a.contacto.nombre}
                destacado={<Rating valor={a.ratingPromedio} />}
                datos={[
                  { etiqueta: "RUT", valor: formatearRut(a.rut) },
                  { etiqueta: "Giro", valor: a.giro },
                  { etiqueta: "Viajes", valor: a.viajesCompletados },
                ]}
                pie={
                  <SelectorVerificacion
                    valor={a.estadoVerificacion}
                    onCambiar={(estado) => {
                      actualizarVerificacion("agencia", a.id, estado);
                      toast.success(
                        `${a.razonSocial}: ${ETIQUETA_ESTADO_VERIFICACION[estado].toLowerCase()}`,
                      );
                    }}
                  />
                }
              />
            ))}
          </ListaTarjetas>

          <TablaEscritorio>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agencia</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Giro</TableHead>
                  <TableHead className="text-right">Viajes</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead>Verificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.agencias.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-ink">{a.razonSocial}</p>
                      <p className="text-xs text-meta">{a.contacto.nombre}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatearRut(a.rut)}
                    </TableCell>
                    <TableCell className="max-w-56 text-sm text-meta">
                      {a.giro}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {a.viajesCompletados}
                    </TableCell>
                    <TableCell className="text-right">
                      <Rating valor={a.ratingPromedio} />
                    </TableCell>
                    <TableCell>
                      <SelectorVerificacion
                        valor={a.estadoVerificacion}
                        onCambiar={(estado) => {
                          actualizarVerificacion("agencia", a.id, estado);
                          toast.success(
                            `${a.razonSocial}: ${ETIQUETA_ESTADO_VERIFICACION[estado].toLowerCase()}`,
                          );
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TablaEscritorio>
        </TabsContent>
      </Tabs>
    </div>
  );
}
