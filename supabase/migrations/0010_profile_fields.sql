-- Campos editables del perfil: foto propia (no la de Google) y fecha de
-- nacimiento. full_name ya existía.
alter table public.profiles
  add column avatar_url text,
  add column birth_date date;

-- Bucket de Storage para fotos de perfil. Público de lectura (son avatares,
-- no datos sensibles) pero cada usuario solo puede escribir/borrar dentro de
-- su propia carpeta "{user_id}/...".
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Cualquiera puede ver los avatares"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Los usuarios suben su propio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios reemplazan su propio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios borran su propio avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
