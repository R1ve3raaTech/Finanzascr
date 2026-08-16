@AGENTS.md

## Dónde quedamos (2026-07-29)

Verificación de OAuth de Google enviada. Estado real (no confundir con los
checks verdes de "branding", que ya estaban aprobados antes y son un trámite
aparte):

- El scope `gmail.readonly` es un **scope restringido** de Google (no solo
  "sensible"), y por eso requiere su propia revisión — la advertencia de
  "Google no verificó esta app" seguía saliendo en incógnito aunque branding
  ya estuviera en verde, porque el scope restringido nunca había sido
  **declarado** en Cloud Console → Acceso a los datos (por eso las tablas
  salían vacías, aunque el código sí lo pedía en tiempo de ejecución).
- Ya se declaró el scope, se completó justificación + video de demo (unlisted
  en YouTube) y se envió el formulario. Google confirmó: primer correo de
  respuesta en 3-5 días, proceso completo 4-6 semanas. Contacto del proyecto
  es `thecamil999@gmail.com` — revisar esa bandeja para pedidos de Google.
- **Importante para el futuro**: como el scope es restringido, Google exige
  además una **evaluación CASA** (Cloud Application Security Assessment),
  paga y a recertificar anualmente, antes de aprobar el acceso final a la
  API. Para una app chica como esta normalmente aplica el tier más bajo
  (~$540/año vía proveedores aprobados), no el tier enterprise. Esto todavía
  no se contrató — probablemente llegue como siguiente paso pedido por
  Google en el correo de seguimiento.
- Se agregó `include_granted_scopes=true` al armado manual de la URL de
  OAuth (`lib/google/oauth.ts`) para resolver el warning de "autorización
  incremental" que mostraba Cloud Console — ya deployado y verificado en
  producción.
- Mientras la revisión está pendiente, la app sigue funcionando normal en
  producción; los usuarios nuevos van a seguir viendo la advertencia de
  Google hasta que termine el proceso. No hay nada que hacer del lado del
  código salvo responder si Google pide más info por correo.

## Dónde quedamos (2026-07-30)

Google mandó el checklist automático de verificación (pide confirmar por
correo que la app cumple cada punto antes de seguir con la revisión). Se
agregó a `/privacidad` una declaración explícita de "Limited Use" (Google la
exige cuando una app usa IA sobre datos que vienen de una API de Workspace,
como Gmail) y se deployó. Queda pendiente que Camil mande la respuesta al
correo de Google confirmando el checklist (borrador ya redactado en esa
conversación). El bloqueante real sigue siendo CASA, sin contratar todavía
(ver nota de 2026-07-29 arriba).

Los dos pendientes visuales de la sesión del 2026-07-24 (header del
dashboard y `/bienvenida`) ya fueron confirmados por Camil viendo la app en
producción — se ven bien, no hace falta retocar nada.

## Dónde quedamos (2026-08-15)

Camil reportó que el saldo del dashboard no le cuadraba. Causa real: el
saldo consolidado se calculaba sumando solo las transacciones ya traídas
para la lista visible (`.limit(50)` sin filtro de fecha, `.limit(300)` con
filtro) — en cuanto había más movimientos que ese límite, el saldo
ignoraba los más viejos. Se arregló calculando el saldo con una consulta
aparte sin límite (`app/dashboard/page.tsx`).

De paso se quitó el córdoba nicaragüense (NIC) como moneda propia de la
app — ya no aparece en saldo, formulario de efectivo, metas ni
presupuestos; solo quedan CRC y USD. Los correos de BAC/MUCAP que a veces
llegan en córdobas (compras hechas en Nicaragua) se convierten
automáticamente a colones al parsear el correo, con un tipo de cambio fijo
aproximado (`NIO_TO_CRC_RATE = 14.2` en `lib/parsers/types.ts` — no es una
tasa en vivo, son montos chicos y esporádicos). Migración `0016_remove_nic_currency.sql`
ya corrida en Supabase Studio por Camil (convirtió filas viejas en
córdobas a colones y sacó NIC de los check constraints). Deployado a
producción.

**Importante para el futuro**: no tengo acceso directo a la base de
TicoFinanza por ningún canal automatizado — el MCP de Supabase conectado
en este entorno apunta a otra cuenta de Camil (proyectos ajenos, no
`pukvyunpwgwpbvtmyniu`), no hay `DATABASE_URL`/connection string guardado
en `.env.local` (solo `SUPABASE_SERVICE_ROLE_KEY`, que no permite DDL/SQL
crudo), y el CLI de Supabase no está enlazado. Mientras eso no cambie,
cualquier migración SQL la tiene que correr Camil a mano en Supabase
Studio → SQL Editor.

## Dónde quedamos (2026-08-15, segunda parte)

Rediseño visual completo de la app, en cuatro commits (landing → ajustes →
estadísticas → login/bienvenida). Lo que hay que saber para no deshacerlo
sin querer:

- **El acento de la app es celeste `#38BDF8`, no naranja.** No es un capricho:
  es el color que ya tenía el ícono (`public/icon-192.png`), así que antes el
  usuario instalaba una app azul y abría una app naranja. Además el naranja
  chocaba con el ámbar de "casi te pasás del presupuesto".
- **Regla de color que gobierna todo**: verde/rosa/ámbar están *reservados*
  para ingreso/gasto/alerta y no se usan decorativamente. Si algo necesita
  color y no significa plata, va celeste o neutro. Los tokens viven en
  `app/globals.css` (`--ground`, `--ink`, `--accent`, `--income`, …) y se usan
  como clases de Tailwind (`bg-surface`, `text-ink-2`, `border-line`).
- **El gráfico de los 6 meses es divergente a propósito** (ingresos arriba,
  gastos abajo). No volver a barras agrupadas: verde contra rojo da ΔE 4.6 en
  deuteranopía, o sea que para ~1 de cada 12 hombres eran el mismo color, y
  ahí el color era lo único que separaba las series. Los rellenos usan
  `--chart-income` / `--chart-expense`, más profundos que los del texto porque
  tienen que caer dentro de la banda OKLCH L 0.48–0.67 del validador.
- **Para ver pantallas que exigen login** (ajustes, estadísticas, bienvenida)
  se puede crear `app/preview-tmp/page.tsx` con datos falsos, capturarla con
  Playwright (está en node_modules) y borrarla antes de commitear. Ojo: Next
  ignora las carpetas que empiezan con `_`, por eso no puede llamarse
  `_preview`. Así aparecieron varios de los bugs que se corrigieron.
- Las skills instaladas con `npx skills add` viven en `.agents/`, `.claude/` y
  `agent/`, están en `.gitignore` y excluidas del lint. Se reinstalan con
  `npx skills experimental_install` desde `skills-lock.json`, que sí se versiona.

## Dónde quedamos (2026-08-15, tercera parte)

Camil pidió revisar su Gmail real para ver si algún correo bancario servía
de algo. Encontré un bug de correctness real (no de diseño): las
notificaciones de compra de Banco Popular usan el mismo layout de tabla que
BAC ("Comercio: / Fecha: / Tipo de Transacción: / Monto:"), y
`bacCardPurchase.ts` no exigía ningún texto propio de BAC — así que
cualquier compra de BP con tarjeta se registraba como si fuera de BAC.
Confirmado corriendo `parseEmail()` de verdad contra el HTML real de dos
correos de BP (`notificacion@bancopopularinforma.fi.cr`). Se agregó
`lib/parsers/bpCardPurchase.ts` (gateado por "bp.fi.cr", propio de sus
correos) y se blindó `bacCardPurchase.ts` exigiendo "baccredomatic.com" o
"BAC INTERNATIONAL BANK".

De paso salieron dos bugs más del mismo lote de correos: el filtro que evita
duplicar una compra pagada vía PayPal solo reconocía "PAYPAL \*comercio",
no "PP\*comercio" (la notación que usa BP) — ahora es
`isPaypalRoutedMerchant()`, compartida entre ambos parsers de tarjeta. Y el
parser de PayPal (`lib/parsers/paypal.ts`) solo aceptaba correos "Ha
pagado", así que los pagos "Ha autorizado" (pendientes de captura, comunes
en compras dentro de apps/juegos) no se registraban nada — ahora acepta
ambas variantes.

**Importante, sin resolver**: no tengo forma de saber si esto ya afectó
datos reales en producción — no tengo acceso de lectura a la base (ver nota
de acceso arriba, 2026-08-15 segundo bloque). Si Camil ya conectó Gmail y
usó "Leer correos" con compras de BP de por medio, esas filas quedaron con
`bank_name = 'BAC'` en vez de `'BP'` y hay que corregirlas a mano (editar
cada una desde Ajustes → o Camil corre un `UPDATE` en Supabase Studio
buscando transacciones "BAC" cuyo `description` no le suene a Nicaragua/BAC).

**Pendientes generales, sin fecha de sesión asociada:**
- No hay migraciones pendientes de correr: la última en el repo
  (`supabase/migrations/`) es `0015_account_deletion.sql`, igual a la última
  confirmada aplicada en Supabase Studio.
- El texto sobre notificaciones bancarias de BAC quedó deliberadamente
  genérico ("revisá los ajustes de notificaciones de tu banco") porque las
  instrucciones específicas que se probaron dos veces resultaron
  incorrectas — no reintroducir pasos de menú inventados sin confirmarlos
  con Camil primero.
- Deploy manual siempre: `git push origin main` + `npx vercel --prod` (no
  hay auto-deploy conectado a GitHub). Dominio de producción actual:
  `www.ticofinanza.com`.
