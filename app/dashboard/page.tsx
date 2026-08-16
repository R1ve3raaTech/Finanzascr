import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChartBar, GearSix } from "@phosphor-icons/react/dist/ssr";
import { AddCashModal } from "@/components/dashboard/AddCashModal";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Logo } from "@/components/Logo";
import { MonthlyBarChart } from "@/components/insights/MonthlyBarChart";
import { endOfDayISO, startOfDayISO } from "@/lib/dateRange";
import { monthlyTotals } from "@/lib/insights";
import { resolveAvatarUrl, resolveFirstName } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { Currency, Transaction, UserCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const hasRange = Boolean(from && to);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: onboarding } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!onboarding?.onboarding_completed_at) redirect("/bienvenida");

  let transactionsQuery = supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  // El saldo se calcula con una consulta aparte, sin el límite de la lista
  // visible: antes se sumaba solo sobre las transacciones ya traídas (50 o
  // 300), así que en cuanto había más movimientos que ese límite el saldo
  // mostrado quedaba corto (ignoraba los movimientos más viejos).
  let balanceQuery = supabase
    .from("transactions")
    .select("amount, currency, type, transaction_date");

  if (hasRange) {
    transactionsQuery = transactionsQuery
      .gte("transaction_date", startOfDayISO(from!))
      .lte("transaction_date", endOfDayISO(to!))
      .limit(300);
    balanceQuery = balanceQuery
      .gte("transaction_date", startOfDayISO(from!))
      .lte("transaction_date", endOfDayISO(to!));
  } else {
    transactionsQuery = transactionsQuery.limit(50);
  }

  const [{ data }, { data: balanceRows }, { data: settings }, { data: categories }, { data: profile }] =
    await Promise.all([
      transactionsQuery,
      balanceQuery,
      supabase
        .from("user_settings")
        .select("default_currency")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    ]);

  const transactions = (data ?? []) as Transaction[];
  const userCategories = (categories ?? []) as UserCategory[];
  const defaultCurrency: Currency = settings?.default_currency ?? "CRC";

  const balance = { CRC: 0, USD: 0 };
  // Ingresos y gastos del mes en curso, en la moneda por defecto del usuario:
  // el saldo consolidado responde "cuánto tengo", pero lo que uno mira todos
  // los días es "cuánto entró y cuánto se fue este mes".
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const month = { currency: defaultCurrency, income: 0, expense: 0 };

  for (const t of balanceRows ?? []) {
    balance[t.currency as Currency] += t.type === "INCOME" ? t.amount : -t.amount;

    if (t.currency === defaultCurrency && new Date(t.transaction_date) >= monthStart) {
      if (t.type === "INCOME") month.income += t.amount;
      else month.expense += t.amount;
    }
  }

  const firstName = resolveFirstName(user, profile?.full_name);
  const avatarUrl = resolveAvatarUrl(user, profile?.avatar_url);

  // Gráfico chico de los últimos 6 meses, solo para la columna lateral de
  // escritorio (ver TransactionList/gráfico más abajo). Reusa las mismas
  // filas ya traídas para el saldo — no hace falta pedirle a la base el
  // historial de nuevo.
  const months = monthlyTotals((balanceRows ?? []) as Transaction[], 6);

  return (
    <main className="flex min-h-[100dvh] flex-col bg-ground">
      <header className="border-b border-line lg:hidden">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <HeaderIconLink href="/dashboard/settings" label="Ajustes" hoverRotate={45}>
              <GearSix size={18} weight="bold" />
            </HeaderIconLink>
            <Link href="/" aria-label="Ir a la landing de TicoFinanza">
              <Logo />
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <HeaderIconLink href="/dashboard/insights" label="Estadísticas" showLabel>
              <ChartBar size={14} weight="bold" />
            </HeaderIconLink>
            <InstallAppButton />
            <SignOutButton />
            <ProfileAvatar avatarUrl={avatarUrl} name={firstName} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-10 lg:max-w-5xl lg:px-10 lg:pt-10">
        <h1 className="hidden text-2xl font-semibold tracking-tight text-ink lg:block">Dashboard</h1>

        <DateRangeFilter />

        <BalanceCard
          crc={balance.CRC}
          usd={balance.USD}
          filtered={hasRange}
          month={hasRange ? undefined : month}
        />

        {/* En escritorio la lista y el gráfico van uno al lado del otro; en
            mobile el gráfico chico se esconde (ya hay una versión completa
            en Estadísticas — acá solo hay lugar de sobra para mostrarlo). */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <section className="flex min-w-0 flex-1 flex-col">
            <TransactionList
              title={hasRange ? "Movimientos del período" : "Últimas transacciones"}
              transactions={transactions}
              customCategories={userCategories}
            />
          </section>

          {!hasRange && (
            <aside className="hidden w-[320px] shrink-0 flex-col gap-3 rounded-2xl border border-line bg-surface/40 p-5 lg:flex">
              <h2 className="text-sm font-medium text-ink-2">Últimos 6 meses</h2>
              <MonthlyBarChart data={months} />
            </aside>
          )}
        </div>
      </div>

      <AddCashModal defaultCurrency={defaultCurrency} customCategories={userCategories} />
    </main>
  );
}
