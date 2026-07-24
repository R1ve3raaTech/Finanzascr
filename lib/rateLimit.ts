import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

interface RateLimitOptions {
  maxCalls: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Solo si allowed es false. */
  retryAfterSeconds?: number;
}

/**
 * Límite simple de tasa por usuario/acción sobre una tabla de Postgres.
 * No es perfectamente atómico bajo carrera (lee, decide, escribe), pero para
 * un botón que un usuario aprieta a mano alcanza de sobra.
 */
export async function checkRateLimit(
  admin: SupabaseClient,
  userId: string,
  action: string,
  { maxCalls, windowSeconds }: RateLimitOptions
): Promise<RateLimitResult> {
  const { data: row } = await admin
    .from("action_rate_limits")
    .select("window_start, count")
    .eq("user_id", userId)
    .eq("action", action)
    .maybeSingle();

  const now = new Date();

  if (!row) {
    await admin
      .from("action_rate_limits")
      .insert({ user_id: userId, action, window_start: now.toISOString(), count: 1 });
    return { allowed: true };
  }

  const elapsedSeconds = (now.getTime() - new Date(row.window_start).getTime()) / 1000;

  if (elapsedSeconds >= windowSeconds) {
    await admin
      .from("action_rate_limits")
      .update({ window_start: now.toISOString(), count: 1 })
      .eq("user_id", userId)
      .eq("action", action);
    return { allowed: true };
  }

  if (row.count < maxCalls) {
    await admin
      .from("action_rate_limits")
      .update({ count: row.count + 1 })
      .eq("user_id", userId)
      .eq("action", action);
    return { allowed: true };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil(windowSeconds - elapsedSeconds) };
}
