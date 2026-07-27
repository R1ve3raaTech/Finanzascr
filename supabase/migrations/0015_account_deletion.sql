-- Eliminación permanente de cuenta: código de un solo uso enviado por
-- correo, igual que action_rate_limits solo se toca desde el server con la
-- service_role key, no hace falta política de cliente.
create table public.account_deletion_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.account_deletion_codes enable row level security;

create index account_deletion_codes_user_id_idx on public.account_deletion_codes (user_id);

-- Estas cuatro tablas quedaron sin "on delete cascade" cuando se crearon —
-- si no se arregla, borrar un usuario con auth.admin.deleteUser() falla con
-- una violación de foreign key en vez de limpiar todo en cascada. Se busca
-- el nombre real de cada constraint en vez de asumirlo, por si Postgres no
-- generó el nombre por defecto que se esperaría.
do $$
declare
  t text;
  cname text;
begin
  foreach t in array array['push_subscriptions', 'user_settings', 'user_categories', 'budgets']
  loop
    select conname into cname
    from pg_constraint
    where conrelid = ('public.' || t)::regclass
      and contype = 'f'
      and conname like '%user_id%';

    if cname is not null then
      execute format('alter table public.%I drop constraint %I', t, cname);
    end if;

    execute format(
      'alter table public.%I add constraint %I_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade',
      t, t
    );
  end loop;
end $$;
