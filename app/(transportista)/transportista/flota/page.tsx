"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Bus,
  IdCard,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { EncabezadoPagina, Metrica } from "@/components/shared/encabezado-pagina";
import { ListaCargando, ListaError, ListaVacia } from "@/components/shared/estado-lista";
import { PlacaPatente } from "@/components/shared/placa-patente";
import { CalendarioBloqueos } from "@/components/transportista/calendario-bloqueos";
import { DialogoConductor } from "@/components/transportista/dialogo-conductor";
import { DialogoVehiculo } from "@/components/transportista/dialogo-vehiculo";
import { PanelDocumentos } from "@/components/transportista/panel-documentos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DOCS_CONDUCTOR,
  DOCS_CUENTA,
  docsDeVehiculo,
} from "@/lib/documentos-requeridos";
import { useRutero } from "@/lib/mock/store";
import {
  conductoresDe,
  documentosDe,
  documentosDelTransportista,
  bloqueosDe,
  flotaDe,
  resumirDocumentos,
  transportista as buscarTransportista,
} from "@/lib/mock/selectores";
import type { Conductor, Vehiculo } from "@/lib/mock/types";
import { useAhora, useDatos, useSesion } from "@/lib/mock/use-datos";
import { ENCUADRE_TIPO, FOTO_TIPO_VEHICULO } from "@/lib/ui/fotos";
import { cn } from "@/lib/utils";
import {
  ETIQUETA_EQUIPAMIENTO,
  ETIQUETA_LICENCIA,
  ETIQUETA_TIPO_VEHICULO,
  formatearFechaLarga,
  formatearPatente,
  formatearRut,
  formatearTelefono,
} from "@/lib/utils/format";
import { licenciaCubreCapacidad, vigenciaDocumento } from "@/lib/utils/rules";

function FichaVehiculo({
  vehiculo,
  onEditar,
  onEliminar,
  puedeEliminar,
  ahora,
}: {
  vehiculo: Vehiculo;
  onEditar: () => void;
  onEliminar: () => void;
  puedeEliminar: boolean;
  ahora: Date;
}) {
  const { datos } = useDatos();
  const documentos = documentosDe(datos, vehiculo.id);
  const resumen = resumirDocumentos(documentos, ahora);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {/* Foto genérica del tipo de vehículo: la ficha deja de ser puro
            texto. La placa sobre la foto ancla la identidad del vehículo. */}
        <div className="relative aspect-[16/6] bg-muted">
          <Image
            src={FOTO_TIPO_VEHICULO[vehiculo.tipo]}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className={cn("object-cover", ENCUADRE_TIPO[vehiculo.tipo])}
          />
          <div className="absolute bottom-3 left-4">
            <PlacaPatente patente={vehiculo.patente} tamano="lg" />
          </div>
        </div>

      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-display-sm text-ink">
              {vehiculo.marca} {vehiculo.modelo}
            </h3>
            <p className="mt-1 text-sm text-meta">
              {ETIQUETA_TIPO_VEHICULO[vehiculo.tipo]} · {vehiculo.anio} ·{" "}
              <span className="font-mono tabular-nums">
                {vehiculo.capacidadPasajeros}
              </span>{" "}
              pasajeros ·{" "}
              <span className="font-mono tabular-nums">
                {vehiculo.capacidadEquipaje}
              </span>{" "}
              maletas
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {vehiculo.equipamiento.map((equipo) => (
                <li
                  key={equipo}
                  className="rounded border border-line bg-muted px-2 py-0.5 text-xs text-ink"
                >
                  {ETIQUETA_EQUIPAMIENTO[equipo]}
                </li>
              ))}
              {vehiculo.interurbano && (
                <li className="rounded border border-line bg-muted px-2 py-0.5 text-xs text-ink">
                  Interurbano
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {resumen.vencidos > 0 ? (
            <BadgeEstado tono="alerta">
              <AlertTriangle className="size-3.5" aria-hidden />
              {resumen.vencidos} sin vigencia
            </BadgeEstado>
          ) : resumen.porVencer > 0 ? (
            <BadgeEstado tono="activo">{resumen.porVencer} por vencer</BadgeEstado>
          ) : resumen.pendientes > 0 ? (
            <BadgeEstado tono="espera">{resumen.pendientes} en revisión</BadgeEstado>
          ) : (
            <BadgeEstado tono="listo">Papeles al día</BadgeEstado>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEditar}>
              <Pencil className="size-4" aria-hidden />
              Editar
            </Button>
            {puedeEliminar && (
              <Button variant="ghost" size="sm" onClick={onEliminar}>
                <Trash2 className="size-4" aria-hidden />
                Quitar
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>

      <PanelDocumentos
        titulo="Documentos del vehículo"
        propietarioId={vehiculo.id}
        tipos={docsDeVehiculo(vehiculo.interurbano)}
        documentos={documentos}
        interurbano={vehiculo.interurbano}
        ahora={ahora}
      />
    </div>
  );
}

function FichaConductor({
  conductor,
  flota,
  onEditar,
  onEliminar,
  puedeEliminar,
  ahora,
}: {
  conductor: Conductor;
  flota: Vehiculo[];
  onEditar: () => void;
  onEliminar: () => void;
  puedeEliminar: boolean;
  ahora: Date;
}) {
  const { datos } = useDatos();
  const documentos = documentosDe(datos, conductor.id);
  const licenciaVencida =
    new Date(conductor.licenciaVencimiento).getTime() < ahora.getTime();

  const noPuedeManejar = flota.filter(
    (v) => !licenciaCubreCapacidad(conductor.licenciaClase, v.capacidadPasajeros),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-line bg-surface p-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-meta">
            <UserRound className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-display-sm text-ink">
              {conductor.nombre}
            </h3>
            <p className="mt-1 font-mono text-sm tabular-nums text-meta">
              {formatearRut(conductor.rut)} · {formatearTelefono(conductor.telefono)}
            </p>
            <p className="mt-2 text-sm text-ink">
              {ETIQUETA_LICENCIA[conductor.licenciaClase]}
            </p>
            <p className="mt-0.5 text-sm text-meta">
              {licenciaVencida ? "Venció el" : "Vence el"}{" "}
              {formatearFechaLarga(conductor.licenciaVencimiento)}
            </p>
            {conductor.idiomas.length > 0 && (
              <p className="mt-2 text-sm text-meta">
                Idiomas: {conductor.idiomas.join(", ")}
              </p>
            )}
            {noPuedeManejar.length > 0 && (
              <p className="mt-2 max-w-lg text-sm text-stop">
                Con licencia {conductor.licenciaClase} no puede manejar{" "}
                {noPuedeManejar
                  .map((v) => formatearPatente(v.patente))
                  .join(", ")}
                : superan los 17 asientos.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {licenciaVencida ? (
            <BadgeEstado tono="alerta">
              <AlertTriangle className="size-3.5" aria-hidden />
              Licencia vencida
            </BadgeEstado>
          ) : (
            <BadgeEstado tono="listo">Habilitado</BadgeEstado>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEditar}>
              <Pencil className="size-4" aria-hidden />
              Editar
            </Button>
            {puedeEliminar && (
              <Button variant="ghost" size="sm" onClick={onEliminar}>
                <Trash2 className="size-4" aria-hidden />
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>

      <PanelDocumentos
        titulo="Documentos del conductor"
        propietarioId={conductor.id}
        tipos={DOCS_CONDUCTOR}
        documentos={documentos}
        ahora={ahora}
      />
    </div>
  );
}

export default function FlotaPage() {
  const { datos, cargando } = useDatos();
  const { carrierId } = useSesion();
  const ahora = useAhora();
  const eliminarVehiculo = useRutero((s) => s.eliminarVehiculo);
  const eliminarConductor = useRutero((s) => s.eliminarConductor);

  const [dialogoVehiculo, setDialogoVehiculo] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState<Vehiculo | undefined>();
  const [dialogoConductor, setDialogoConductor] = useState(false);
  const [conductorEditando, setConductorEditando] = useState<Conductor | undefined>();
  const [porEliminar, setPorEliminar] = useState<
    { tipo: "vehiculo" | "conductor"; id: string; nombre: string } | undefined
  >();

  if (cargando) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Flota y agenda" />
        <ListaCargando filas={3} />
      </div>
    );
  }

  const cuenta = buscarTransportista(datos, carrierId);
  if (!cuenta) {
    return (
      <div className="flex flex-col gap-6">
        <EncabezadoPagina seccion="Transportista" titulo="Flota y agenda" />
        <ListaError titulo="No encontramos tu cuenta" />
      </div>
    );
  }

  const flota = flotaDe(datos, carrierId);
  const conductores = conductoresDe(datos, carrierId);
  const docsCuenta = documentosDe(datos, carrierId);
  const resumenTotal = resumirDocumentos(
    documentosDelTransportista(datos, carrierId),
    ahora,
  );

  // La gestión de flota se muestra simple con un vehículo y se expande al
  // agregar el segundo.
  const flotaSimple = flota.length <= 1;
  const equipoSimple = conductores.length <= 1;

  const proximoVencimiento = documentosDelTransportista(datos, carrierId)
    .filter(
      (d) =>
        d.fechaVencimiento && vigenciaDocumento(d, ahora) === "por_vencer",
    )
    .sort((a, b) => a.fechaVencimiento!.localeCompare(b.fechaVencimiento!))[0];

  return (
    <div className="flex flex-col gap-8">
      <EncabezadoPagina
        seccion="Transportista"
        titulo="Flota y agenda"
        descripcion={
          cuenta.esEmpresa
            ? "Tus vehículos, conductores y documentos, y las franjas en que la flota está ocupada con recorridos propios."
            : "Tu vehículo, tus documentos y las franjas en que estás ocupado con recorridos propios."
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Metrica
          etiqueta={flotaSimple ? "Vehículo" : "Vehículos"}
          valor={flota.length}
          detalle={flotaSimple ? "Cuenta de un solo vehículo" : "En tu flota"}
        />
        <Metrica
          etiqueta={equipoSimple ? "Conductor" : "Conductores"}
          valor={conductores.length}
        />
        <Metrica
          etiqueta="Documentos al día"
          valor={`${resumenTotal.aprobados}/${resumenTotal.total}`}
          tono={resumenTotal.vencidos > 0 ? "stop" : "go"}
          detalle={
            resumenTotal.vencidos > 0
              ? `${resumenTotal.vencidos} sin vigencia`
              : "Ninguno vencido"
          }
        />
        <Metrica
          etiqueta="Próximo vencimiento"
          valor={
            proximoVencimiento
              ? formatearFechaLarga(proximoVencimiento.fechaVencimiento!)
              : "—"
          }
          tono={proximoVencimiento ? "signal" : "neutro"}
          detalle={proximoVencimiento ? "Dentro de 30 días" : "Nada por vencer"}
        />
      </div>

      {resumenTotal.vencidos > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-stop/40 bg-stop-soft p-4"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-stop" aria-hidden />
          <div>
            <p className="font-medium text-ink">
              Tienes {resumenTotal.vencidos}{" "}
              {resumenTotal.vencidos === 1
                ? "documento sin vigencia"
                : "documentos sin vigencia"}
            </p>
            <p className="mt-0.5 text-sm text-ink/80">
              Mientras un documento crítico esté vencido no puedes postular a
              ofertas. Súbelo de nuevo y el admin lo revisa.
            </p>
          </div>
        </div>
      )}

      <PanelDocumentos
        titulo="Documentos de la cuenta"
        propietarioId={carrierId}
        tipos={DOCS_CUENTA}
        documentos={docsCuenta}
        ahora={ahora}
      />

      {/* --- Vehículos --- */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm text-ink">
              {flotaSimple ? "Tu vehículo" : `Tu flota (${flota.length})`}
            </h2>
            {flotaSimple && (
              <p className="mt-1 text-sm text-meta">
                Al agregar un segundo vehículo aparece la vista de flota completa.
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              setVehiculoEditando(undefined);
              setDialogoVehiculo(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Agregar vehículo
          </Button>
        </div>

        {flota.length === 0 ? (
          <ListaVacia
            icono={Bus}
            titulo="Todavía no tienes vehículos"
            detalle="Agrega tu van con su patente, capacidad y equipamiento. Sin vehículo no puedes postular a ofertas."
            accion={
              <Button onClick={() => setDialogoVehiculo(true)}>
                Agregar el primero
              </Button>
            }
          />
        ) : flotaSimple ? (
          <FichaVehiculo
            vehiculo={flota[0]}
            ahora={ahora}
            puedeEliminar={false}
            onEditar={() => {
              setVehiculoEditando(flota[0]);
              setDialogoVehiculo(true);
            }}
            onEliminar={() => undefined}
          />
        ) : (
          <Tabs defaultValue={flota[0].id}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {flota.map((v) => (
                <TabsTrigger key={v.id} value={v.id} className="min-h-11 font-mono">
                  {formatearPatente(v.patente)}
                </TabsTrigger>
              ))}
            </TabsList>
            {flota.map((v) => (
              <TabsContent key={v.id} value={v.id} className="mt-4">
                <FichaVehiculo
                  vehiculo={v}
                  ahora={ahora}
                  puedeEliminar
                  onEditar={() => {
                    setVehiculoEditando(v);
                    setDialogoVehiculo(true);
                  }}
                  onEliminar={() =>
                    setPorEliminar({
                      tipo: "vehiculo",
                      id: v.id,
                      nombre: `${formatearPatente(v.patente)} · ${v.marca} ${v.modelo}`,
                    })
                  }
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>

      <Separator />

      {/* --- Conductores --- */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm text-ink">
              {equipoSimple ? "Conductor" : `Conductores (${conductores.length})`}
            </h2>
            {equipoSimple && !cuenta.esEmpresa && (
              <p className="mt-1 text-sm text-meta">
                Si manejas tú mismo, esta es tu ficha de conductor.
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              setConductorEditando(undefined);
              setDialogoConductor(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Agregar conductor
          </Button>
        </div>

        {conductores.length === 0 ? (
          <ListaVacia
            icono={IdCard}
            titulo="Todavía no hay conductores"
            detalle="Agrega al menos uno con su licencia profesional al día. Al postular tienes que asignar un conductor específico."
            accion={
              <Button onClick={() => setDialogoConductor(true)}>
                Agregar el primero
              </Button>
            }
          />
        ) : equipoSimple ? (
          <FichaConductor
            conductor={conductores[0]}
            flota={flota}
            ahora={ahora}
            puedeEliminar={false}
            onEditar={() => {
              setConductorEditando(conductores[0]);
              setDialogoConductor(true);
            }}
            onEliminar={() => undefined}
          />
        ) : (
          <Tabs defaultValue={conductores[0].id}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {conductores.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="min-h-11">
                  {c.nombre.split(" ")[0]} {c.nombre.split(" ")[1]?.[0]}.
                </TabsTrigger>
              ))}
            </TabsList>
            {conductores.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-4">
                <FichaConductor
                  conductor={c}
                  flota={flota}
                  ahora={ahora}
                  puedeEliminar
                  onEditar={() => {
                    setConductorEditando(c);
                    setDialogoConductor(true);
                  }}
                  onEliminar={() =>
                    setPorEliminar({ tipo: "conductor", id: c.id, nombre: c.nombre })
                  }
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>

      <Separator />

      <CalendarioBloqueos
        carrierId={carrierId}
        bloqueos={bloqueosDe(datos, carrierId)}
        flota={flota}
      />

      <DialogoVehiculo
        abierto={dialogoVehiculo}
        onAbrirCambio={setDialogoVehiculo}
        carrierId={carrierId}
        vehiculo={vehiculoEditando}
      />
      <DialogoConductor
        abierto={dialogoConductor}
        onAbrirCambio={setDialogoConductor}
        carrierId={carrierId}
        conductor={conductorEditando}
      />

      <AlertDialog
        open={!!porEliminar}
        onOpenChange={(v) => !v && setPorEliminar(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-display-sm">
              ¿Quitar {porEliminar?.nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan también sus documentos. Los viajes ya adjudicados no se
              tocan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!porEliminar) return;
                if (porEliminar.tipo === "vehiculo") eliminarVehiculo(porEliminar.id);
                else eliminarConductor(porEliminar.id);
                toast.success(`${porEliminar.nombre} eliminado`);
                setPorEliminar(undefined);
              }}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
