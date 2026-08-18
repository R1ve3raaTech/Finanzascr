-- Marca cuándo se le mandó el correo de bienvenida a cada usuario, para
-- mandarlo una sola vez por cuenta. `handle_new_user()` (0001_init.sql)
-- solo inserta la fila de perfil al crearse la cuenta por primera vez —a
-- diferencia de onboarding_completed_at, que puede quedar null por varios
-- logins seguidos si el usuario no termina el paso de bienvenida— así que
-- esta columna es la señal correcta de "primer registro" y no se repite en
-- logins posteriores.
alter table public.profiles
  add column welcome_email_sent_at timestamptz;
