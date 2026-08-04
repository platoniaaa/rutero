# SPEC — Rutero

> Marketplace que conecta agencias de turismo con transportistas de pasajeros (vans, minibuses, sprinters) en Chile.
> **Nombre provisional:** Rutero. Es un find-replace si lo cambias.
> **Este documento define QUÉ se construye.** Las convenciones técnicas van en `CLAUDE.md`.

---

## 1. Problema

Las agencias de turismo necesitan transporte para grupos y hoy lo consiguen por WhatsApp, contactos personales y grupos de Facebook. El proceso es opaco: no saben si el transportista tiene los papeles al día, no tienen respaldo si falla, y cotizar toma horas de llamadas.

Los transportistas, por su lado, tienen sus vans paradas buena parte de la semana y no tienen forma sistemática de encontrar demanda fuera de su red de contactos.

Rutero es el intermediario que resuelve las dos puntas: publica la demanda, verifica la oferta, retiene el pago hasta que el viaje se completa, y cobra comisión.

---

## 2. Modelo de negocio

| Flujo | Quién paga | Comisión Rutero (default, configurable) |
|---|---|---|
| **Viaje** — agencia contrata van | Agencia paga el total → escrow | **5%** descontado al transportista al liberar |
| **Referido** — van entrega pasajeros a agencia | Agencia paga comisión de referido a la van (~10% del ticket) | **5% de esa comisión** |

La agencia no paga fee de plataforma en la fase inicial. Es deliberado: bajar la fricción del lado que genera la demanda.

**Comisión plana.** 5% para todos, sin tramos ni descuentos por volumen. La defensa contra la fuga se apoya en el respaldo del viaje, el escrow y el historial reputacional, no en un descuento acumulado.

---

## 3. Roles

### 3.1 Agencia
Empresa de turismo que necesita transporte. Publica ofertas de viaje, adjudica, paga, califica.

### 3.2 Transportista
**Un solo tipo de cuenta cubre los dos perfiles.** El furgonero independiente es simplemente el caso donde la cuenta tiene 1 vehículo y 1 conductor (él mismo). La empresa con flota es la misma cuenta con N vehículos y N conductores.

No construyas dos onboardings ni dos dashboards. La UI de gestión de flota se oculta cuando hay un solo vehículo y aparece cuando se agrega el segundo.

### 3.3 Admin (Rutero)
Verifica documentos, resuelve disputas, ajusta comisiones, ve métricas.

### 3.4 Pasajero final
**No usa la app.** Es un número en la oferta y, a lo más, un nombre en la lista de embarque. No hay app de pasajero en este proyecto.

---

## 4. Cómo se cierra el trato

**Modelo elegido: precio referencial + aceptación directa o contraoferta.**

La agencia publica con un presupuesto referencial. El transportista puede:
- **Aceptar** al precio publicado, o
- **Contraofertar** con su monto y una nota (ej. "incluye cadenas y segundo conductor").

La agencia ve una bandeja con ambas cosas mezcladas y adjudica a quien quiera.

**Por qué este modelo y no los otros dos:**

- *Precio fijo + primera van que acepta* (tipo Uber) requiere que la plataforma sepa cuánto vale cada ruta. Hoy no lo sabes. Una agencia que tira un precio a ciegas o no recibe respuestas o paga de más.
- *Solo licitación* mata la velocidad. La agencia espera horas por cotizaciones y el transportista cotiza a ciegas sin saber si va a ganar, lo que quema su tiempo y lo hace dejar de cotizar.
- El híbrido te da lo rápido cuando el precio está bien calibrado y descubrimiento de precio cuando no. **Y te genera el dataset**: en 6 meses tienes precios reales por ruta, temporada y capacidad, y ahí sí puedes migrar a precio sugerido automático.

**La unidad de precio es la jornada, no el kilómetro.** La van y el conductor quedan bloqueados el servicio completo: el chofer que sube al Colorado espera arriba hasta la bajada, no existe el "dejar y volver". Por eso el presupuesto referencial se ancla a un bloque de servicio — transfer punto a punto / medio día (hasta 5h) / día completo (hasta 12h) / multi-día — con tarifa de hora extra opcional. Es la unidad con la que el transportista ya calcula sus precios, así que las contraofertas convergen más rápido.

**La plataforma nunca fija el precio.** Cada actor pone el suyo: la agencia propone lo que estime, el transportista acepta o contraoferta lo que estime. Lo que Rutero construye con el historial de cierres es un **rango sugerido** por ruta y temporada — "viajes similares cerraron entre $260.000 y $300.000" — que orienta al que publica y al que responde, pero nunca decide por ellos. El transfer de aeropuerto será el primer segmento donde esa sugerencia sea precisa.

**Doble lectura del precio.** La agencia piensa por pasajero (así arma su margen frente al cliente final); el transportista piensa por jornada. El campo de presupuesto acepta los dos modos de ingreso —total o por pasajero— y muestra siempre la conversión: `$280.000 · ≈ $18.700/pax con 15 pasajeros`. En la bandeja de respuestas, cada contraoferta muestra también su equivalente por pasajero, porque esa es la cifra contra la que la agencia decide.

**Toggle de adjudicación** en cada oferta:
- `Yo elijo` (default) — la agencia revisa y adjudica.
- `Automático al primero` — para traslados estándar donde la velocidad importa más que comparar.

**Ventana de cierre.** Toda oferta expira: la agencia elige 6h / 24h / 72h. Sin expiración las ofertas se pudren en el feed.

**Máximo 2 contraofertas por transportista por viaje.** Esto no es un mercado persa.

---

## 5. Entidades

```
User ─┬─ AgencyAccount
      ├─ CarrierAccount ─┬─ Vehicle[]
      │                  └─ Driver[]
      └─ AdminAccount

TripRequest (agencia publica) ── Bid[] (transportista responde) ── Booking (adjudicado)
                                                                       ├─ Payment (escrow)
                                                                       ├─ Review[] (bidireccional)
                                                                       ├─ Passenger[] (lista de embarque)
                                                                       └─ Thread ── Message[]

PassengerLead (transportista ofrece grupo) ── LeadOffer[] ── Booking
```

### AgencyAccount
`razonSocial`, `rut`, `giro`, `logo`, `contacto`, `direccion`, `estadoVerificacion`, `ratingPromedio`, `viajesCompletados`

### CarrierAccount
`nombre` (razón social o persona natural), `rut`, `esEmpresa: boolean`, `zonasOperacion[]`, `bloqueosAgenda[]` (franjas recurrentes o puntuales no disponibles por recorridos propios: escolar, contratos de empresa, circuitos propios), `estadoVerificacion`, `ratingPromedio`, `viajesCompletados`

### Vehicle
`patente`, `marca`, `modelo`, `anio`, `tipo` (van | minibús | sprinter | bus), `capacidadPasajeros`, `capacidadEquipaje`, `fotos[]`, `equipamiento[]` (aire acondicionado, portaequipaje, cadenas, WiFi, rampa accesibilidad), `documentos[]`

### Driver
`nombre`, `rut`, `foto`, `telefono`, `licencia` (clase + vencimiento), `idiomas[]`, `documentos[]`

### Document
`tipo`, `archivo`, `fechaEmision`, `fechaVencimiento`, `estado` (pendiente | aprobado | rechazado | vencido)

Tipos requeridos:
- **Cuenta:** RUT/e-RUT, inicio de actividades, certificado de inscripción del servicio en el Registro Nacional de Transporte Privado Remunerado de Pasajeros — "la 80" (DS 80/2004 MTT, trámite TTEPRIV en la Seremitt) —, seguro de responsabilidad civil y seguro del personal de conducción
- **Vehículo:** certificado de inscripción del vehículo en el servicio DS 80, permiso de circulación, revisión técnica, SOAP, certificado de emisiones, y tacógrafo si presta servicios interurbanos
- **Conductor:** licencia profesional clase A2 (habilita vehículos de 10 a 17 asientos) o A3 (sin límite de capacidad), certificado de antecedentes, hoja de vida del conductor

> **Nota DS 80 / turismo:** para inscribir un servicio de turismo, la norma exige acreditar giro de agencia u operador turístico ante el SII, **o un contrato vigente con una agencia que tenga ese giro**. Oportunidad de producto: Rutero puede emitir ese respaldo contractual estandarizado para transportistas sin giro propio. Ver decisiones abiertas.

> **Captura de documentos:** el onboarding pide foto directa con la cámara del celular (frente y dorso cuando aplique, como el carnet de conducir), con preview antes de enviar. No se le exige PDF escaneado a un furgonero.

### TripRequest
`codigo`, `agencia`, `titulo`, `bloqueServicio` (transfer | medio_dia | dia_completo | multi_dia), `tipoServicio` (traslado aeropuerto | tour | transfer hotel | evento corporativo | otro), `origen`, `destino`, `paradas[]`, `fechaHoraSalida`, `fechaHoraRetorno`, `esIdaYVuelta`, `horasEstimadas`, `cantidadPasajeros`, `requerimientos[]`, `presupuestoReferencial`, `tarifaHoraExtra?`, `modoAdjudicacion`, `expiraEn`, `notas`, `estado`

### Bid
`tripRequest`, `carrier`, `vehiculoPropuesto`, `conductorPropuesto`, `tipo` (aceptacion | contraoferta), `monto`, `nota`, `estado` (activa | retirada | rechazada | ganadora), `createdAt`

### Booking
`tripRequest`, `bidGanadora`, `montoFinal`, `comision`, `montoTransportista`, `estado`, `codigoAbordaje`

### PassengerLead
`carrier`, `titulo`, `origen`, `destinoOTour`, `fecha`, `cantidadPasajeros`, `ticketEstimadoPorPasajero`, `comisionSolicitadaPct`, `notas`, `estado`

### Passenger
`booking`, `nombreCompleto`, `documento` (RUT o pasaporte), `telefono`, `puntoRecogida`, `observaciones` (menor de edad, silla de ruedas, alergias)

La **lista de embarque** la carga la agencia una vez adjudicado el viaje, uno por uno o pegando desde una planilla. El transportista la ve en la hoja de ruta y **la puede imprimir**: hoja con el código de abordaje, la ruta, la patente, el conductor y la nómina numerada con casilla para marcar presente. Es el documento que el chofer lleva en la mano.

### Payment
`booking`, `montoBruto`, `comisionPlataforma`, `montoNeto`, `estado` (pendiente | retenido | liberado | reembolsado | en_disputa), `fechaRetencion`, `fechaLiberacion`

### Review
`booking`, `autor`, `destinatario`, `puntuacionGeneral` (1–5), `dimensiones` (puntualidad, estado del vehículo, trato, comunicación / y del lado agencia: claridad del brief, puntualidad de pasajeros, pago), `comentario`

---

## 6. Máquinas de estado

**TripRequest**
```
borrador → publicada → con_respuestas → adjudicada → cerrada
                ↓            ↓
            expirada     cancelada
                ↓
          sin_respuestas
```

**Booking**
```
confirmada → pago_retenido → en_curso → finalizada → liberada
                  ↓              ↓          ↓
          cancelada_agencia   no_show   en_disputa
          cancelada_transportista
```

**Payment** sigue a Booking: se retiene al confirmar, se libera 24h después de `finalizada` si nadie abre disputa.

---

## 7. Flujos principales

### F1 — Viaje (agencia → transportista)

1. Agencia crea oferta: ruta, fecha, pasajeros, requerimientos, presupuesto referencial, ventana de cierre.
2. Se publica. Los transportistas cuyo perfil calza (zona, capacidad, documentos al día) reciben notificación.
3. Transportista ve el detalle. Acepta al precio o contraoferta. Debe asignar vehículo y conductor específicos.
4. Agencia compara en su bandeja: monto, rating, vehículo propuesto, antigüedad, nota.
5. Adjudica. Las demás respuestas se rechazan automáticamente.
6. Agencia paga → **escrow**. Recién ahí se revelan los datos de contacto de ambas partes.
7. Se abre el chat del viaje. Se genera el código de abordaje.
8. Día del viaje: transportista marca `en_curso` y luego `finalizada`.
9. Agencia confirma o abre disputa (48h).
10. Pago se libera menos comisión. Ambos se califican.

### F2 — Referido (transportista → agencia)

1. Transportista publica un `PassengerLead`: tiene 14 personas que quieren ir al Valle Nevado el sábado, pide 10% de comisión.
2. Las agencias con oferta en esa zona/tipo lo ven en una bandeja **separada** — no mezclada con las ofertas de viaje, es un objeto distinto con lógica distinta.
3. Agencia responde: toma el grupo, propone su ticket por pasajero y acepta o negocia la comisión.
4. Transportista adjudica.
5. La agencia cobra a los pasajeros por fuera. Deposita en escrow la comisión del transportista.
6. Tour se completa → se libera la comisión menos el 5% de Rutero.

> **Nota de diseño:** en F2 el transportista suele quedarse también con el viaje. La UI debe permitir enlazar un `PassengerLead` con un `Booking` de transporte para que sea una sola operación.

### F3 — Verificación (admin)

1. Transportista sube documentos en onboarding.
2. Admin los revisa en una cola. Aprueba o rechaza con motivo.
3. Cada documento muestra badge por vencimiento: verde (>30 días), ámbar (<30 días), rojo (vencido).
4. **Documento crítico vencido bloquea la postulación.** Se notifica a los 30, 15 y 3 días antes.

---

## 8. Reglas de negocio

**Anti-fuga (crítico)**
- Teléfono y email quedan ocultos hasta que se adjudica y se paga el escrow.
- Chat in-app. Si detecta un patrón de número telefónico, muestra un aviso suave: "Recuerda que el respaldo del viaje solo aplica dentro de Rutero."
- El historial y las calificaciones no son portables.

**Cancelaciones**
- Agencia, >72h antes: reembolso 100%.
- Agencia, 72–24h: 50% al transportista.
- Agencia, <24h: 100% al transportista, menos comisión.
- Transportista, <48h: reembolso total a la agencia, penalidad en score, reapertura urgente de la oferta. Tres en 90 días = suspensión.

**Postulación**
- Solo si la cuenta está verificada y los documentos críticos están vigentes.
- La capacidad del vehículo propuesto debe cubrir los pasajeros de la oferta.
- La clase de licencia del conductor asignado debe cubrir la capacidad del vehículo: A2 hasta 17 asientos, A3 sin límite. Si no calza, la postulación se bloquea mostrando el motivo.
- No se puede postular a dos viajes que se solapen en horario con el mismo vehículo, ni a ofertas que caigan dentro de un bloqueo de agenda. El feed muestra esas ofertas atenuadas, con el motivo visible.

**Calificación**
- Bidireccional y ciega: cada uno ve la del otro recién cuando ambos calificaron o pasan 7 días.
- Se pide antes de la siguiente postulación, pero se puede saltar.

**Precio**
- Todo en CLP, sin decimales, con separador de miles.
- El desglose siempre visible: monto bruto, comisión, neto.

---

## 9. Pantallas

### Agencia
1. Dashboard — viajes próximos, ofertas abiertas, respuestas sin revisar, pagos pendientes
2. Crear oferta (wizard 3 pasos: ruta y fecha → pasajeros y requerimientos → precio y cierre)
3. Mis ofertas (lista + filtros por estado)
4. Detalle de oferta con bandeja de respuestas comparables
5. Detalle de viaje adjudicado (chat, documentos del transportista, código de abordaje, lista de embarque, estado)
6. Bandeja de grupos disponibles (F2)
7. Pagos e historial
8. Perfil de la agencia
9. Calificaciones

### Transportista
1. Dashboard — agenda de la semana, ofertas que calzan, postulaciones activas, próximo pago
2. Feed de ofertas (filtros: fecha, zona, pasajeros, monto mínimo, tipo de servicio)
3. Detalle de oferta + aceptar / contraofertar
4. Mis postulaciones
5. Detalle de viaje adjudicado (chat, hoja de ruta con lista de embarque imprimible, marcar en curso / finalizado)
6. Publicar grupo de pasajeros (F2)
7. Flota y agenda — vehículos, conductores, documentos con vencimientos, y calendario para bloquear franjas con recorridos propios (escolar, empresas, circuitos)
8. Billetera — retenido, liberado, historial de liquidaciones
9. Perfil y calificaciones

### Admin
1. Cola de verificación de documentos
2. Cuentas
3. Viajes y disputas
4. Configuración de comisiones
5. Métricas — ofertas publicadas, tasa de adjudicación, tiempo hasta primera respuesta, GMV, comisión generada

---

## 10. Alcance Fase 1 — solo frontend

**Sí:**
- Todas las pantallas navegables con data mockeada
- Estado en memoria + `localStorage`, de modo que las acciones **persistan durante la demo**: si adjudicas una oferta, queda adjudicada
- Seed data realista: nombres de agencias chilenas verosímiles, rutas reales (Santiago–Valle Nevado, aeropuerto SCL–Viña, Pucón, San Pedro de Atacama), patentes con formato chileno, montos en CLP de mercado
- **Switch de rol en la barra superior** para saltar entre agencia / transportista / admin sin login. Es la herramienta que hace posible validar los flujos
- Estados vacíos, de carga y de error diseñados
- **Desktop primero.** La Fase 1 se construye y se valida en pantalla de computador. El celular viene en una fase posterior: los furgoneros van a terminar usando esto en el celular, al sol y con una mano, así que el diseño no debe cerrarse puertas — layouts fluidos, nada de anchos fijos — pero la vista móvil no se optimiza todavía

**No:**
- Backend, base de datos, autenticación real
- Pasarela de pago real (el escrow es una simulación visual)
- Chat en tiempo real (mensajes mockeados, se agregan al array local)
- Mapas con API real (usar un placeholder estático)
- Notificaciones push

### Criterio de aceptación de la fase
Se puede recorrer completo, sin tocar código y sin pantallas muertas:
1. Agencia publica oferta → transportista contraoferta → agencia adjudica → paga → viaje se ejecuta → se libera pago → ambos califican.
2. Transportista publica grupo → agencia lo toma → se completa → se libera comisión.
3. Admin verifica un documento vencido y confirma que bloquea la postulación.

---

## 11. Dirección visual

**Dos registros, según quién mira.**

- **La landing pública** la ve alguien que llega por primera vez: una agencia evaluando si vale la pena, un furgonero al que le mandaron el link. Ahí el producto tiene que vender, y el paisaje chileno es el activo: cordillera, valle, costa.
- **Las pantallas de trabajo** las mira alguien comparando ocho precios a las siete de la mañana. Ahí la referencia sigue siendo un despacho de flota, no Booking.com: densa donde hay que comparar, legible bajo el sol, con targets de toque grandes.

La paleta es la misma en los dos registros; lo que cambia es la densidad y el peso de la imagen.

**Paleta Cordillera**
```
--base:      #0B3C5D   azul cordillera — nav y superficies oscuras
--surface:   #FFFFFF   tablas y formularios
--nieve:     #F7F9FB   superficie alterna, secciones de la landing
--ink:       #14283A   texto principal
--signal:    #F4A259   acción primaria — luz de atardecer en la montaña
--go:        #1D7874   confirmado, pago liberado — verde de lago
--stop:      #C0492F   vencido, cancelado, disputa
--meta:      #46596B   metadata — gris piedra
```

Cada color suave (`signal-soft`, `go-soft`, `stop-soft`) tiene su tinta oscura (`signal-ink`, `go-ink`, `stop-ink`) para el texto encima: el color puro no alcanza contraste sobre su propio fondo. **Todos los pares texto/fondo cumplen WCAG AA**, verificado sobre el render real, no a ojo.

**Imágenes**
Ilustraciones SVG propias de paisajes chilenos, no fotos de stock: pesan poco, escalan sin perder nitidez y no arrastran licencias de terceros. Viven en `components/marketing/paisajes.tsx` y están pensadas para que fotos reales de los viajes las reemplacen sin tocar el layout.

**Tipografía**
- Display / títulos: una grotesca condensada de peso alto — evoca la rotulación de flota. Sugerencia: `Archivo` o `Oswald`, usada con restricción. En versal corrida (`font-display`) para rótulos y etiquetas; en caja natural (`font-titular`) para los titulares largos de la landing, donde la versal cansa la lectura.
- Cuerpo e interfaz: `Inter`.
- Datos, patentes, montos y códigos: mono tabular — `JetBrains Mono` con `font-variant-numeric: tabular-nums`. Los montos en una tabla comparativa **tienen** que alinearse en la coma.

**Elemento firma**
La tarjeta de vehículo se presenta como una placa patente: bloque mono, borde grueso, patente en grande. Es el objeto que ambos lados reconocen al instante y le da identidad al producto sin decorar nada.

**Copy**
Verbos activos y consistentes de punta a punta. El botón dice "Adjudicar" y el toast dice "Adjudicado". Los errores explican qué pasó y cómo arreglarlo, no piden disculpas. Los estados vacíos invitan a actuar: "Todavía no hay respuestas. Suben un 40% cuando el presupuesto referencial está a precio de mercado."

---

## 12. Decisiones abiertas

- ¿Cobrar fee a la agencia en algún momento, o mantener el 0% como diferenciador permanente?
- ¿Qué pasa si la agencia quiere reservar el mismo transportista directo, sin publicar oferta? (contratación directa con comisión reducida sería una buena v2 y refuerza el anti-fuga)
- Facturación: ¿Rutero emite factura por la comisión y el transportista por el servicio, o Rutero factura todo? Esto tiene implicancias tributarias reales, hay que verlo con contador antes de la fase 2.
- ¿Subir la comisión después de probar demanda, o el 5% es permanente? Con precios reales (Farellones, 15 pax ≈ $280.000), el 5% son ~$14.000 por viaje: bajo como para que el transportista no lo traslade al precio y la plataforma no quede más cara que WhatsApp en la etapa donde menos valor demostrado tiene. Subir después es más fácil que retener transportistas espantados al inicio.
- ¿Rutero genera el contrato estandarizado transportista–agencia que el DS 80 exige para servicios de turismo? Sería un gancho fuerte para captar transportistas sin giro turístico propio, y refuerza que operar dentro de la plataforma es lo que te deja legal.
