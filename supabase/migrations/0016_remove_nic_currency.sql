-- Se quita el córdoba nicaragüense (NIC) como moneda propia de la app:
-- agregaba una tercera columna al saldo que casi nadie necesitaba. Las
-- filas existentes en córdobas se convierten a colones con un tipo de
-- cambio fijo aproximado (ver lib/parsers/types.ts, NIO_TO_CRC_RATE) antes
-- de volver a restringir los check constraints a solo CRC/USD.

update public.transactions
  set amount = round(amount * 14.2), currency = 'CRC'
  where currency = 'NIC';

update public.budgets
  set monthly_limit = round(monthly_limit * 14.2), currency = 'CRC'
  where currency = 'NIC';

update public.savings_goals
  set target_amount = round(target_amount * 14.2), currency = 'CRC'
  where currency = 'NIC';

update public.user_settings
  set default_currency = 'CRC'
  where default_currency = 'NIC';

alter table public.transactions drop constraint transactions_currency_check;
alter table public.transactions add constraint transactions_currency_check
  check (currency in ('CRC', 'USD'));

alter table public.user_settings drop constraint user_settings_default_currency_check;
alter table public.user_settings add constraint user_settings_default_currency_check
  check (default_currency in ('CRC', 'USD'));

alter table public.budgets drop constraint budgets_currency_check;
alter table public.budgets add constraint budgets_currency_check
  check (currency in ('CRC', 'USD'));

alter table public.savings_goals drop constraint savings_goals_currency_check;
alter table public.savings_goals add constraint savings_goals_currency_check
  check (currency in ('CRC', 'USD'));
