-- Soporte para córdoba nicaragüense (NIC) en transacciones hechas durante
-- viajes a Nicaragua: se agrega a los check constraints de moneda que antes
-- solo permitían CRC/USD.

alter table public.transactions drop constraint transactions_currency_check;
alter table public.transactions add constraint transactions_currency_check
  check (currency in ('CRC', 'USD', 'NIC'));

alter table public.user_settings drop constraint user_settings_default_currency_check;
alter table public.user_settings add constraint user_settings_default_currency_check
  check (default_currency in ('CRC', 'USD', 'NIC'));

alter table public.budgets drop constraint budgets_currency_check;
alter table public.budgets add constraint budgets_currency_check
  check (currency in ('CRC', 'USD', 'NIC'));
