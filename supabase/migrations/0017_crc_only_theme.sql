-- Se quita el dólar como moneda propia de la app: de ahora en adelante todo
-- se guarda en colones. Cualquier gasto en otra moneda (dólares, córdobas,
-- euros, lo que sea) se convierte a colones al parsear el correo con el tipo
-- de cambio del día (ver lib/exchangeRate.ts), así que ya no hace falta que
-- las tablas carguen con una columna `currency` que puede variar.
--
-- Las filas históricas en dólares se convierten acá con el tipo de cambio de
-- hoy (2026-08-18, USD/CRC ≈ 449.08 según open.er-api.com — la misma API
-- que usa la app) en vez de guardar el tipo de cambio real del día en que
-- pasó cada transacción, que no tenemos guardado en ningún lado. Decisión
-- de Camil: preferible una conversión aproximada pero simple a dejar los
-- montos en dólares mezclados con colones.

update public.transactions
  set amount = round(amount * 449.08), currency = 'CRC'
  where currency = 'USD';

update public.budgets
  set monthly_limit = round(monthly_limit * 449.08), currency = 'CRC'
  where currency = 'USD';

update public.savings_goals
  set target_amount = round(target_amount * 449.08), currency = 'CRC'
  where currency = 'USD';

alter table public.transactions drop constraint transactions_currency_check;
alter table public.transactions add constraint transactions_currency_check
  check (currency = 'CRC');

alter table public.budgets drop constraint budgets_currency_check;
alter table public.budgets add constraint budgets_currency_check
  check (currency = 'CRC');

alter table public.savings_goals drop constraint savings_goals_currency_check;
alter table public.savings_goals add constraint savings_goals_currency_check
  check (currency = 'CRC');

-- "Moneda por defecto" deja de tener sentido si solo hay una moneda — la
-- columna se reemplaza por la preferencia de tema (claro/oscuro/sistema).
alter table public.user_settings drop constraint user_settings_default_currency_check;
alter table public.user_settings rename column default_currency to theme;
alter table public.user_settings alter column theme set default 'system';
update public.user_settings set theme = 'system';
alter table public.user_settings add constraint user_settings_theme_check
  check (theme in ('dark', 'light', 'system'));
