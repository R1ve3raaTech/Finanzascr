-- Para avisar por push cuando una cuenta de Gmail conectada deja de traer
-- movimientos automáticos (el banco cambió el formato del correo, dejó de
-- enviarlo, etc.). Guardamos cuándo se mandó el último aviso para no
-- repetirlo todos los días mientras el problema siga sin resolverse.
alter table public.gmail_tokens
  add column last_stale_reminder_at timestamptz;
