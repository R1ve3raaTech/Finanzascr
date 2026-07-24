import Link from "next/link";
import {
  ArrowLeft,
  ArrowsClockwise,
  Coins,
  EnvelopeSimple,
  Gavel,
  IdentificationCard,
  Prohibit,
  Scales,
  UserCircle,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";
import type { Icon } from "@phosphor-icons/react";

const ACCENTS = {
  sky: "bg-sky-400/10 text-sky-400",
  emerald: "bg-emerald-400/10 text-emerald-400",
  amber: "bg-amber-400/10 text-amber-400",
  violet: "bg-violet-400/10 text-violet-400",
  rose: "bg-rose-400/10 text-rose-400",
  zinc: "bg-zinc-400/10 text-zinc-300",
} as const;

function Section({
  title,
  icon: IconComponent,
  accent,
  children,
}: {
  title: string;
  icon: Icon;
  accent: keyof typeof ACCENTS;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACCENTS[accent]}`}
        >
          <IconComponent size={18} weight="bold" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </div>
      <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
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

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            Términos de servicio
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Última actualización: 24 de julio de 2026.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Al crear una cuenta o usar TicoFinanza, aceptás estos términos. Si no estás de
            acuerdo, no uses la aplicación.
          </p>
        </div>

        <Section title="Qué es TicoFinanza" icon={IdentificationCard} accent="sky">
          <p>
            TicoFinanza es una aplicación de finanzas personales para Costa Rica que lee, con tu
            autorización, correos de notificación bancaria en tu cuenta de Gmail para registrar
            tus movimientos automáticamente, y te permite además registrar transacciones a mano,
            organizarlas por categoría, definir presupuestos y ver estadísticas de tus gastos e
            ingresos en colones y dólares.
          </p>
          <p>
            Es un proyecto operado por una persona física (no una empresa constituida). Los
            detalles de quién trata tus datos y cómo están en la{" "}
            <Link href="/privacidad" className="text-sky-400 hover:underline">
              política de privacidad
            </Link>
            .
          </p>
        </Section>

        <Section title="Requisitos para usar la app" icon={UserCircle} accent="violet">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Debés tener al menos 13 años para crear una cuenta.</li>
            <li>
              Necesitás una cuenta de Google válida: el inicio de sesión y la lectura de correos
              bancarios funcionan exclusivamente a través de Google OAuth.
            </li>
            <li>
              Sos responsable de que la información de tu cuenta de Google sea tuya y esté
              vigente; no está permitido usar TicoFinanza con cuentas de terceros sin su
              autorización.
            </li>
          </ul>
        </Section>

        <Section title="Tu responsabilidad como usuario" icon={Gavel} accent="amber">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              Sos responsable de mantener segura tu cuenta de Google, ya que es la puerta de
              entrada a tu cuenta de TicoFinanza.
            </li>
            <li>
              Los montos, categorías y descripciones que ingresás manualmente son tu
              responsabilidad: no verificamos ni corregimos datos cargados a mano.
            </li>
            <li>
              La categorización automática con inteligencia artificial es una sugerencia, no un
              consejo financiero ni contable; revisala si la vas a usar para algo formal (por
              ejemplo, declaración de impuestos).
            </li>
            <li>
              No está permitido usar la aplicación para actividades ilegales, ni intentar
              vulnerar su seguridad, ni acceder a datos de otros usuarios.
            </li>
          </ul>
        </Section>

        <Section title="Límites de la lectura automática" icon={Warning} accent="rose">
          <p>
            La lectura automática de correos depende de que tu banco envíe notificaciones por
            Gmail con un formato que sepamos interpretar, y de que tengas conexión activa a Gmail.
            Correos reenviados, filtrados a otra carpeta, eliminados antes de sincronizar, o de
            bancos que todavía no soportamos, no se van a registrar solos. No garantizamos que el
            100% de tus movimientos bancarios se detecten automáticamente.
          </p>
        </Section>

        <Section title="Limitación de responsabilidad" icon={Scales} accent="emerald">
          <p>
            TicoFinanza se ofrece &ldquo;tal cual&rdquo;, sin garantías de ningún tipo. No somos un
            banco, ni una entidad financiera regulada, ni asesores financieros: la app es una
            herramienta de organización personal, y las decisiones financieras que tomés en base a
            la información que te mostramos son enteramente tuyas.
          </p>
          <p>
            En la máxima medida permitida por la ley, no somos responsables por pérdidas
            económicas, decisiones financieras, o daños indirectos derivados del uso (o la
            imposibilidad de uso) de la aplicación, incluyendo errores de categorización, montos
            mal interpretados de un correo, o interrupciones del servicio.
          </p>
        </Section>

        <Section title="Disponibilidad del servicio" icon={Coins} accent="sky">
          <p>
            TicoFinanza es un servicio gratuito y puede cambiar, pausarse o discontinuarse en
            cualquier momento, con o sin aviso previo. Si eso llegara a pasar, vas a poder exportar
            tus transacciones a CSV mientras el servicio siga activo.
          </p>
        </Section>

        <Section title="Cierre de cuenta" icon={Prohibit} accent="violet">
          <p>
            Podés borrar tu cuenta cuando quieras desde Ajustes, o escribiéndonos. También podemos
            suspender o cerrar una cuenta si detectamos un uso que viole estos términos o que ponga
            en riesgo la seguridad de otros usuarios.
          </p>
        </Section>

        <Section title="Cambios a estos términos" icon={ArrowsClockwise} accent="zinc">
          <p>
            Si actualizamos estos términos de forma significativa, lo vamos a reflejar acá con la
            fecha de actualización, y te avisamos por notificación push o correo si tenés alguno
            activado.
          </p>
        </Section>

        <Section title="Contacto" icon={EnvelopeSimple} accent="emerald">
          <p>
            Dudas sobre estos términos: escribinos a{" "}
            <a href="mailto:thecamil999@gmail.com" className="text-sky-400 hover:underline">
              thecamil999@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
