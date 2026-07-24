"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncGmailForUser } from "@/lib/google/sync";
import { sendPushToUser } from "@/lib/push/send";
import { categorizeTransactions } from "@/lib/ai/categorize";
import { formatMoney } from "@/lib/format";
import { checkRateLimit } from "@/lib/rateLimit";
import { decryptToken } from "@/lib/tokenCrypto";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/categories";
import type { Currency, TransactionType } from "@/lib/types";

/**
 * Avisa por push la primera vez que un gasto categorizado hace que el mes
 * se pase del presupuesto de esa categoría (no en cada gasto siguiente).
 */
async function checkBudgetAndNotify(
  userId: string,
  category: string,
  currency: Currency,
  justSpent: number
) {
  const admin = createAdminClient();
  const { data: budget } = await admin
    .from("budgets")
    .select("monthly_limit, currency")
    .eq("user_id", userId)
    .eq("category", category)
    .maybeSingle();
  if (!budget || budget.currency !== currency) return;

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { data: rows } = await admin
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("category", category)
    .eq("type", "EXPENSE")
    .eq("currency", currency)
    .gte("transaction_date", start.toISOString());

  const spent = (rows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const spentBefore = spent - justSpent;

  if (spent > budget.monthly_limit && spentBefore <= budget.monthly_limit) {
    await sendPushToUser(admin, userId, {
      title: "Te pasaste del presupuesto",
      body: `${category}: ${formatMoney(spent, currency)} de ${formatMoney(budget.monthly_limit, currency)} este mes.`,
      url: "/dashboard/insights",
    }).catch(() => {});
  }
}

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

  if (input.type === "EXPENSE" && input.category) {
    await checkBudgetAndNotify(user.id, input.category, input.currency, input.amount);
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

  const rateLimit = await checkRateLimit(admin, user.id, "sync_gmail", {
    maxCalls: 1,
    windowSeconds: 30,
  });
  if (!rateLimit.allowed) {
    return {
      error: `Espera ${rateLimit.retryAfterSeconds}s antes de volver a leer los correos.`,
      inserted: 0,
    };
  }

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
  let hadError = false;
  // Cada cuenta conectada es independiente entre sí — sincronizarlas en
  // paralelo en vez de una por una acelera mucho el botón cuando hay
  // varias cuentas de Gmail conectadas.
  const results = await Promise.allSettled(
    tokenRows.map((row) =>
      syncGmailForUser({
        admin,
        userId: user.id,
        refreshToken: decryptToken(row.refresh_token),
        tokenId: row.id,
      })
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      inserted += result.value.transactionsInserted;
      if (result.value.errors.length > 0) {
        hadError = true;
        console.error("[syncMyGmail]", result.value.errors);
      }
    } else {
      hadError = true;
      console.error("[syncMyGmail]", result.reason);
    }
  }

  revalidatePath("/dashboard");
  return { error: hadError ? "Hubo un error. Volvé a intentarlo." : null, inserted };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Hubo un error. Volvé a intentarlo." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insights");
  return { error: null };
}

export async function categorizeUncategorized() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const admin = createAdminClient();

  const rateLimit = await checkRateLimit(admin, user.id, "categorize_ai", {
    maxCalls: 1,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return {
      error: `Espera ${rateLimit.retryAfterSeconds}s antes de volver a categorizar.`,
      updated: 0,
    };
  }

  const [{ data: pending }, { data: customCategories }] = await Promise.all([
    admin
      .from("transactions")
      .select("id, bank_name, description, amount, currency, type")
      .eq("user_id", user.id)
      .eq("is_automated", true)
      .is("category", null),
    admin.from("user_categories").select("name, type").eq("user_id", user.id),
  ]);

  const rows = pending ?? [];
  if (rows.length === 0) {
    return { error: null, updated: 0 };
  }

  const expenseCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...(customCategories ?? []).filter((c) => c.type === "EXPENSE").map((c) => c.name),
  ];
  const incomeCategories = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...(customCategories ?? []).filter((c) => c.type === "INCOME").map((c) => c.name),
  ];

  const expenseRows = rows.filter((r) => r.type === "EXPENSE");
  const incomeRows = rows.filter((r) => r.type === "INCOME");

  let assignments = new Map<string, string>();
  try {
    const [expenseResults, incomeResults] = await Promise.all([
      categorizeTransactions(expenseRows, expenseCategories),
      categorizeTransactions(incomeRows, incomeCategories),
    ]);
    assignments = new Map([...expenseResults, ...incomeResults]);
  } catch (err) {
    console.error("[categorizeUncategorized]", err);
    return { error: "Hubo un error. Volvé a intentarlo.", updated: 0 };
  }

  if (assignments.size === 0) {
    return { error: null, updated: 0 };
  }

  let updated = 0;
  await Promise.all(
    Array.from(assignments.entries()).map(async ([id, category]) => {
      const { error } = await admin.from("transactions").update({ category }).eq("id", id);
      if (!error) updated++;
    })
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insights");
  return { error: null, updated };
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
