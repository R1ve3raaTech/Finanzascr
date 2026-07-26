-- Metas de ahorro: el progreso se calcula solo (ingresos menos gastos en la
-- moneda de la meta desde que se creó), no hay "aportes" manuales que
-- registrar — por eso la tabla no necesita más que el objetivo en sí.
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  currency text not null check (currency in ('CRC', 'USD', 'NIC')),
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.savings_goals enable row level security;

create policy "Los usuarios ven sus metas"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Los usuarios crean sus metas"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan sus metas"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Los usuarios eliminan sus metas"
  on public.savings_goals for delete
  using (auth.uid() = user_id);
