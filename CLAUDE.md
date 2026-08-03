@AGENTS.md

# CLAUDE.md

Convenciones del proyecto **Rutero**. Lee `SPEC.md` para entender qué se está construyendo.

---

## Estado del proyecto

**Fase 1: prototipo de frontend.** No hay backend. No hay base de datos. No hay autenticación real. Todo corre con data mockeada persistida en `localStorage`.

El objetivo de esta fase es **validar flujos**, no producir código de producción. Prefiere claridad sobre abstracción: es mejor un componente explícito y algo repetido que una capa genérica que hay que descifrar.

---

## Stack

- **Next.js 16** (App Router, Turbopack por defecto) + **TypeScript** en modo estricto
- **Tailwind CSS v4** — la configuración vive en `app/globals.css`, no hay `tailwind.config.ts`
- **shadcn/ui** sobre Radix para primitivas (button, dialog, select, table, badge, sonner)
- **Zustand** con middleware `persist` para el estado mockeado
- **lucide-react** para íconos
- **date-fns** con locale `es` para fechas
- **zod** para esquemas de formularios, junto a react-hook-form

No instales nada más sin preguntar antes.

> Next.js 16 tiene cambios que rompen respecto de la 15: `params` y `searchParams` son promesas y hay que await-earlas, `cookies`/`headers`/`draftMode` son asíncronas, y `next lint` fue reemplazado por la CLI de ESLint. Ante cualquier duda de API, lee `node_modules/next/dist/docs/` antes de escribir.

---

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción — debe pasar antes de dar por listo un hito
npm run lint     # eslint
npx tsc --noEmit # chequeo de tipos
```

---

## Estructura

```
app/
  (agencia)/agencia/...              rutas del rol agencia
  (transportista)/transportista/...  rutas del rol transportista
  (admin)/admin/...                  rutas del rol admin
  styleguide/                        guía de estilos
  layout.tsx
components/
  ui/                  shadcn — no editar a mano salvo necesidad real
  shared/              compartidos entre roles
  agencia/
  transportista/
  admin/
lib/
  navegacion.ts        items de nav por rol y roles disponibles
  mock/
    fixtures/          seed data por entidad
    store.ts           store Zustand
    types.ts           tipos TypeScript de todas las entidades
  utils/
    format.ts          CLP, fechas, patentes, RUT
    rules.ts           reglas de negocio puras y testeables
```

El grupo de rutas organiza el código; el segmento que sigue es el que define la URL. `(agencia)/agencia/ofertas` sirve `/agencia/ofertas`. Sin ese segmento los tres roles colisionarían en las mismas rutas.

---

## Reglas

**Data mockeada**
- Toda la data vive en `lib/mock/`. Ningún componente define fixtures inline.
- Las mutaciones pasan por acciones del store, nunca por `setState` local que se pierda al navegar.
- Las reglas de negocio (comisión, penalidad de cancelación, validez de documentos, solapamiento de horarios) van en `lib/utils/rules.ts` como funciones puras. Cuando exista backend, se reusan tal cual.

**Tipos**
- `strict: true`. Cero `any`. Si algo no se puede tipar, `unknown` con narrowing.
- Los estados son uniones literales, no strings sueltos: `type EstadoViaje = 'borrador' | 'publicada' | ...`

**Formato chileno — no negociable**
- Montos: `$1.250.000` — punto como separador de miles, sin decimales.
- Fechas: `sáb 14 mar, 08:30`.
- Patentes: `BCDF·12` con el formato de placa chilena.
- RUT con dígito verificador y validación real del módulo 11.
- Todo el texto de interfaz en español chileno neutro. Nada de "coche", "autobús" ni "recogida".

**UI**
- **Desktop primero.** La Fase 1 se diseña y valida en pantalla de computador. El celular es una fase posterior: usa layouts fluidos y evita anchos fijos para no cerrarte puertas, pero no gastes tiempo optimizando la vista móvil todavía.
- Targets de toque mínimo 44px.
- Cada lista necesita sus tres estados: vacío, cargando y error. No los dejes para después.
- Los montos en tablas comparativas usan `tabular-nums`.
- Respeta `prefers-reduced-motion`.
- Foco de teclado visible.
- El tema oscuro no está en el alcance: `.dark` quedó desactivado a propósito en `globals.css`. Las superficies oscuras se piden con la clase `surface-dark`.

**Qué no hacer**
- No crear archivos de documentación, README ni comentarios explicativos salvo que se pidan.
- No inventar features que no están en `SPEC.md`. Si algo falta, pregunta.
- No refactorizar código de hitos anteriores sin avisar.
- No dejar `TODO` ni componentes stub sin conectar. Si una pantalla está en el hito, queda funcional.

---

## Definición de listo

Un hito está listo cuando:
1. `npm run build` pasa limpio
2. `npx tsc --noEmit` no arroja errores
3. Las pantallas del hito se recorren completas en desktop
4. Los estados vacío / cargando / error existen
5. El estado persiste al recargar la página

---

## Git

Commits convencionales en español: `feat: bandeja de respuestas de la agencia`, `fix: cálculo de comisión por tramo`.
Un commit por hito completo, no por archivo.
