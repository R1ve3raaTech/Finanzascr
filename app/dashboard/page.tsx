import { redirect } from "next/navigation";
import { ChartBar, GearSix } from "@phosphor-icons/react/dist/ssr";
import { AddCashModal } from "@/components/dashboard/AddCashModal";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { SyncGmailButton } from "@/components/dashboard/SyncGmailButton";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Logo } from "@/components/Logo";
import { endOfDayISO, startOfDayISO } from "@/lib/dateRange";
import { createClient } from "@/lib/supabase/server";
import type { Currency, Transaction, UserCategory } from "@/lib/types";

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

  transactionsQuery = hasRange
    ? transactionsQuery
        .gte("transaction_date", startOfDayISO(from!))
        .lte("transaction_date", endOfDayISO(to!))
        .limit(300)
    : transactionsQuery.limit(50);

  const [{ data }, { data: settings }, { data: categories }, { data: profile }] =
    await Promise.all([
      transactionsQuery,
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
  for (const t of transactions) {
    balance[t.currency] += t.type === "INCOME" ? t.amount : -t.amount;
  }

  const fullName =
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? user.email;
  const firstName = fullName?.split(" ")[0];
  const avatarUrl =
    profile?.avatar_url ??
    ((user.user_metadata?.avatar_url ?? user.user_metadata?.picture) as string | undefined);

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <HeaderIconLink href="/dashboard/settings" label="Ajustes" hoverRotate={45}>
              <GearSix size={18} weight="bold" />
            </HeaderIconLink>
            <Logo />
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <HeaderIconLink href="/dashboard/insights" label="Estadísticas" showLabel>
              <ChartBar size={14} weight="bold" />
            </HeaderIconLink>
            <SyncGmailButton />
            <SignOutButton />
            <ProfileAvatar avatarUrl={avatarUrl} name={firstName} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-10">
        <DateRangeFilter />

        <BalanceCard crc={balance.CRC} usd={balance.USD} filtered={hasRange} />

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-zinc-400">
            {hasRange ? "Movimientos del período" : "Últimas transacciones"}
          </h2>
          <TransactionList transactions={transactions} />
        </section>
      </div>

      <AddCashModal defaultCurrency={defaultCurrency} customCategories={userCategories} />
    </main>
  );
}
