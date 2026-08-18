import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Términos de servicio" };

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Términos de servicio"
      updatedAt="24 de julio de 2026"
      intro={
        <p>
          Al crear una cuenta o usar TicoFinanza, aceptás estos términos. Si no estás de acuerdo,
          no uses la aplicación.
        </p>
      }
    >
      <LegalSection number={1} title="Qué es TicoFinanza">
        <p>
          TicoFinanza es una aplicación de finanzas personales para Costa Rica que lee, con tu
          autorización, correos de notificación bancaria en tu cuenta de Gmail para registrar tus
          movimientos automáticamente, y te permite además registrar transacciones a mano,
          organizarlas por categoría, definir presupuestos y ver estadísticas de tus gastos e
          ingresos en colones. Cualquier movimiento en otra moneda se convierte a colones
          automáticamente con el tipo de cambio del día.
        </p>
        <p>
          Es un proyecto operado por una persona física (no una empresa constituida). Los
          detalles de quién trata tus datos y cómo están en la{" "}
          <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Requisitos para usar la app">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Debés tener al menos 13 años para crear una cuenta.</li>
          <li>
            Necesitás una cuenta de Google válida: el inicio de sesión y la lectura de correos
            bancarios funcionan exclusivamente a través de Google OAuth.
          </li>
          <li>
            Sos responsable de que la información de tu cuenta de Google sea tuya y esté vigente;
            no está permitido usar TicoFinanza con cuentas de terceros sin su autorización.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="Tu responsabilidad como usuario">
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
            No está permitido usar la aplicación para actividades ilegales, ni intentar vulnerar
            su seguridad, ni acceder a datos de otros usuarios.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Límites de la lectura automática">
        <p>
          La lectura automática de correos depende de que tu banco realmente envíe la
          notificación a tu Gmail, con un formato que sepamos interpretar. Algunos bancos mandan
          sus alertas por SMS por defecto en vez de por correo: si notás que algo no se registró
          solo, vale la pena revisar los ajustes de notificaciones dentro de la app de tu banco.
          Correos filtrados a otra carpeta, eliminados antes de sincronizar, de bancos que todavía
          no soportamos, o de efectivo (que nunca genera correo), tampoco se van a registrar
          solos: esos los agregás vos manualmente, eligiendo el banco real si aplica.
        </p>
        <p>
          Los bancos también cambian el formato de sus correos de vez en cuando, lo que puede
          romper la lectura automática hasta que actualicemos el sistema. Si detectamos que dejó
          de llegar algo automático por varios días seguidos, te avisamos por notificación push
          para que sepas revisar a mano mientras tanto. No garantizamos que el 100% de tus
          movimientos bancarios se detecten automáticamente.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Limitación de responsabilidad">
        <p>
          TicoFinanza se ofrece &ldquo;tal cual&rdquo;, sin garantías de ningún tipo. No somos un
          banco, ni una entidad financiera regulada, ni asesores financieros: la app es una
          herramienta de organización personal, y las decisiones financieras que tomés en base a
          la información que te mostramos son enteramente tuyas.
        </p>
        <p>
          En la máxima medida permitida por la ley, no somos responsables por pérdidas económicas,
          decisiones financieras, o daños indirectos derivados del uso (o la imposibilidad de uso)
          de la aplicación, incluyendo errores de categorización, montos mal interpretados de un
          correo, o interrupciones del servicio.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Disponibilidad del servicio">
        <p>
          TicoFinanza es un servicio gratuito y puede cambiar, pausarse o discontinuarse en
          cualquier momento, con o sin aviso previo. Si eso llegara a pasar, vas a poder exportar
          tus transacciones a CSV mientras el servicio siga activo.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Cierre de cuenta">
        <p>
          Podés borrar tu cuenta cuando quieras desde Ajustes, o escribiéndonos. También podemos
          suspender o cerrar una cuenta si detectamos un uso que viole estos términos o que ponga
          en riesgo la seguridad de otros usuarios.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Cambios a estos términos">
        <p>
          Si actualizamos estos términos de forma significativa, lo vamos a reflejar acá con la
          fecha de actualización, y te avisamos por notificación push o correo si tenés alguno
          activado.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Contacto">
        <p>
          Dudas sobre estos términos: escribinos a{" "}
          <a href="mailto:info@ticofinanza.com">info@ticofinanza.com</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
