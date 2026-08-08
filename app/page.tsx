import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileCheck2,
  Handshake,
  Lock,
  MessageSquare,
  Percent,
  ShieldCheck,
  Star,
  Truck,
  Users,
} from "lucide-react";

import carreteraAndes from "@/fotos/carretera-andes.jpg";
import heroVan from "@/fotos/hero-van-cordillera.jpg";
import { CenefaCordillera, PaisajeValle } from "@/components/marketing/paisajes";
import { PlacaPatente } from "@/components/shared/placa-patente";
import { Button } from "@/components/ui/button";
import { COMISION_VIAJE_PCT } from "@/lib/utils/rules";

export const metadata: Metadata = {
  title: "Rutero · Transporte de pasajeros para agencias de turismo",
  description:
    "Publica tu viaje, recibe respuestas de transportistas verificados y paga con el respaldo del escrow. Marketplace chileno de vans, minibuses y sprinters.",
};

const PASOS = [
  {
    icono: Users,
    titulo: "Publicas el viaje",
    detalle:
      "Ruta, fecha, cuántos pasajeros y tu presupuesto referencial. Te toma dos minutos y eliges si cierra en 6, 24 o 72 horas.",
  },
  {
    icono: Handshake,
    titulo: "Llegan las respuestas",
    detalle:
      "Los transportistas de la zona aceptan tu precio o contraofertan con su monto y una nota. Los comparas en una sola tabla.",
  },
  {
    icono: Lock,
    titulo: "Adjudicas y pagas al escrow",
    detalle:
      "La plata queda retenida por Rutero. Recién ahí se revelan los contactos y se abre el chat del viaje.",
  },
  {
    icono: ShieldCheck,
    titulo: "Se libera al completarse",
    detalle:
      "El viaje se ejecuta, tú confirmas y el pago se libera. Si algo falla, abres una disputa y la plata no se mueve.",
  },
];

const RESPALDO = [
  {
    icono: FileCheck2,
    titulo: "Papeles al día, revisados uno por uno",
    detalle:
      "Inscripción DS 80, permiso de circulación, revisión técnica, SOAP y licencia profesional A2 o A3. Si un documento crítico vence, el transportista no puede postular hasta renovarlo.",
  },
  {
    icono: Lock,
    titulo: "El pago no se mueve hasta que el viaje se completa",
    detalle:
      "La agencia deposita al adjudicar y Rutero retiene. Si el transportista no aparece, el reembolso es total y la oferta se reabre como urgente.",
  },
  {
    icono: Star,
    titulo: "Calificación de los dos lados, y ciega",
    detalle:
      "Ninguno ve la del otro hasta que ambos califiquen. Nadie califica bien por miedo a la represalia, y el historial no se puede llevar a otra parte.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------- Encabezado */}
      <header className="surface-dark relative z-20 bg-base">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-display-sm leading-none text-white">
              Rutero
            </span>
            <span className="text-eyebrow font-display text-signal">Chile</span>
          </span>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="#como-funciona">Cómo funciona</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="#transportistas">Para transportistas</Link>
            </Button>
            <Button asChild>
              <Link href="/entrar">
                Entrar
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-base">
        <div className="absolute inset-0 -z-10">
          {/* Foto real: una Sprinter subiendo un paso de montaña. El encuadre
              corre la van a la derecha para que no quede bajo el titular. */}
          <Image
            src={heroVan}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          {/* Vela el lado del texto lo justo para que el titular contraste y
              la van se siga viendo a la derecha. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-base via-base/80 to-base/25"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-base/45"
          />
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-display text-signal">
              Marketplace de transporte de pasajeros
            </p>
            <h1 className="mt-3 font-titular text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] font-bold text-white">
              La van que necesitas, sin cotizar a ciegas
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Publica tu viaje una vez y recibe respuestas de transportistas con
              los papeles al día. Comparas precios en una tabla, adjudicas, y el
              pago queda retenido hasta que el grupo vuelve.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/entrar">
                  Publicar un viaje
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#transportistas">
                  <Truck className="size-4" aria-hidden />
                  Tengo una van
                </Link>
              </Button>
            </div>

            {/* La comisión no va acá: el hero le habla al cliente, no al
                modelo de negocio. El 5% sigue en "Para transportistas", que
                es el público que lo paga y necesita verlo antes de sumarse. */}
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
              <div>
                <dt className="text-eyebrow font-display text-white/60">
                  Pago protegido
                </dt>
                <dd className="font-mono text-display-sm tabular-nums text-white">
                  100%
                </dd>
                <p className="text-xs text-white/60">
                  Retenido hasta que el grupo vuelve
                </p>
              </div>
              {/* Solo promesas del producto, nunca métricas de operación:
                  sin viajes reales no hay medianas ni coberturas que
                  publicar, y inventarlas cuesta la confianza que se vende. */}
              <div>
                <dt className="text-eyebrow font-display text-white/60">
                  Publicar un viaje
                </dt>
                <dd className="font-mono text-display-sm tabular-nums text-white">
                  2 min
                </dd>
                <p className="text-xs text-white/60">Ruta, fecha, pasajeros y listo</p>
              </div>
              <div>
                <dt className="text-eyebrow font-display text-white/60">
                  Alcance
                </dt>
                <dd className="font-mono text-display-sm tabular-nums text-white">
                  Todo Chile
                </dd>
                <p className="text-xs text-white/60">Vans, minibuses y buses</p>
              </div>
            </dl>
          </div>
        </div>

        <CenefaCordillera className="-mb-px block text-nieve" />
      </section>

      {/* --------------------------------------------------------- El problema */}
      <section className="bg-nieve py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-eyebrow font-display text-meta">El problema</p>
              <h2 className="mt-2 font-titular text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-bold text-ink">
                Cotizar transporte se lleva la mañana
              </h2>
              <p className="mt-4 text-meta">
                Hoy conseguir una van es llamar a tres contactos, esperar que
                contesten, y aceptar al que responde primero sin saber si tiene
                los papeles al día. Si falla el día del viaje, no hay a quién
                reclamarle.
              </p>
              <p className="mt-3 text-meta">
                Del otro lado, el furgonero tiene la van parada media semana
                porque su demanda depende de a quién conozca.
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Publicas una vez, te responden varios",
                  "Ves la patente, el modelo, los años y el rating antes de decidir",
                  "El respaldo del viaje está en la plataforma, no en la palabra",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <BadgeCheck
                      className="mt-0.5 size-5 shrink-0 text-go"
                      aria-hidden
                    />
                    <span className="text-ink">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Muestra del producto: la bandeja comparable */}
            <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div>
                  <p className="font-mono text-xs text-meta">RT-0009</p>
                  <p className="font-display text-display-sm text-ink">
                    Farellones día completo
                  </p>
                </div>
                <span className="rounded border border-signal/40 bg-signal-soft px-2 py-1 text-xs font-medium text-signal-ink">
                  4 respuestas
                </span>
              </div>

              <ul className="divide-y divide-line">
                {[
                  { n: "Transportes Cordillera", p: "CHJK15", m: "$305.000", r: "4,6", d: "15 pax" },
                  { n: "Marcela Ruiz Fuentes", p: "LPRS56", m: "$295.000", r: "4,9", d: "15 pax" },
                  { n: "Juan Carlos Miranda", p: "BCDF12", m: "$280.000", r: "4,8", d: "19 pax" },
                ].map((f) => (
                  <li
                    key={f.p}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <PlacaPatente patente={f.p} tamano="sm" />
                      <div>
                        <p className="text-sm font-medium text-ink">{f.n}</p>
                        <p className="flex items-center gap-1 text-xs text-meta">
                          <Star className="size-3 text-signal" aria-hidden />
                          <span className="font-mono tabular-nums">{f.r}</span>
                          <span>· {f.d}</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-ink">
                      {f.m}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 border-t border-line pt-3 text-xs text-meta">
                Así se ve la bandeja de respuestas. Los montos se alinean para que
                compares de un vistazo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-16 bg-surface py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-display text-meta">Cómo funciona</p>
            <h2 className="mt-2 font-titular text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-bold text-ink">
              Cuatro pasos, sin llamadas
            </h2>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((paso, i) => {
              const Icono = paso.icono;
              return (
                <li
                  key={paso.titulo}
                  className="relative flex flex-col gap-3 rounded-xl border border-line bg-nieve p-5"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-base text-signal">
                    <Icono className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-meta">
                    Paso {i + 1}
                  </span>
                  <h3 className="font-display text-display-sm text-ink">
                    {paso.titulo}
                  </h3>
                  <p className="text-sm text-meta">{paso.detalle}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ Respaldo */}
      <section className="relative isolate overflow-hidden bg-base py-16 lg:py-20">
        <div className="absolute inset-0 -z-10 opacity-25">
          <PaisajeValle />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-base via-base/85 to-base"
        />

        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-display text-signal">El respaldo</p>
            <h2 className="mt-2 font-titular text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-bold text-white">
              Papeles revisados, plata protegida, historial real
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {RESPALDO.map((r) => {
              const Icono = r.icono;
              return (
                <div
                  key={r.titulo}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-signal text-ink">
                    <Icono className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-display-sm text-white">
                    {r.titulo}
                  </h3>
                  <p className="text-sm text-white/70">{r.detalle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Para transportistas */}
      <section id="transportistas" className="scroll-mt-16 bg-nieve py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 overflow-hidden rounded-xl border border-line lg:order-1">
              {/* Una van en la Patagonia, rumbo a la cordillera: el trabajo
                  que esta sección promete. */}
              <div className="relative aspect-[3/2]">
                <Image
                  src={carreteraAndes}
                  alt="Una van avanza por una carretera con la cordillera nevada al fondo"
                  fill
                  sizes="(max-width: 1024px) 100vw, 580px"
                  className="object-cover object-[center_62%]"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-eyebrow font-display text-meta">
                Para transportistas
              </p>
              <h2 className="mt-2 font-titular text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-bold text-ink">
                Tu van deja de estar parada
              </h2>
              <p className="mt-4 text-meta">
                Da lo mismo si tienes una van o seis: es la misma cuenta. Cargas
                tu vehículo, tu licencia y tus papeles, bloqueas las horas del
                recorrido escolar, y solo te llegan los viajes que puedes tomar.
              </p>

              <ul className="mt-6 flex flex-col gap-4">
                {[
                  {
                    icono: CalendarClock,
                    t: "Tu agenda manda",
                    d: "Bloqueas el escolar de lunes a viernes y los viajes que se cruzan ni te aparecen.",
                  },
                  {
                    icono: Percent,
                    t: `${COMISION_VIAJE_PCT}% de comisión, sin letra chica`,
                    d: "Ves el bruto, la comisión y lo que recibes antes de responder.",
                  },
                  {
                    icono: MessageSquare,
                    t: "El grupo te llega armado",
                    d: "¿Tienes pasajeros pero no eres agencia? Publica el grupo y una agencia te paga comisión por el dato.",
                  },
                ].map(({ icono: Icono, t, d }) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-go-soft text-go-ink">
                      <Icono className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{t}</p>
                      <p className="text-sm text-meta">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="mt-8" asChild>
                <Link href="/entrar">
                  Ver cómo se ve para mí
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Cierre */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="rounded-2xl border border-line bg-base px-6 py-12 text-center lg:px-16">
            <h2 className="font-titular text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-bold text-white">
              Tu próximo viaje empieza acá
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Publica en dos minutos y recibe respuestas de transportistas con
              los papeles al día. Sin costo para la agencia, con el pago
              respaldado hasta que el grupo vuelve.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/entrar">
                  Publicar mi primer viaje
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#transportistas">
                  <Truck className="size-4" aria-hidden />
                  Sumar mi van
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Footer */}
      <footer className="surface-dark bg-base-deep py-10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4">
          <div>
            <p className="font-display text-display-sm text-white">Rutero</p>
            <p className="mt-1 text-sm text-white/60">
              Transporte de pasajeros para agencias de turismo en Chile.
            </p>
          </div>
          {/* `min-h-11` en cada enlace: en celular eran blancos de 20px de
              alto, menos de la mitad de lo que alcanza un pulgar. */}
          <nav className="-my-2 flex flex-wrap gap-x-6 text-sm text-white/60">
            <Link
              href="/entrar"
              className="flex min-h-11 items-center hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="#como-funciona"
              className="flex min-h-11 items-center hover:text-white"
            >
              Cómo funciona
            </Link>
            <Link
              href="#transportistas"
              className="flex min-h-11 items-center hover:text-white"
            >
              Transportistas
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
