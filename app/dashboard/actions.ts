"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncGmailForUser } from "@/lib/google/sync";
import type { Currency, TransactionType } from "@/lib/types";

export async function addCashTransaction(input: {
  amount: number;
  currency: Currency;
  description: string;
  category: string;
  type: TransactionType;
  transactionDate: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { error: "El monto debe ser mayor a cero." };
  }

  const transactionDate = new Date(input.transactionDate);
  if (Number.isNaN(transactionDate.getTime())) {
    return { error: "La fecha no es válida." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    bank_name: "Efectivo",
    amount: input.amount,
    currency: input.currency,
    description: input.description || null,
    category: input.category || null,
    type: input.type,
    is_automated: false,
    transaction_date: transactionDate.toISOString(),
  });

  if (error) {
    return { error: "No se pudo guardar la transacción. Intentá de nuevo." };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function syncMyGmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const admin = createAdminClient();
  const { data: tokenRows, error: tokenError } = await admin
    .from("gmail_tokens")
    .select("id, refresh_token")
    .eq("user_id", user.id);

  if (tokenError || !tokenRows || tokenRows.length === 0) {
    return {
      error:
        "No encontramos tu conexión con Gmail. Volvé a iniciar sesión con Google para reconectarla.",
      inserted: 0,
    };
  }

  let inserted = 0;
  const errors: string[] = [];
  for (const row of tokenRows) {
    try {
      const result = await syncGmailForUser({
        admin,
        userId: user.id,
        refreshToken: row.refresh_token,
        tokenId: row.id,
      });
      inserted += result.transactionsInserted;
      errors.push(...result.errors);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  revalidatePath("/dashboard");
  return { error: errors.length > 0 ? errors[0] : null, inserted };
}

export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  return { error: error ? "No se pudieron activar las notificaciones." : null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
