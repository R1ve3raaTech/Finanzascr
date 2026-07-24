import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[68px] w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <Logo />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            Política de privacidad
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Última actualización: julio de 2026.</p>
        </div>

        <Section title="Qué datos leemos de tu Gmail">
          <p>
            Cuando conectás tu cuenta de Google, pedimos el permiso{" "}
            <span className="font-mono text-xs text-zinc-300">gmail.readonly</span>. Lo usamos
            exclusivamente para buscar correos de notificación de bancos y billeteras (BAC, BCR,
            Banco Nacional, Promerica, Davivienda, Banco Popular, MUCAP, PayPal, SINPE Móvil) y
            extraer de ahí el monto, la fecha y la descripción de cada movimiento.
          </p>
          <p>
            No leemos, guardamos ni procesamos ningún otro correo de tu bandeja. No usamos este
            acceso para buscar información personal ajena al registro automático de
            transacciones bancarias.
          </p>
        </Section>

        <Section title="Qué guardamos">
          <p>
            Guardamos las transacciones que detectamos (banco, monto, moneda, descripción,
            categoría y fecha), las que registrás manualmente, tus categorías y presupuestos
            personalizados, y tu suscripción a notificaciones push si las activás. Todo se
            almacena en una base de datos de Supabase con acceso restringido a tu propia cuenta.
          </p>
          <p>
            No guardamos el contenido completo de tus correos — solo los datos ya extraídos de la
            transacción.
          </p>
        </Section>

        <Section title="Con quién compartimos tus datos">
          <p>
            No vendemos ni compartimos tus datos con terceros. Los únicos servicios externos que
            procesan información en tu nombre son Google (para leer los correos bancarios que vos
            autorizaste) y Supabase (donde vive la base de datos).
          </p>
        </Section>

        <Section title="Tus opciones">
          <p>
            Podés desconectar cualquier cuenta de Gmail vinculada, borrar transacciones
            individuales o borrar todo tu historial de movimientos desde Ajustes, en cualquier
            momento. También podés revocar el acceso a Gmail directamente desde{" "}
            <span className="text-zinc-300">myaccount.google.com/permissions</span>.
          </p>
        </Section>

        <Section title="Contacto">
          <p>
            Si tenés dudas sobre esta política o querés que eliminemos tu cuenta y tus datos por
            completo, escribinos a{" "}
            <a href="mailto:thecamil999@gmail.com" className="text-emerald-400 hover:underline">
              thecamil999@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
