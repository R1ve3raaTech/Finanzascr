-- Agrega Banco Popular (BP) a los bancos permitidos.
alter table public.transactions
  drop constraint transactions_bank_name_check;

alter table public.transactions
  add constraint transactions_bank_name_check check (
    bank_name in ('BAC', 'BCR', 'BNCR', 'Promerica', 'Davivienda', 'BP', 'SINPE', 'Efectivo', 'Otro')
  );

-- Guarda el refresh token de Google por usuario para poder leer Gmail
-- en background (cron), sin depender de que el usuario tenga sesión activa.
create table public.gmail_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  access_token text,
  access_token_expires_at timestamptz,
  last_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.gmail_tokens enable row level security;

-- Solo el propio usuario puede escribir su token (se guarda desde el callback
-- de login, con la sesión del usuario). La lectura para el cron de sincronización
-- se hace con la service_role key, que ignora RLS: no hace falta política de select.
create policy "Los usuarios insertan su propio token"
  on public.gmail_tokens for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios actualizan su propio token"
  on public.gmail_tokens for update
  using (auth.uid() = user_id);
