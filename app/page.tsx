import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LoginButton } from "@/components/landing/LoginButton";
import { PasswordTrust } from "@/components/landing/PasswordTrust";
import { PrivacySnippet } from "@/components/landing/PrivacySnippet";
import { StepsSection } from "@/components/landing/StepsSection";
import { SupportedBanks } from "@/components/landing/SupportedBanks";
import { Logo } from "@/components/Logo";
import { BANK_BRAND } from "@/lib/bankBrand";
import { createClient } from "@/lib/supabase/server";
import type { BankName } from "@/lib/types";

// Solo los bancos con parser implementado y funcionando (ver
// lib/parsers/index.ts) — nada de prometer entidades que todavía no leemos.
const supportedBanks: BankName[] = ["BAC", "BCR", "BNCR", "BP", "Davivienda", "MUCAP", "PayPal"];

const steps = [
  {
    title: "Conectá tu correo",
    body: "Iniciá sesión con Google y autorizá la lectura de tus correos bancarios. Solo lectura, nada más.",
  },
  {
    title: "Categorización automática",
    body: "Cada notificación de compra, transferencia o SINPE Móvil se convierte en una transacción, ya categorizada.",
  },
  {
    title: "Mirá tus finanzas claras",
    body: "Tu saldo consolidado en colones, dólares y córdobas, siempre al día. Solo el efectivo se anota a mano.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const loggedIn = Boolean(user);

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo subtitle="finanzas personales" />
          <LoginButton loggedIn={loggedIn} />
        </div>
      </header>

      <Hero loggedIn={loggedIn} />

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:px-6 sm:text-left">
          <p className="mb-6 text-sm text-zinc-500">
            Compatible con las entidades que ya usás
          </p>
          <SupportedBanks
            banks={supportedBanks.map((bank) => ({ bank, label: BANK_BRAND[bank].label }))}
          />
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/10 scroll-mt-[68px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 sm:text-left">
          <StepsSection heading="Cómo funciona" steps={steps} />
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <PasswordTrust />
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <PrivacySnippet />
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
          <h2 className="max-w-[28ch] text-2xl font-semibold tracking-tighter text-zinc-50 sm:text-3xl">
            ¿Listo para dejar de anotar gastos a mano?
          </h2>
          <LoginButton large loggedIn={loggedIn} />
        </div>
      </section>

      <Footer loggedIn={loggedIn} />
    </main>
  );
}
