@AGENTS.md

## Dónde quedamos (2026-07-24)

Sesión larga de rebrand + pulido de TicoFinanza, pausada porque Camil se va de
viaje a Nicaragua. Todo lo de esta sesión ya está en `main` y deployado a
`https://finanzascr-nu.vercel.app` salvo que se diga lo contrario.

**Pendiente para retomar / verificar:**
- Confirmar visualmente (no tengo navegador) que el último deploy de ajustes
  del header del dashboard se ve bien: logo clickeable a la landing, botón
  "Leer correos" movido junto a "Últimas transacciones" (con estilo sky-400
  más notorio), "Estadísticas" con el label siempre visible, y el modal de
  "Cerrar sesión" centrado en todas las pantallas.
- Revisar en un dispositivo real que la pantalla `/bienvenida` (rediseño
  tipográfico grande, sin la card flotante) se vea bien y no genérica.
- Recordar correr en Supabase Studio cualquier migración nueva que no se
  haya corrido todavía (última aplicada por Camil: `0011`; revisar si
  `0012_onboarding.sql` ya se corrió).
- El texto sobre notificaciones bancarias de BAC quedó deliberadamente
  genérico ("revisá los ajustes de notificaciones de tu banco") porque las
  instrucciones específicas que se probaron dos veces resultaron
  incorrectas — no reintroducir pasos de menú inventados sin confirmarlos
  con Camil primero.
- Deploy manual siempre: `git push origin main` + `npx vercel --prod` (no
  hay auto-deploy conectado a GitHub).
