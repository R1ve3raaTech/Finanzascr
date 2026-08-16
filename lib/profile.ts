import type { User } from "@supabase/supabase-js";

type MinimalUser = Pick<User, "email" | "user_metadata">;

/**
 * El nombre para mostrar sigue la misma cadena de respaldo en dashboard,
 * ajustes y ahora la barra lateral — perfil guardado, si no el de Google,
 * si no el correo. Vivía copiada en cada page.tsx; se movió acá para que
 * las tres coincidan siempre y no se desincronicen con el tiempo.
 */
export function resolveDisplayName(user: MinimalUser, profileFullName?: string | null): string | undefined {
  return (
    profileFullName ?? (user.user_metadata?.full_name as string | undefined) ?? user.email ?? undefined
  );
}

export function resolveFirstName(user: MinimalUser, profileFullName?: string | null): string | undefined {
  return resolveDisplayName(user, profileFullName)?.split(" ")[0];
}

export function resolveAvatarUrl(user: MinimalUser, profileAvatarUrl?: string | null): string | undefined {
  return (
    profileAvatarUrl ??
    ((user.user_metadata?.avatar_url ?? user.user_metadata?.picture) as string | undefined)
  );
}
