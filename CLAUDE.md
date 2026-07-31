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

**Pendientes de sesiones anteriores (2026-07-24), aún sin confirmar:**
- Confirmar visualmente (no tengo navegador) que el header del dashboard se
  ve bien: logo clickeable a la landing, botón "Leer correos" junto a
  "Últimas transacciones" (estilo sky-400), "Estadísticas" con label
  siempre visible, modal de "Cerrar sesión" centrado en todas las pantallas.
- Revisar en un dispositivo real que `/bienvenida` (rediseño tipográfico
  grande, sin card flotante) se vea bien y no genérica.
- Recordar correr en Supabase Studio cualquier migración nueva que no se
  haya corrido todavía (última confirmada aplicada: `0015_account_deletion.sql`).
- El texto sobre notificaciones bancarias de BAC quedó deliberadamente
  genérico ("revisá los ajustes de notificaciones de tu banco") porque las
  instrucciones específicas que se probaron dos veces resultaron
  incorrectas — no reintroducir pasos de menú inventados sin confirmarlos
  con Camil primero.
- Deploy manual siempre: `git push origin main` + `npx vercel --prod` (no
  hay auto-deploy conectado a GitHub). Dominio de producción actual:
  `www.ticofinanza.com`.
