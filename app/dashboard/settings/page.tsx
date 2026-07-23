import { redirect } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { CurrencySetting } from "@/components/settings/CurrencySetting";
import { GmailConnections } from "@/components/settings/GmailConnections";
import { NotificationsSetting } from "@/components/settings/NotificationsSetting";
import { HeaderIconLink } from "@/components/dashboard/HeaderIconLink";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserCategory, UserSettings } from "@/lib/types";

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

  const [{ data: settings }, { data: categories }, { data: gmailConnections }] =
    await Promise.all([
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
    ]);

  const resolvedSettings: Pick<UserSettings, "default_currency" | "notifications_enabled"> =
    settings ?? { default_currency: "CRC", notifications_enabled: false };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center gap-3 px-6">
          <HeaderIconLink href="/dashboard" label="Volver al dashboard">
            <ArrowLeft size={18} weight="bold" />
          </HeaderIconLink>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-50">Ajustes</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
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

        <section className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
          <CurrencySetting initial={resolvedSettings.default_currency} />
        </section>

        <section
          className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:60ms]"
        >
          <NotificationsSetting initial={resolvedSettings.notifications_enabled} />
        </section>

        <section
          className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:120ms]"
        >
          <GmailConnections connections={gmailConnections ?? []} />
        </section>

        <section
          className="animate-fade-up rounded-2xl border border-white/10 bg-zinc-900/40 p-5 [animation-delay:180ms]"
        >
          <CategoryManager categories={(categories ?? []) as UserCategory[]} />
        </section>

        <a
          href="/api/export-csv"
          className="animate-fade-up flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-100 [animation-delay:240ms]"
        >
          <DownloadSimple size={16} weight="bold" />
          Exportar transacciones a CSV
        </a>
      </div>
    </main>
  );
}
