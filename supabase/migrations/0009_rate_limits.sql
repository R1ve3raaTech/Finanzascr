-- Límite simple de tasa por usuario/acción, para evitar que alguien le dé
-- sin parar al botón de "Leer correos" o de "Categorizar con IA" y genere
-- costo/consumo de cuota innecesario. Solo se toca desde el server con la
-- service_role key (como gmail_tokens), no hace falta política de cliente.
create table public.action_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  window_start timestamptz not null default now(),
  count int not null default 0,
  primary key (user_id, action)
);

alter table public.action_rate_limits enable row level security;
