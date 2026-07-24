import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  Clock,
  Cookie,
  EnvelopeSimple,
  Gavel,
  IdentificationCard,
  Lock,
  Sparkle,
  Database,
  ShareNetwork,
  ArrowsClockwise,
  SlidersHorizontal,
  Scales,
  ShieldCheck,
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
          <p className="mt-1 text-sm text-zinc-500">Última actualización: 24 de julio de 2026.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Esta política se rige por la Ley N.º 8968, Ley de Protección de la Persona frente al
            tratamiento de sus datos personales, de Costa Rica. También aplican los{" "}
            <Link href="/terminos" className="text-sky-400 hover:underline">
              términos de servicio
            </Link>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-5">
          <p className="text-sm font-medium text-sky-300">Resumen, por si no leés todo esto</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-zinc-300">
            <li>• Solo leemos correos de bancos. Nada más de tu Gmail.</li>
            <li>• No vendemos ni alquilamos tus datos, a nadie, nunca.</li>
            <li>• Podés borrar tu cuenta y todo tu historial cuando quieras.</li>
            <li>• Tus tokens de acceso a Gmail se guardan cifrados.</li>
            <li>• Tenés derechos ARCO y podés reclamar ante PRODHAB si algo no cuadra.</li>
          </ul>
        </div>

        <Section title="Responsable de la base de datos" icon={IdentificationCard} accent="sky">
          <p>
            TicoFinanza es un proyecto operado por una persona física (no una empresa
            constituida), identificada como{" "}
            <span className="text-zinc-300">Camil</span>, responsable del tratamiento de los
            datos personales recolectados a través de esta aplicación.
          </p>
          <p>
            Contacto directo para cualquier consulta, solicitud o reclamo relacionado con tus
            datos personales:{" "}
            <a href="mailto:thecamil999@gmail.com" className="text-sky-400 hover:underline">
              thecamil999@gmail.com
            </a>
            . No se mantiene un domicilio físico de atención al público; toda gestión se realiza
            por correo electrónico.
          </p>
        </Section>

        <Section title="Qué datos personales recolectamos" icon={Database} accent="violet">
          <p>Recolectamos exactamente estos datos, y ningún otro:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <span className="text-zinc-300">Datos de identidad y autenticación de Google</span>:
              tu nombre, dirección de correo y foto de perfil de Google, y un identificador único
              de tu cuenta, al iniciar sesión con Google.
            </li>
            <li>
              <span className="text-zinc-300">Token de acceso a Gmail</span>: un token de
              autorización (cifrado) que nos permite leer, en tu nombre, únicamente los correos de
              notificación bancaria que vos autorizaste.
            </li>
            <li>
              <span className="text-zinc-300">Datos financieros derivados de tus correos</span>:
              monto, moneda, fecha, descripción y banco de origen de cada movimiento detectado en
              tus notificaciones bancarias.
            </li>
            <li>
              <span className="text-zinc-300">Datos financieros ingresados manualmente</span>:
              transacciones en efectivo, categorías y presupuestos que vos creás a mano.
            </li>
            <li>
              <span className="text-zinc-300">Datos de perfil opcionales</span>: fecha de
              nacimiento y foto de perfil, si decidís cargarlos en Ajustes.
            </li>
            <li>
              <span className="text-zinc-300">Datos técnicos de sesión</span>: cookies necesarias
              para mantener tu sesión iniciada y prevenir ataques (ver sección de cookies más
              abajo).
            </li>
          </ul>
        </Section>

        <Section title="Para qué usamos cada dato" icon={SlidersHorizontal} accent="amber">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <span className="text-zinc-300">Nombre, correo y foto de Google</span>: identificarte
              y mostrarte tu propia información en la app.
            </li>
            <li>
              <span className="text-zinc-300">Token de Gmail</span>: buscar y leer, de forma
              automática, únicamente los correos de bancos que vos autorizaste, para registrar tus
              movimientos sin que tengas que anotarlos a mano.
            </li>
            <li>
              <span className="text-zinc-300">Datos financieros (automáticos y manuales)</span>:
              mostrarte tu saldo, tus gráficos de gasto, y avisarte cuando te acercás a un límite
              de presupuesto.
            </li>
            <li>
              <span className="text-zinc-300">Fecha de nacimiento y foto de perfil</span>:
              personalizar tu cuenta; son enteramente opcionales y no se usan para ningún otro fin.
            </li>
            <li>
              <span className="text-zinc-300">Cookies de sesión</span>: mantenerte con la sesión
              iniciada y proteger el proceso de login contra falsificación de solicitudes (CSRF).
            </li>
          </ul>
          <p>
            No usamos ninguno de estos datos para publicidad, ni los combinamos con datos de
            terceros para crear perfiles de consumo.
          </p>
        </Section>

        <Section title="Consentimiento" icon={Gavel} accent="rose">
          <p>
            El tratamiento de tus datos se basa en tu consentimiento informado y expreso: al
            iniciar sesión con Google, la propia pantalla de consentimiento de Google te muestra
            exactamente qué permisos pedimos (identidad y lectura de Gmail) antes de que autorices
            nada. Podés retirar ese consentimiento en cualquier momento, sin que eso afecte la
            licitud del tratamiento hecho antes del retiro.
          </p>
        </Section>

        <Section title="Categorización con inteligencia artificial" icon={Sparkle} accent="amber">
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
          <p>
            Los únicos terceros que procesan información en tu nombre, como encargados del
            tratamiento, son:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <span className="text-zinc-300">Google</span>, para autenticarte y para leer los
              correos bancarios que vos autorizaste (Google LLC, Estados Unidos).
            </li>
            <li>
              <span className="text-zinc-300">Supabase</span>, donde vive la base de datos y el
              sistema de autenticación (Supabase Inc., con infraestructura alojada en Estados
              Unidos).
            </li>
            <li>
              <span className="text-zinc-300">Anthropic</span>, solo si usás la categorización
              automática con IA, y solo con los datos de esa transacción puntual (Anthropic, PBC,
              Estados Unidos).
            </li>
            <li>
              <span className="text-zinc-300">Vercel</span>, donde corre la aplicación, es decir
              el hosting (Vercel Inc., Estados Unidos).
            </li>
          </ul>
          <p>
            Esto implica una transferencia internacional de datos fuera de Costa Rica, hacia
            proveedores ubicados principalmente en Estados Unidos. Estos proveedores operan bajo
            sus propios compromisos contractuales de protección de datos y cifran la información
            en tránsito y en reposo. No compartimos datos con ninguna otra entidad, ni pública ni
            privada, salvo obligación legal.
          </p>
        </Section>

        <Section title="Cuánto tiempo guardamos tus datos" icon={Clock} accent="sky">
          <p>
            Guardamos tus datos mientras tu cuenta esté activa. Si borrás tu cuenta (o nos
            escribís pidiéndolo), eliminamos tus transacciones, presupuestos, categorías,
            conexiones de Gmail y datos de perfil de forma permanente, dentro de los siguientes 30
            días.
          </p>
        </Section>

        <Section title="Cookies y tecnologías similares" icon={Cookie} accent="violet">
          <p>
            Usamos únicamente cookies estrictamente necesarias para el funcionamiento del sitio:
            una cookie de sesión (para mantenerte con la sesión iniciada) y cookies temporales de
            seguridad usadas solo durante el proceso de inicio de sesión con Google, que expiran a
            los pocos minutos.
          </p>
          <p>
            No usamos cookies de publicidad, de rastreo entre sitios, ni herramientas de analítica
            de terceros. No vas a ver un banner de cookies porque no usamos ninguna que requiera tu
            consentimiento adicional.
          </p>
        </Section>

        <Section title="Tus derechos ARCO" icon={Scales} accent="emerald">
          <p>
            Como titular de tus datos, la Ley 8968 te reconoce el derecho a Acceder, Rectificar,
            Cancelar y Oponerte al tratamiento de tu información (derechos ARCO):
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <span className="text-zinc-300">Acceso</span>: pedir una copia de qué datos tuyos
              tenemos guardados.
            </li>
            <li>
              <span className="text-zinc-300">Rectificación</span>: corregir datos tuyos que estén
              incorrectos o desactualizados.
            </li>
            <li>
              <span className="text-zinc-300">Cancelación</span>: pedir que borremos tus datos.
            </li>
            <li>
              <span className="text-zinc-300">Oposición</span>: oponerte a que usemos tus datos
              para un fin específico (por ejemplo, la categorización automática con IA).
            </li>
          </ul>
          <p>
            Desde Ajustes podés ejercer varios de estos derechos vos mismo, sin pedirle nada a
            nadie: desconectar cualquier cuenta de Gmail vinculada, borrar transacciones
            individuales o todo tu historial, exportar tus transacciones a CSV, y editar o borrar
            tu información de perfil.
          </p>
          <p>
            Para cualquier otra solicitud (incluyendo el acceso completo a tus datos o la
            cancelación total de tu cuenta), escribinos a{" "}
            <a href="mailto:thecamil999@gmail.com" className="text-sky-400 hover:underline">
              thecamil999@gmail.com
            </a>
            . Respondemos dentro de un plazo máximo de 5 días hábiles, y ejercer estos derechos
            nunca tiene costo alguno para vos.
          </p>
          <p>
            También podés revocar el acceso a Gmail directamente desde{" "}
            <span className="text-zinc-300">myaccount.google.com/permissions</span>, sin pasar por
            la app.
          </p>
        </Section>

        <Section title="Autoridad de control: PRODHAB" icon={ShieldCheck} accent="sky">
          <p>
            Si considerás que no atendimos correctamente tu solicitud, o que tus datos personales
            fueron tratados de forma indebida, podés presentar un reclamo ante la Agencia de
            Protección de Datos de los Habitantes (PRODHAB), la autoridad de control en Costa Rica
            en materia de protección de datos personales, independientemente de cualquier gestión
            que hagas con nosotros directamente.
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
            TicoFinanza no está dirigido a menores de 13 años, y no recolectamos a sabiendas
            información de niños. Si sos padre/madre y creés que tu hijo/a nos dio información,
            escribinos y la borramos.
          </p>
        </Section>

        <Section title="Contacto" icon={EnvelopeSimple} accent="emerald">
          <p>
            Si tenés dudas sobre esta política, sobre cómo usamos tus datos, o querés ejercer tus
            derechos ARCO, escribinos a{" "}
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
