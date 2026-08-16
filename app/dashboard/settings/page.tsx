import type { Metadata } from "next";
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
  User,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { BudgetManager } from "@/components/settings/BudgetManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { CurrencySetting } from "@/components/settings/CurrencySetting";
import { DangerZone } from "@/components/settings/DangerZone";
import { DeleteAccountFlow } from "@/components/settings/DeleteAccountFlow";
import { GmailConnections } from "@/components/settings/GmailConnections";
import { NotificationsSetting } from "@/components/settings/NotificationsSetting";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { InstallAppButton } from "@/components/InstallAppButton";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/categories";
import { resolveAvatarUrl, resolveDisplayName } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Budget, UserCategory, UserSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Ajustes" };

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
    { data: profile },
    { data: settings },
    { data: categories },
    { data: gmailConnections },
    { data: budgets },
    { count: transactionCount },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url, birth_date").eq("id", user.id).maybeSingle(),
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

  const initialFullName = resolveDisplayName(user, profile?.full_name) ?? "";
  const initialAvatarUrl = resolveAvatarUrl(user, profile?.avatar_url) ?? null;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-ground">
      <header className="border-b border-line lg:hidden">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <HeaderIconLink href="/dashboard" label="Volver al dashboard">
              <ArrowLeft size={18} weight="bold" />
            </HeaderIconLink>
            <h1 className="truncate text-sm font-semibold tracking-tight text-ink">Ajustes</h1>
          </div>
          <InstallAppButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-3xl lg:px-10 lg:pt-10">
        <h1 className="hidden text-2xl font-semibold tracking-tight text-ink lg:block">Ajustes</h1>

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

        <SettingsGroup label="Cuenta" delayMs={0}>
          <SettingsSection icon={User}>
            <ProfileSettings
              userId={user.id}
              initialFullName={initialFullName}
              initialBirthDate={profile?.birth_date ?? null}
              initialAvatarUrl={initialAvatarUrl}
            />
          </SettingsSection>
        </SettingsGroup>

        <SettingsGroup label="Dinero" delayMs={60}>
          <SettingsSection icon={Tag}>
            <CategoryManager categories={(categories ?? []) as UserCategory[]} />
          </SettingsSection>
          <SettingsSection icon={Wallet}>
            <BudgetManager budgets={(budgets ?? []) as Budget[]} categories={budgetCategories} />
          </SettingsSection>
          <SettingsSection icon={CurrencyCircleDollar}>
            <CurrencySetting initial={resolvedSettings.default_currency} />
          </SettingsSection>
        </SettingsGroup>

        <SettingsGroup label="Alertas y correo" delayMs={140}>
          <SettingsSection icon={Bell}>
            <NotificationsSetting />
          </SettingsSection>
          <SettingsSection icon={EnvelopeSimple}>
            <GmailConnections connections={gmailConnections ?? []} />
          </SettingsSection>
        </SettingsGroup>

        <SettingsGroup label="Datos" delayMs={220}>
          <SettingsSection icon={DownloadSimple}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-ink">Exportar tus datos</h3>
                <p className="text-xs text-ink-3">
                  Bajate todos tus movimientos en un CSV que abre Excel o Google Sheets.
                </p>
              </div>
              <a
                href="/api/export-csv"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
              >
                <DownloadSimple size={14} weight="bold" />
                Descargar CSV
              </a>
            </div>
          </SettingsSection>
        </SettingsGroup>

        {/* Lo destructivo va en su propio grupo y no mezclado con "Datos":
            que comparta encabezado con una descarga inofensiva es justo cómo
            alguien borra su cuenta sin querer. */}
        <SettingsGroup label="Zona de peligro" delayMs={280}>
          <section className="flex flex-col gap-5 divide-y divide-expense/10 rounded-2xl border border-expense/20 bg-expense/[0.03] p-5">
            <DangerZone transactionCount={transactionCount ?? 0} />
            <div className="pt-5">
              <DeleteAccountFlow email={user.email ?? ""} />
            </div>
          </section>
        </SettingsGroup>

        <Link
          href="/privacidad"
          className="animate-fade-up flex items-center justify-center gap-2 py-2 text-xs text-ink-3 transition-colors hover:text-ink-2 [animation-delay:340ms]"
        >
          <ShieldCheck size={14} weight="bold" />
          Política de privacidad
        </Link>
      </div>
    </main>
  );
}
