import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { AiSummary } from "@/components/insights/AiSummary";
import { BreakdownList } from "@/components/insights/BreakdownList";
import { BudgetProgress } from "@/components/insights/BudgetProgress";
import { CategorizeButton } from "@/components/insights/CategorizeButton";
import { MonthlyBarChart } from "@/components/insights/MonthlyBarChart";
import { SavingsGoals } from "@/components/insights/SavingsGoals";
import { SubscriptionsList } from "@/components/insights/SubscriptionsList";
import { BANK_BRAND } from "@/lib/bankBrand";
import { formatMoney } from "@/lib/format";
import {
  currentMonthKey,
  detectRecurring,
  expenseBreakdown,
  expenseByCategoryAndCurrency,
  monthlyTotals,
} from "@/lib/insights";
import { createClient } from "@/lib/supabase/server";
import type { Budget, SavingsGoal, Transaction } from "@/lib/types";

export const metadata: Metadata = { title: "Estadísticas" };

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data }, { data: budgetsData }, { data: goalsData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .limit(500),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const transactions = (data ?? []) as Transaction[];
  const budgets = (budgetsData ?? []) as Budget[];
  const goals = (goalsData ?? []) as SavingsGoal[];

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
  const uncategorizedCount = transactions.filter(
    (t) => t.is_automated && !t.category
  ).length;
  // Todo el cálculo de esta página (monthlyTotals, expenseBreakdown) descarta
  // lo que no sea colones, para no sumar peras con manzanas. Si el usuario
  // tiene movimientos en dólares hay que decírselo: si no, ve totales que no
  // le cuadran con su plata y no entiende por qué.
  const hasOtherCurrency = transactions.some((t) => t.currency !== "CRC");

  const spentByCategoryCurrency = expenseByCategoryAndCurrency(transactions, key);

  const aiSnapshot = {
    thisMonth: { income: thisMonth.income, expense: thisMonth.expense },
    lastMonth: lastMonth ? { income: lastMonth.income, expense: lastMonth.expense } : null,
    topCategories: byCategory.slice(0, 5).map((c) => ({ label: c.label, amount: c.amount })),
    budgets: budgets.map((b) => ({
      category: b.category,
      limit: b.monthly_limit,
      spent: spentByCategoryCurrency.get(`${b.category}::${b.currency}`) ?? 0,
      currency: b.currency,
    })),
    recurring: recurring
      .slice(0, 5)
      .map((r) => ({ description: r.description, amount: r.averageAmount, currency: r.currency })),
  };

  const netDelta =
    lastMonth && lastMonth.income - lastMonth.expense !== 0
      ? ((thisMonth.income - thisMonth.expense - (lastMonth.income - lastMonth.expense)) /
          Math.abs(lastMonth.income - lastMonth.expense)) *
        100
      : null;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-ground">
      <header className="border-b border-line lg:hidden">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
          <HeaderIconLink href="/dashboard" label="Volver al dashboard">
            <ArrowLeft size={18} weight="bold" />
          </HeaderIconLink>
          <h1 className="text-sm font-semibold tracking-tight text-ink">Estadísticas</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-5xl lg:px-10 lg:pt-10">
        <h1 className="hidden text-2xl font-semibold tracking-tight text-ink lg:block">Estadísticas</h1>

        <section className="animate-fade-up flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-medium text-ink-2">Este mes</h2>
            <p className="text-[11px] text-ink-3">
              {hasOtherCurrency
                ? "Solo movimientos en colones — los dólares no se incluyen."
                : "En colones."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            <div className="bg-surface/60 p-4">
              <p className="text-xs text-ink-3">Ingresos</p>
              <p className="money mt-1 font-mono text-lg text-income">
                {formatMoney(thisMonth.income, "CRC")}
              </p>
            </div>
            <div className="bg-surface/60 p-4">
              <p className="text-xs text-ink-3">Gastos</p>
              <p className="money mt-1 font-mono text-lg text-expense">
                {formatMoney(thisMonth.expense, "CRC")}
              </p>
            </div>
            <div className="bg-surface/60 p-4">
              <p className="text-xs text-ink-3">Neto</p>
              <p className="money mt-1 font-mono text-lg text-ink">
                {formatMoney(thisMonth.income - thisMonth.expense, "CRC")}
              </p>
              {netDelta !== null && (
                <p className={`text-[11px] ${netDelta >= 0 ? "text-income" : "text-expense"}`}>
                  {netDelta >= 0 ? "▲" : "▼"} {Math.abs(netDelta).toFixed(0)}% vs mes pasado
                </p>
              )}
            </div>
          </div>
        </section>

        <AiSummary snapshot={aiSnapshot} />

        <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:60ms]">
          <h2 className="mb-4 text-sm font-medium text-ink-2">Metas de ahorro</h2>
          <SavingsGoals goals={goals} transactions={transactions} />
        </section>

        <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:90ms]">
          <h2 className="mb-4 text-sm font-medium text-ink-2">Últimos 6 meses</h2>
          <MonthlyBarChart data={months} />
        </section>

        {/* En mobile estas cuatro secciones van apiladas, una por fila. En
            escritorio hay ancho de sobra para emparejarlas de a dos y que no
            quede una sola columna larguísima y vacía a los costados. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:120ms]">
            <h2 className="mb-4 text-sm font-medium text-ink-2">Gasto por entidad este mes</h2>
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

          <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:180ms]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-ink-2">Gasto por categoría este mes</h2>
              <CategorizeButton pendingCount={uncategorizedCount} />
            </div>
            <BreakdownList items={byCategory} emptyLabel="Todavía no hay gastos categorizados este mes." />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:240ms]">
            <h2 className="mb-4 text-sm font-medium text-ink-2">Presupuestos</h2>
            <BudgetProgress budgets={budgets} spentByCategoryCurrency={spentByCategoryCurrency} />
          </section>

          <section className="animate-fade-up rounded-2xl border border-line bg-surface/40 p-5 [animation-delay:300ms]">
            <h2 className="mb-4 text-sm font-medium text-ink-2">Gastos recurrentes</h2>
            <SubscriptionsList items={recurring} />
          </section>
        </div>
      </div>
    </main>
  );
}
