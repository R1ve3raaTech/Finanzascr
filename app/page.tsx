import Link from "next/link";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
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

      <footer className="mt-auto border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col flex-wrap items-center justify-center gap-3 px-4 py-8 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <span>Hecho en Costa Rica</span>
          <span>Tus datos son tuyos. Solo lectura de correos bancarios.</span>
          <Link href="/privacidad" className="transition-colors hover:text-zinc-300">
            Política de privacidad
          </Link>
        </div>
      </footer>
    </main>
  );
}
