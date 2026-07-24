import { redirect } from "next/navigation";
import { Differentiators } from "@/components/landing/Differentiators";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItReallyWorks } from "@/components/landing/HowItReallyWorks";
import { LoginButton } from "@/components/landing/LoginButton";
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
    title: "Conectá tu Gmail",
    body: "Iniciá sesión con Google y autorizá la lectura de tus correos bancarios. Solo lectura, nada más.",
  },
  {
    title: "Nosotros interpretamos",
    body: "Cada notificación de compra, transferencia o SINPE Móvil se convierte en una transacción categorizada.",
  },
  {
    title: "Vos solo mirás",
    body: "Tu saldo consolidado en colones y dólares, siempre al día. Solo el efectivo se anota a mano.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo subtitle="finanzas personales" />
          <LoginButton />
        </div>
      </header>

      <Hero />

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

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 sm:text-left">
          <StepsSection steps={steps} />
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tighter text-zinc-50 sm:text-3xl">
            Antes de conectar tu Gmail, esto es justo que sepas
          </h2>
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-zinc-500">
            Preferimos que sepas exactamente qué esperar, en vez de prometer magia.
          </p>
          <div className="mt-10">
            <HowItReallyWorks />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-white/10 scroll-mt-[68px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl">
            Todo lo que hace por vos
          </h2>
          <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-zinc-500 md:text-base">
            No es solo leer correos. Es que nunca más tengas que pensar en anotar un gasto.
          </p>
          <div className="mt-10">
            <FeatureShowcase />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tighter text-zinc-50 sm:text-3xl">
            No es otra app para anotar gastos
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-center text-sm leading-relaxed text-zinc-500">
            Muchas apps de finanzas en Costa Rica te piden trabajo extra, o no explican
            qué hacen con tu información. Nosotros elegimos lo contrario.
          </p>
          <div className="mt-10">
            <Differentiators />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
