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
