import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { BreakdownList } from "@/components/insights/BreakdownList";
import { BudgetProgress } from "@/components/insights/BudgetProgress";
import { MonthlyBarChart } from "@/components/insights/MonthlyBarChart";
import { SubscriptionsList } from "@/components/insights/SubscriptionsList";
import { BANK_BRAND } from "@/lib/bankBrand";
import { formatMoney } from "@/lib/format";
import {
  currentMonthKey,
  detectRecurring,
  expenseBreakdown,
  monthlyTotals,
} from "@/lib/insights";
import { createClient } from "@/lib/supabase/server";
import type { Budget, Transaction } from "@/lib/types";

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data }, { data: budgetsData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .limit(500),
    supabase.from("budgets").select("*").eq("user_id", user.id),
  ]);

  const transactions = (data ?? []) as Transaction[];
  const budgets = (budgetsData ?? []) as Budget[];

  const months = monthlyTotals(transactions, 6);
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];
  const key = currentMonthKey();

  const byEntity = expenseBreakdown(transactions, (t) => t.bank_name, key);
  const byCategory = expenseBreakdown(
    transactions,
    (t) => t.category ?? "Sin categoría",
    key
  );
  const recurring = detectRecurring(transactions);

  const spentByCategory = new Map<string, number>();
  for (const item of byCategory) spentByCategory.set(item.label, item.amount);

  const netDelta =
    lastMonth && lastMonth.income - lastMonth.expense !== 0
      ? ((thisMonth.income - thisMonth.expense - (lastMonth.income - lastMonth.expense)) /
          Math.abs(lastMonth.income - lastMonth.expense)) *
        100
      : null;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center gap-3 px-6">
          <HeaderIconLink href="/dashboard" label="Volver al dashboard">
            <ArrowLeft size={18} weight="bold" />
          </HeaderIconLink>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-50">Estadísticas</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="animate-fade-up grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500">Ingresos</p>
            <p className="mt-1 font-mono text-lg text-emerald-400">
              {formatMoney(thisMonth.income, "CRC")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500">Gastos</p>
            <p className="mt-1 font-mono text-lg text-rose-400">
              {formatMoney(thisMonth.expense, "CRC")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500">Neto</p>
            <p className="mt-1 font-mono text-lg text-zinc-50">
              {formatMoney(thisMonth.income - thisMonth.expense, "CRC")}
            </p>
            {netDelta !== null && (
              <p className={`text-[11px] ${netDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {netDelta >= 0 ? "▲" : "▼"} {Math.abs(netDelta).toFixed(0)}% vs mes pasado
              </p>
            )}
          </div>
        </section>

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:60ms]">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">Últimos 6 meses (₡)</h2>
          <MonthlyBarChart data={months} />
        </section>

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:120ms]">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">Gasto por entidad este mes</h2>
          <BreakdownList
            items={byEntity}
            colorMap={Object.fromEntries(
              byEntity.map((item) => [
                item.label,
                BANK_BRAND[item.label as keyof typeof BANK_BRAND]?.bg ?? "#3f3f46",
              ])
            )}
            emptyLabel="Todavía no hay gastos este mes."
          />
        </section>

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:180ms]">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">Gasto por categoría este mes</h2>
          <BreakdownList items={byCategory} emptyLabel="Todavía no hay gastos categorizados este mes." />
        </section>

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:240ms]">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">Presupuestos</h2>
          <BudgetProgress budgets={budgets} spentByCategory={spentByCategory} />
        </section>

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:300ms]">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">Gastos recurrentes</h2>
          <SubscriptionsList items={recurring} />
        </section>
      </div>
    </main>
  );
}
