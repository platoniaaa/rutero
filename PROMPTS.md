# Plan de construcción — prompts para Claude Code

## Antes de empezar

1. Crea el repo y deja `SPEC.md` y `CLAUDE.md` en la raíz.
2. Abre Claude Code en esa carpeta.
3. Primer mensaje de la sesión, siempre:

```
Lee SPEC.md y CLAUDE.md completos antes de escribir nada. Después dime en 5 líneas qué entendiste del producto y qué dudas tienes.
```

Responde sus dudas antes de seguir. Vale la pena el minuto.

**Regla de oro:** un hito por sesión. Cuando termine, ciérrala con `/clear` y abre otra. Claude Code se degrada cuando la conversación se llena de contexto viejo.

**Después de cada hito**, pégale:

```
Corre npm run build y npx tsc --noEmit. Arregla lo que salga. Después haz commit.
```

---

## Hito 0 — Base y sistema de diseño

```
Hito 0. Levanta el proyecto Next.js 15 con App Router, TypeScript estricto, Tailwind y shadcn/ui.

Implementa el sistema de diseño de la sección 11 de SPEC.md: paleta como variables CSS, las tres familias tipográficas, escala de tamaños. Crea una página /styleguide que muestre botones, badges de estado, inputs, tarjetas y la tarjeta-patente de vehículo.

Arma el shell de navegación con el switch de rol (agencia / transportista / admin) en la barra superior. Por ahora las rutas pueden estar vacías.

No construyas ninguna pantalla de producto todavía.
```

## Hito 1 — Tipos, fixtures y store

```
Hito 1. Define en lib/mock/types.ts todos los tipos de la sección 5 de SPEC.md, con los estados como uniones literales.

Crea fixtures realistas en lib/mock/fixtures/: 8 agencias, 12 transportistas (mezcla de independientes con 1 van y empresas con flota de 3 a 6), 20 vehículos con patentes chilenas válidas, 25 ofertas de viaje en distintos estados, respuestas, viajes adjudicados con historial, calificaciones y documentos con vencimientos variados (algunos vigentes, algunos por vencer, algunos vencidos).

Usa rutas chilenas reales y montos anclados a datos del rubro: día completo a Farellones/El Colorado en van de 15 pasajeros ≈ $280.000 total (≈ $18.700/pax). Escala el resto en proporción — Valle Nevado algo más por distancia, transfers de aeropuerto bastante menos, multi-día como múltiplo de jornada — y trátalos como referenciales.

Monta el store Zustand con persist en localStorage y las acciones de mutación. Implementa lib/utils/format.ts y lib/utils/rules.ts con las reglas de negocio de la sección 8 como funciones puras.

Sin UI en este hito.
```

## Hito 2 — Perfiles y flota

```
Hito 2. Construye el onboarding y perfil de ambos roles.

Agencia: datos de empresa, contacto, verificación.

Transportista: cuenta única que sirve para independiente y para empresa. Gestión de vehículos y conductores. La sección de flota se muestra simple con un vehículo y se expande al agregar el segundo.

Documentos con badge de vencimiento en verde, ámbar y rojo según la sección 7.3 de SPEC.md. La subida usa captura de cámara o galería con preview antes de confirmar — frente y dorso para el carnet de conducir — mockeada con URL local. Cubre los tipos de la sección 5: certificado DS 80 del servicio y de cada vehículo, licencia A2/A3, permiso de circulación, revisión técnica, SOAP, antecedentes. La tarjeta de vehículo usa el diseño de placa patente.

Incluye el calendario de disponibilidad: el transportista bloquea franjas recurrentes (recorrido escolar de lunes a viernes) o días puntuales, y eso alimenta la regla de postulación de la sección 8.
```

## Hito 3 — Publicar oferta y feed

```
Hito 3. Lado agencia: wizard de 3 pasos para crear oferta (ruta, fecha y bloque de servicio; pasajeros y requerimientos; precio referencial anclado al bloque, tarifa de hora extra opcional y ventana de cierre) más la lista "Mis ofertas" con filtros por estado. El presupuesto se puede ingresar como total o por pasajero, mostrando siempre la conversión al otro modo.

Lado transportista: feed de ofertas con filtros de fecha, zona, cantidad de pasajeros, monto mínimo y bloque de servicio. Las ofertas que chocan con un bloqueo de agenda se muestran atenuadas con el motivo. Vista de detalle de la oferta.

Todavía sin postulación.
```

## Hito 4 — Postulación y adjudicación

```
Hito 4. El corazón del producto.

Transportista: aceptar al precio referencial o contraofertar con monto y nota, asignando vehículo y conductor específicos. Máximo 2 contraofertas por viaje. Bloquear si hay documentos críticos vencidos o si la capacidad no alcanza. Pantalla "Mis postulaciones".

Agencia: bandeja de respuestas comparables en tabla, con monto total, equivalente por pasajero, rating, vehículo propuesto y nota. Acción de adjudicar, que rechaza automáticamente el resto. Respeta el toggle de adjudicación automática al primero.
```

## Hito 5 — Viaje, escrow y chat

```
Hito 5. Detalle del viaje adjudicado para ambos lados.

Escrow simulado: la agencia paga, el pago queda retenido, y recién ahí se revelan los datos de contacto. Muestra siempre el desglose de monto bruto, comisión y neto.

Chat del viaje, mockeado, con el aviso suave cuando se detecta un patrón de número telefónico.

Transición de estados: el transportista marca en curso y finalizado, la agencia confirma o abre disputa, el pago se libera. Código de abordaje.

Lista de embarque: la agencia carga los pasajeros del viaje (nombre, documento, teléfono, punto de recogida, observaciones) uno por uno o pegando desde una planilla. El transportista la ve en la hoja de ruta y la puede imprimir, con código de abordaje, ruta, patente, conductor y nómina numerada con casilla para marcar presente.

Cancelaciones con las reglas de penalidad de la sección 8.
```

## Hito 6 — Billetera y calificaciones

```
Hito 6. Billetera del transportista: retenido, liberado, historial de liquidaciones. Pantalla de pagos de la agencia.

Calificación bidireccional ciega con las dimensiones de la sección 5, que se revela cuando ambos califican o a los 7 días. Perfiles públicos con rating e historial.
```

## Hito 7 — Grupos de pasajeros

```
Hito 7. El flujo inverso de la sección 7.2 de SPEC.md.

Transportista publica un grupo disponible con cantidad de pasajeros, destino, fecha, ticket estimado y comisión solicitada.

Bandeja separada del lado agencia, con su propia lógica. La agencia responde, negocia comisión, el transportista adjudica. Escrow de la comisión y liberación al completarse.

Permite enlazar un grupo con un viaje de transporte para que sea una sola operación.
```

## Hito 8 — Notificaciones y admin

```
Hito 8. Centro de notificaciones in-app para los eventos de SPEC.md: oferta que calza con el perfil, contraoferta recibida, adjudicación, recordatorio 24h antes, pago liberado, calificación pendiente, documento por vencer.

Panel admin: cola de verificación de documentos con aprobar y rechazar con motivo, listado de cuentas, viajes y disputas, configuración de comisiones, y métricas de ofertas publicadas, tasa de adjudicación, tiempo hasta primera respuesta, GMV y comisión generada.
```

## Hito 9 — Cierre

```
Hito 9. Recorre los tres criterios de aceptación de la sección 10 de SPEC.md de punta a punta y arregla todo lo que se rompa o quede muerto.

Revisa cada lista: estado vacío, cargando y error. Verifica foco de teclado visible y prefers-reduced-motion. La vista móvil no se optimiza en esta fase.

Deja un botón de "reiniciar demo" que restaure el seed data original.
```

---

## Después

Cuando el prototipo esté navegable, muéstraselo a dos o tres agencias y a dos o tres furgoneros antes de escribir una línea de backend. Las cosas que se van a caer son el modelo de comisión y la ventana de cierre. Mejor descubrirlo ahí.
