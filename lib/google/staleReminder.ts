import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/send";

const STALE_DAYS = 7;

/**
 * Si una cuenta de Gmail conectada llevaba movimientos automáticos y de
 * repente dejaron de llegar (el banco cambió el formato del correo, dejó de
 * mandarlo, se venció el permiso, etc.), avisamos por push. Solo se activa
 * si esa cuenta ya tuvo al menos un movimiento automático alguna vez, para
 * no molestar a alguien recién conectado que legítimamente tiene pocos
 * correos bancarios todavía.
 */
export async function checkStaleSyncAndNotify(
  admin: SupabaseClient,
  userId: string,
  tokenId: string,
  lastStaleReminderAt: string | null
): Promise<void> {
  const { data: lastTx } = await admin
    .from("transactions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("is_automated", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastTx) return;

  const daysSince = (Date.now() - new Date(lastTx.created_at).getTime()) / 86_400_000;

  if (daysSince < STALE_DAYS) {
    if (lastStaleReminderAt) {
      await admin
        .from("gmail_tokens")
        .update({ last_stale_reminder_at: null })
        .eq("id", tokenId);
    }
    return;
  }

  const daysSinceLastReminder = lastStaleReminderAt
    ? (Date.now() - new Date(lastStaleReminderAt).getTime()) / 86_400_000
    : Infinity;
  if (daysSinceLastReminder < STALE_DAYS) return;

  await sendPushToUser(admin, userId, {
    title: "¿Todo bien con tu banco?",
    body: `No detectamos movimientos automáticos hace ${Math.floor(daysSince)} días. Puede que tu banco haya cambiado el formato de sus correos — revisá o agregalos a mano mientras tanto.`,
    url: "/dashboard",
  });

  await admin
    .from("gmail_tokens")
    .update({ last_stale_reminder_at: new Date().toISOString() })
    .eq("id", tokenId);
}
