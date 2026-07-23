-- Perfiles de usuario (1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Transacciones (automáticas desde Gmail o manuales en efectivo)
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gmail_message_id text unique,
  bank_name text not null check (
    bank_name in ('BAC', 'BCR', 'BNCR', 'Promerica', 'Davivienda', 'SINPE', 'Efectivo', 'Otro')
  ),
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null check (currency in ('CRC', 'USD')),
  description text,
  category text,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  is_automated boolean not null default true,
  transaction_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

alter table public.transactions enable row level security;

create policy "Los usuarios ven sus transacciones"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Los usuarios insertan sus transacciones"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan sus transacciones"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Los usuarios eliminan sus transacciones"
  on public.transactions for delete
  using (auth.uid() = user_id);
