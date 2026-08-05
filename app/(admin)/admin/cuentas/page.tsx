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
          <div className="overflow-x-auto rounded-lg border border-line">
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
                        {t.ratingPromedio > 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            <Star className="size-3.5 text-signal" aria-hidden />
                            <span className="font-mono tabular-nums">
                              {t.ratingPromedio.toFixed(1)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-meta">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {resumen.vencidos > 0 ? (
                          <BadgeEstado tono="alerta">
                            {resumen.vencidos} vencidos
                          </BadgeEstado>
                        ) : resumen.pendientes > 0 ? (
                          <BadgeEstado tono="espera">
                            {resumen.pendientes} en revisión
                          </BadgeEstado>
                        ) : resumen.total === 0 ? (
                          <BadgeEstado tono="neutro">Sin subir</BadgeEstado>
                        ) : (
                          <BadgeEstado tono="listo">Al día</BadgeEstado>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.estadoVerificacion}
                          onValueChange={(v) => {
                            actualizarVerificacion(
                              "transportista",
                              t.id,
                              v as EstadoVerificacion,
                            );
                            toast.success(
                              `${t.nombre}: ${ETIQUETA_ESTADO_VERIFICACION[v as EstadoVerificacion].toLowerCase()}`,
                            );
                          }}
                        >
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="agencias" className="mt-4">
          <div className="overflow-x-auto rounded-lg border border-line">
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
                      <span className="flex items-center justify-end gap-1">
                        <Star className="size-3.5 text-signal" aria-hidden />
                        <span className="font-mono tabular-nums">
                          {a.ratingPromedio.toFixed(1)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.estadoVerificacion}
                        onValueChange={(v) => {
                          actualizarVerificacion(
                            "agencia",
                            a.id,
                            v as EstadoVerificacion,
                          );
                          toast.success(
                            `${a.razonSocial}: ${ETIQUETA_ESTADO_VERIFICACION[v as EstadoVerificacion].toLowerCase()}`,
                          );
                        }}
                      >
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
