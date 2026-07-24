import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CurrencyCircleDollar,
  DownloadSimple,
  EnvelopeSimple,
  ShieldCheck,
  Tag,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { BudgetManager } from "@/components/settings/BudgetManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { CurrencySetting } from "@/components/settings/CurrencySetting";
import { DangerZone } from "@/components/settings/DangerZone";
import { GmailConnections } from "@/components/settings/GmailConnections";
import { NotificationsSetting } from "@/components/settings/NotificationsSetting";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/categories";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Budget, UserCategory, UserSettings } from "@/lib/types";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail_connected?: string; gmail_error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const params = await searchParams;
  const admin = createAdminClient();

  const [
    { data: settings },
    { data: categories },
    { data: gmailConnections },
    { data: budgets },
    { count: transactionCount },
  ] = await Promise.all([
    supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    admin
      .from("gmail_tokens")
      .select("id, email, last_synced_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: true }),
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const budgetCategories = [
    ...new Set([
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...(categories ?? []).filter((c) => c.type === "EXPENSE").map((c) => c.name),
    ]),
  ];

  const resolvedSettings: Pick<UserSettings, "default_currency"> =
    settings ?? { default_currency: "CRC" };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
          <HeaderIconLink href="/dashboard" label="Volver al dashboard">
            <ArrowLeft size={18} weight="bold" />
          </HeaderIconLink>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-50">Ajustes</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {params.gmail_connected && (
          <p className="animate-fade-up rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
            Cuenta de Gmail conectada correctamente.
          </p>
        )}
        {params.gmail_error && (
          <p className="animate-fade-up rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">
            No se pudo conectar la cuenta de Gmail. Intentá de nuevo.
          </p>
        )}

        <SettingsSection icon={Tag} accent="violet" delayMs={0}>
          <CategoryManager categories={(categories ?? []) as UserCategory[]} />
        </SettingsSection>

        <SettingsSection icon={Wallet} accent="amber" delayMs={40}>
          <BudgetManager budgets={(budgets ?? []) as Budget[]} categories={budgetCategories} />
        </SettingsSection>

        <SettingsSection icon={CurrencyCircleDollar} accent="emerald" delayMs={80}>
          <CurrencySetting initial={resolvedSettings.default_currency} />
        </SettingsSection>

        <SettingsSection icon={Bell} accent="sky" delayMs={120}>
          <NotificationsSetting />
        </SettingsSection>

        <SettingsSection icon={EnvelopeSimple} accent="sky" delayMs={160}>
          <GmailConnections connections={gmailConnections ?? []} />
        </SettingsSection>

        <a
          href="/api/export-csv"
          className="animate-fade-up flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-100 [animation-delay:200ms]"
        >
          <DownloadSimple size={16} weight="bold" />
          Exportar transacciones a CSV
        </a>

        <section className="animate-fade-up rounded-2xl border border-rose-400/15 bg-zinc-900/40 p-5 [animation-delay:240ms]">
          <DangerZone transactionCount={transactionCount ?? 0} />
        </section>

        <Link
          href="/privacidad"
          className="animate-fade-up flex items-center justify-center gap-2 py-2 text-xs text-zinc-600 transition-colors hover:text-zinc-400 [animation-delay:260ms]"
        >
          <ShieldCheck size={14} weight="bold" />
          Política de privacidad
        </Link>
      </div>
    </main>
  );
}
