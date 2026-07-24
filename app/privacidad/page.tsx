import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  Clock,
  EnvelopeSimple,
  Lock,
  Sparkle,
  Database,
  ShareNetwork,
  ArrowsClockwise,
  SlidersHorizontal,
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

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            Política de privacidad
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Última actualización: julio de 2026.</p>
        </div>

        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-5">
          <p className="text-sm font-medium text-sky-300">Resumen, por si no leés todo esto</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-zinc-300">
            <li>• Solo leemos correos de bancos. Nada más de tu Gmail.</li>
            <li>• No vendemos tus datos, a nadie, nunca.</li>
            <li>• Podés borrar tu cuenta y todo tu historial cuando quieras.</li>
            <li>• Tus tokens de acceso a Gmail se guardan cifrados.</li>
          </ul>
        </div>

        <Section title="Qué datos leemos de tu Gmail" icon={EnvelopeSimple} accent="sky">
          <p>
            Cuando conectás tu cuenta de Google, pedimos el permiso{" "}
            <span className="font-mono text-xs text-zinc-300">gmail.readonly</span>. Lo usamos
            exclusivamente para buscar correos de notificación de bancos y billeteras (BAC, BCR,
            Banco Nacional, Banco Popular, Davivienda, MUCAP y PayPal) y extraer de ahí el monto,
            la fecha y la descripción de cada movimiento.
          </p>
          <p>
            No leemos, guardamos ni procesamos ningún otro correo de tu bandeja: no buscamos
            correos personales, no los indexamos, no los usamos para nada que no sea detectar una
            notificación bancaria.
          </p>
        </Section>

        <Section title="Qué guardamos" icon={Database} accent="violet">
          <p>
            Guardamos las transacciones que detectamos (banco, monto, moneda, descripción,
            categoría y fecha), las que registrás manualmente, tus categorías y presupuestos
            personalizados, tu suscripción a notificaciones push si las activás, y los datos de
            perfil que cargues vos mismo (nombre, foto, fecha de nacimiento).
          </p>
          <p>
            No guardamos el contenido completo de tus correos, solo los datos ya extraídos de la
            transacción. Nunca guardamos el texto original del correo bancario.
          </p>
        </Section>

        <Section title="Categorización con Inteligencia Artificial" icon={Sparkle} accent="amber">
          <p>
            Si usás la función de categorizar transacciones automáticamente, el banco, el monto y
            la descripción de esas transacciones (sin ningún otro dato tuyo) se envían al modelo
            de IA de Anthropic (Claude) para que sugiera una categoría. Anthropic procesa esos
            datos únicamente para devolver la respuesta y no los usa para entrenar sus modelos.
          </p>
          <p>Esta función es opcional: solo se activa cuando vos tocás el botón de categorizar.</p>
        </Section>

        <Section title="Cómo protegemos tus datos" icon={Lock} accent="emerald">
          <p>
            El token de acceso a tu Gmail se guarda cifrado en la base de datos (no en texto
            plano), con una llave separada de las credenciales de la base. Todo el tráfico va por
            HTTPS. Cada usuario solo puede ver y modificar sus propios datos: la base de datos
            tiene reglas de acceso (Row Level Security) que lo garantizan a nivel de base, no solo
            en el código de la app.
          </p>
        </Section>

        <Section title="Con quién compartimos tus datos" icon={ShareNetwork} accent="rose">
          <p>No vendemos ni alquilamos tus datos a nadie, bajo ninguna circunstancia.</p>
          <p>Los únicos servicios externos que procesan información en tu nombre son:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <span className="text-zinc-300">Google</span>, para leer los correos bancarios que
              vos autorizaste.
            </li>
            <li>
              <span className="text-zinc-300">Supabase</span>, donde vive la base de datos y el
              sistema de autenticación.
            </li>
            <li>
              <span className="text-zinc-300">Anthropic</span>, solo si usás la categorización
              automática con IA, y solo con los datos de esa transacción puntual.
            </li>
            <li>
              <span className="text-zinc-300">Vercel</span>, donde corre la aplicación (hosting).
            </li>
          </ul>
        </Section>

        <Section title="Cuánto tiempo guardamos tus datos" icon={Clock} accent="sky">
          <p>
            Guardamos tus datos mientras tu cuenta esté activa. Si borrás tu cuenta (o nos
            escribís pidiéndolo), eliminamos tus transacciones, presupuestos, categorías,
            conexiones de Gmail y datos de perfil de forma permanente, dentro de los siguientes 30
            días.
          </p>
        </Section>

        <Section title="Tus opciones y derechos" icon={SlidersHorizontal} accent="violet">
          <p>
            Desde Ajustes podés, en cualquier momento y sin pedirle nada a nadie: desconectar
            cualquier cuenta de Gmail vinculada, borrar transacciones individuales, borrar todo tu
            historial de movimientos, exportar tus transacciones a CSV, y editar o borrar tu
            información de perfil.
          </p>
          <p>
            También podés revocar el acceso a Gmail directamente desde{" "}
            <span className="text-zinc-300">myaccount.google.com/permissions</span>, sin pasar por
            la app. Si querés que eliminemos tu cuenta por completo, escribinos (abajo tenés el
            correo).
          </p>
        </Section>

        <Section title="Actualizaciones a esta política" icon={ArrowsClockwise} accent="zinc">
          <p>
            Si cambiamos algo importante de cómo manejamos tus datos, lo vamos a reflejar acá y
            actualizamos la fecha de arriba. Si el cambio es significativo, te avisamos por
            notificación push o correo, si tenés alguno activado.
          </p>
        </Section>

        <Section title="Menores de edad" icon={Baby} accent="rose">
          <p>
            RoKKbo/TicoFinanza no está dirigido a menores de 13 años, y no recolectamos a
            sabiendas información de niños. Si sos padre/madre y creés que tu hijo/a nos dio
            información, escribinos y la borramos.
          </p>
        </Section>

        <Section title="Contacto" icon={EnvelopeSimple} accent="emerald">
          <p>
            Si tenés dudas sobre esta política, sobre cómo usamos tus datos, o querés que
            eliminemos tu cuenta por completo, escribinos a{" "}
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
