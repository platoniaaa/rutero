import type { Metadata } from "next";

import { BadgeEstado } from "@/components/shared/badge-estado";
import { PlacaPatente } from "@/components/shared/placa-patente";
import { TarjetaVehiculo } from "@/components/shared/tarjeta-vehiculo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Guía de estilos · Rutero",
};

const PALETA = [
  { nombre: "base", valor: "#0F1720", uso: "Superficies oscuras: nav, paneles" },
  { nombre: "surface", valor: "#FFFFFF", uso: "Tablas y formularios" },
  { nombre: "ink", valor: "#1A2430", uso: "Texto principal" },
  { nombre: "signal", valor: "#F2A413", uso: "Acción primaria" },
  { nombre: "go", valor: "#12A594", uso: "Confirmado, pago liberado" },
  { nombre: "stop", valor: "#D9432F", uso: "Vencido, cancelado, disputa" },
  { nombre: "meta", valor: "#6B7A8C", uso: "Metadata" },
];

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-display-sm text-ink">{titulo}</h2>
        {descripcion && <p className="mt-1 text-sm text-meta">{descripcion}</p>}
      </div>
      {children}
      <Separator />
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <div className="flex flex-col gap-10 pb-10">
      <header>
        <p className="text-eyebrow font-display text-meta">Sistema de diseño</p>
        <h1 className="font-display text-display-lg text-ink">Guía de estilos</h1>
        <p className="mt-2 max-w-2xl text-sm text-meta">
          Herramienta de trabajo operacional, no una app de viajes bonita. La
          referencia es un despacho de flota: densa donde hay que comparar,
          legible bajo el sol, con targets de toque grandes.
        </p>
      </header>

      <Seccion titulo="Paleta" descripcion="Sección 11 de SPEC.md.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PALETA.map((color) => (
            <li
              key={color.nombre}
              className="overflow-hidden rounded-lg border border-line"
            >
              <div
                className="h-16 w-full border-b border-line"
                style={{ backgroundColor: color.valor }}
              />
              <div className="p-3">
                <p className="font-mono text-sm font-medium">{color.nombre}</p>
                <p className="font-mono text-xs text-meta">{color.valor}</p>
                <p className="mt-1 text-xs text-meta">{color.uso}</p>
              </div>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion
        titulo="Tipografía"
        descripcion="Archivo condensada para rotulación, Inter para interfaz, JetBrains Mono para datos."
      >
        <div className="flex flex-col gap-4 rounded-lg border border-line p-5">
          <div>
            <p className="text-eyebrow font-display text-meta">
              display-lg · Archivo
            </p>
            <p className="font-display text-display-lg text-ink">
              Adjudicar viaje
            </p>
          </div>
          <div>
            <p className="text-eyebrow font-display text-meta">
              display · Archivo
            </p>
            <p className="font-display text-display text-ink">Bandeja de respuestas</p>
          </div>
          <div>
            <p className="text-eyebrow font-display text-meta">
              display-sm · Archivo
            </p>
            <p className="font-display text-display-sm text-ink">
              Flota y agenda
            </p>
          </div>
          <div>
            <p className="text-eyebrow font-display text-meta">cuerpo · Inter</p>
            <p className="max-w-2xl text-ink">
              La agencia publica con un presupuesto referencial. El transportista
              puede aceptar al precio publicado o contraofertar con su monto y una
              nota.
            </p>
          </div>
          <div>
            <p className="text-eyebrow font-display text-meta">
              datos · JetBrains Mono, tabular
            </p>
            <p className="font-mono text-lg tabular-nums text-ink">
              $280.000 · $18.700/pax · BCDF·12
            </p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Adjudicar</Button>
          <Button variant="secondary">Contraofertar</Button>
          <Button variant="outline">Ver detalle</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="destructive">Abrir disputa</Button>
          <Button variant="link">Volver al feed</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button size="default">Normal</Button>
          <Button size="lg">Grande</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Seccion>

      <Seccion
        titulo="Badges de estado"
        descripcion="El mapeo de cada estado del negocio a su tono llega con los tipos."
      >
        <div className="flex flex-wrap items-center gap-2">
          <BadgeEstado tono="neutro">Borrador</BadgeEstado>
          <BadgeEstado tono="espera">Publicada</BadgeEstado>
          <BadgeEstado tono="activo">Con respuestas</BadgeEstado>
          <BadgeEstado tono="activo">Pago retenido</BadgeEstado>
          <BadgeEstado tono="listo">Adjudicada</BadgeEstado>
          <BadgeEstado tono="listo">Pago liberado</BadgeEstado>
          <BadgeEstado tono="alerta">Vencida</BadgeEstado>
          <BadgeEstado tono="alerta">En disputa</BadgeEstado>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>shadcn default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>
        </div>
      </Seccion>

      <Seccion titulo="Formularios">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-origen">Origen</Label>
            <Input id="sg-origen" placeholder="Santiago, Providencia" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-destino">Destino</Label>
            <Input id="sg-destino" placeholder="Valle Nevado" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-monto">Presupuesto referencial</Label>
            <Input
              id="sg-monto"
              className="font-mono tabular-nums"
              defaultValue="$280.000"
            />
            <p className="text-xs text-meta">≈ $18.700/pax con 15 pasajeros</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-error">Cantidad de pasajeros</Label>
            <Input
              id="sg-error"
              aria-invalid
              defaultValue="22"
              className="font-mono tabular-nums"
            />
            <p className="text-xs text-stop">
              La van seleccionada lleva hasta 15. Elige otro vehículo o divide el
              grupo.
            </p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Tarjetas">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-display-sm">
                Santiago → Valle Nevado
              </CardTitle>
              <CardDescription>
                Día completo · sáb 14 mar, 08:30 · 15 pasajeros
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="font-mono text-2xl tabular-nums">$280.000</p>
              <p className="text-sm text-meta">≈ $18.700 por pasajero</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Aceptar al precio</Button>
              <Button variant="outline">Contraofertar</Button>
            </CardFooter>
          </Card>

          <div className="surface-dark flex flex-col justify-between gap-3 rounded-lg bg-base p-5">
            <div>
              <p className="text-eyebrow font-display text-signal">
                Superficie oscura
              </p>
              <p className="font-display text-display-sm text-white">
                Próximo pago
              </p>
            </div>
            <p className="font-mono text-display tabular-nums text-white">
              $266.000
            </p>
            <p className="text-sm text-white/60">
              Se libera 24 h después de finalizado el viaje.
            </p>
            <div className="flex gap-2">
              <Button>Ver desglose</Button>
              <Button variant="outline">Historial</Button>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Placa patente"
        descripcion="Elemento firma: bloque mono, borde grueso, patente en grande."
      >
        <div className="flex flex-wrap items-end gap-4">
          <PlacaPatente patente="BCDF12" tamano="sm" />
          <PlacaPatente patente="JKLP34" />
          <PlacaPatente patente="RSTV56" tamano="lg" />
          <PlacaPatente patente="AB1234" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TarjetaVehiculo
            vehiculo={{
              patente: "BCDF12",
              marca: "Mercedes-Benz",
              modelo: "Sprinter 516",
              anio: 2021,
              tipo: "Sprinter",
              capacidadPasajeros: 19,
              capacidadEquipaje: 19,
              equipamiento: ["Aire acondicionado", "Portaequipaje", "WiFi"],
            }}
          />
          <TarjetaVehiculo
            vehiculo={{
              patente: "JKLP34",
              marca: "Hyundai",
              modelo: "H1",
              anio: 2019,
              tipo: "Van",
              capacidadPasajeros: 11,
              capacidadEquipaje: 8,
              equipamiento: ["Aire acondicionado", "Cadenas"],
            }}
          />
        </div>
      </Seccion>

      <Seccion
        titulo="Tabla comparativa"
        descripcion="Los montos se alinean en la coma con tabular-nums."
      >
        <div className="overflow-x-auto rounded-lg border border-line">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transportista</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Por pasajero</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Transportes Cordillera</TableCell>
                <TableCell>
                  <PlacaPatente patente="BCDF12" tamano="sm" />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $280.000
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $18.667
                </TableCell>
                <TableCell>
                  <BadgeEstado tono="listo">Aceptación</BadgeEstado>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vans del Maipo</TableCell>
                <TableCell>
                  <PlacaPatente patente="JKLP34" tamano="sm" />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $305.000
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $20.333
                </TableCell>
                <TableCell>
                  <BadgeEstado tono="activo">Contraoferta</BadgeEstado>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Andes Transfer</TableCell>
                <TableCell>
                  <PlacaPatente patente="RSTV56" tamano="sm" />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $1.240.000
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  $82.667
                </TableCell>
                <TableCell>
                  <BadgeEstado tono="alerta">Retirada</BadgeEstado>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Seccion>
    </div>
  );
}
