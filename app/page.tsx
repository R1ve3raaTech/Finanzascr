import Link from "next/link";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
import { LoginButton } from "@/components/landing/LoginButton";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

const banks = ["BAC Credomatic", "BCR", "BNCR", "Promerica", "Davivienda", "SINPE Móvil"];

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
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-6">
          <Logo subtitle="finanzas personales" />
          <LoginButton />
        </div>
      </header>

      <Hero />

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <p className="mb-6 text-sm text-zinc-500">
            Compatible con las entidades que ya usás
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {banks.map((bank) => (
              <span
                key={bank}
                className="text-lg font-medium tracking-tight text-zinc-400"
              >
                {bank}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl">
            Cero anotaciones manuales
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col gap-3 border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-zinc-100">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-zinc-500">
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
