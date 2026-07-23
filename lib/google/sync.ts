import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshGoogleAccessToken } from "@/lib/google/token";
import { getMessage, listMessageIds } from "@/lib/google/gmail";
import { buildGmailQuery, parseEmail } from "@/lib/parsers";
import { sendPushToUser } from "@/lib/push/send";
import { formatMoney } from "@/lib/format";

export interface SyncResult {
  transactionsInserted: number;
  errors: string[];
}

export interface SyncOptions {
  admin: SupabaseClient;
  userId: string;
  refreshToken: string;
  /** Fila de gmail_tokens que se está sincronizando (un usuario puede tener varias cuentas conectadas). */
  tokenId: string;
  days?: number;
  maxResults?: number;
}

/**
 * Sincroniza los correos bancarios de una cuenta de Gmail conectada
 * puntual. Compartido entre el cron externo (/api/sync-gmail) y el botón
 * manual del dashboard. Un mismo usuario puede tener varias cuentas
 * conectadas, cada una con su propia fila en gmail_tokens.
 */
export async function syncGmailForUser({
  admin,
  userId,
  refreshToken,
  tokenId,
  days = 3,
  maxResults = 100,
}: SyncOptions): Promise<SyncResult> {
  const errors: string[] = [];
  let transactionsInserted = 0;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const ownerName = profile?.full_name ?? undefined;

  const { access_token } = await refreshGoogleAccessToken(refreshToken);
  const query = buildGmailQuery(days);
  const messageIds = await listMessageIds(access_token, query, maxResults);

  for (const id of messageIds) {
    const message = await getMessage(access_token, id);
    const parsed = parseEmail(message.bodyText, { receivedAt: message.receivedAt, ownerName });
    if (!parsed) continue;

    const { error: insertError, count } = await admin
      .from("transactions")
      .upsert(
        {
          user_id: userId,
          gmail_message_id: message.id,
          bank_name: parsed.bank_name,
          amount: parsed.amount,
          currency: parsed.currency,
          description: parsed.description,
          type: parsed.type,
          is_automated: true,
          transaction_date: parsed.transaction_date,
        },
        { onConflict: "gmail_message_id", ignoreDuplicates: true, count: "exact" }
      );

    if (insertError) {
      errors.push(`${id}: ${insertError.message}`);
    } else if (count && count > 0) {
      transactionsInserted++;
      const title = parsed.type === "INCOME" ? "Nuevo ingreso" : "Nuevo gasto";
      const body = `${parsed.bank_name} · ${formatMoney(parsed.amount, parsed.currency)} · ${parsed.description}`;
      await sendPushToUser(admin, userId, { title, body, url: "/dashboard" }).catch((err) => {
        errors.push(`push/${id}: ${(err as Error).message}`);
      });
    }
  }

  await admin
    .from("gmail_tokens")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", tokenId);

  return { transactionsInserted, errors };
}
