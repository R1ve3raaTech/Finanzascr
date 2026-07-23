import { redirect } from "next/navigation";
import { ChartBar, GearSix } from "@phosphor-icons/react/dist/ssr";
import { AddCashModal } from "@/components/dashboard/AddCashModal";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { SyncGmailButton } from "@/components/dashboard/SyncGmailButton";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import type { Currency, Transaction, UserCategory } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data }, { data: settings }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .limit(50),
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
  ]);

  const transactions = (data ?? []) as Transaction[];
  const userCategories = (categories ?? []) as UserCategory[];
  const defaultCurrency: Currency = settings?.default_currency ?? "CRC";

  const balance = { CRC: 0, USD: 0 };
  for (const t of transactions) {
    balance[t.currency] += t.type === "INCOME" ? t.amount : -t.amount;
  }

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user.email;
  const avatarUrl = (user.user_metadata?.avatar_url ??
    user.user_metadata?.picture) as string | undefined;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <HeaderIconLink href="/dashboard/settings" label="Ajustes" hoverRotate={45}>
              <GearSix size={18} weight="bold" />
            </HeaderIconLink>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <HeaderIconLink href="/dashboard/insights" label="Estadísticas">
              <ChartBar size={18} weight="bold" />
            </HeaderIconLink>
            <SyncGmailButton />
            <SignOutButton />
            <ProfileAvatar avatarUrl={avatarUrl} name={firstName} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <BalanceCard crc={balance.CRC} usd={balance.USD} />

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-zinc-400">
            Últimas transacciones
          </h2>
          <TransactionList transactions={transactions} />
        </section>
      </div>

      <AddCashModal defaultCurrency={defaultCurrency} customCategories={userCategories} />
    </main>
  );
}
