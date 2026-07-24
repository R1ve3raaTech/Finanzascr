-- Pantalla de bienvenida la primera vez que alguien entra: se marca
-- onboarding_completed_at cuando termina (o se la salta) para no volver a
-- mostrarla. Aprovechamos también para que el trigger de creación de
-- perfil copie la foto de Google si vino en el id_token, no solo el nombre.
alter table public.profiles
  add column onboarding_completed_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;
