-- Permite conectar más de una cuenta de Gmail por usuario.
alter table public.gmail_tokens drop constraint gmail_tokens_pkey;

alter table public.gmail_tokens add column id uuid not null default gen_random_uuid();
alter table public.gmail_tokens add column email text;

-- La cuenta ya conectada hasta ahora es la misma con la que se hizo login.
update public.gmail_tokens gt
set email = u.email
from auth.users u
where u.id = gt.user_id and gt.email is null;

alter table public.gmail_tokens add primary key (id);
alter table public.gmail_tokens add constraint gmail_tokens_user_email_key unique (user_id, email);
