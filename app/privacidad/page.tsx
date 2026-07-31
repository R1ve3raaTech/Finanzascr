import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Política de privacidad"
      updatedAt="30 de julio de 2026"
      intro={
        <p>
          Esta política se rige por la Ley N.º 8968, Ley de Protección de la Persona frente al
          tratamiento de sus datos personales, de Costa Rica. También aplican los{" "}
          <Link href="/terminos">términos de servicio</Link>.
        </p>
      }
      summary={{
        label: "Resumen, por si no leés todo esto",
        items: [
          "Solo leemos correos de bancos. Nada más de tu Gmail.",
          "No vendemos ni alquilamos tus datos, a nadie, nunca.",
          "Podés borrar tu cuenta y todo tu historial cuando quieras.",
          "Tus tokens de acceso a Gmail se guardan cifrados.",
          "Tenés derechos ARCO y podés reclamar ante PRODHAB si algo no cuadra.",
        ],
      }}
    >
      <LegalSection number={1} title="Responsable de la base de datos">
        <p>
          TicoFinanza es un proyecto operado por una persona física (no una empresa constituida),
          identificada como <span>Camil</span>, responsable del tratamiento de los datos
          personales recolectados a través de esta aplicación.
        </p>
        <p>
          Contacto directo para cualquier consulta, solicitud o reclamo relacionado con tus datos
          personales: <a href="mailto:info@ticofinanza.com">info@ticofinanza.com</a>. No se
          mantiene un domicilio físico de atención al público; toda gestión se realiza por correo
          electrónico.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Qué datos personales recolectamos">
        <p>Recolectamos exactamente estos datos, y ningún otro:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <span>Datos de identidad y autenticación de Google</span>: tu nombre, dirección de
            correo y foto de perfil de Google, y un identificador único de tu cuenta, al iniciar
            sesión con Google.
          </li>
          <li>
            <span>Token de acceso a Gmail</span>: un token de autorización (cifrado) que nos
            permite leer, en tu nombre, únicamente los correos de notificación bancaria que vos
            autorizaste.
          </li>
          <li>
            <span>Datos financieros derivados de tus correos</span>: monto, moneda, fecha,
            descripción y banco de origen de cada movimiento detectado en tus notificaciones
            bancarias.
          </li>
          <li>
            <span>Datos financieros ingresados manualmente</span>: transacciones en efectivo,
            categorías y presupuestos que vos creás a mano.
          </li>
          <li>
            <span>Datos de perfil opcionales</span>: fecha de nacimiento y foto de perfil, si
            decidís cargarlos en la pantalla de bienvenida al registrarte o después en Ajustes.
            Podés saltarte ese paso sin problema.
          </li>
          <li>
            <span>Datos técnicos de sesión</span>: cookies necesarias para mantener tu sesión
            iniciada y prevenir ataques (ver sección de cookies más abajo).
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="Para qué usamos cada dato">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <span>Nombre, correo y foto de Google</span>: identificarte y mostrarte tu propia
            información en la app.
          </li>
          <li>
            <span>Token de Gmail</span>: buscar y leer, de forma automática, únicamente los
            correos de bancos que vos autorizaste, para registrar tus movimientos sin que tengas
            que anotarlos a mano.
          </li>
          <li>
            <span>Datos financieros (automáticos y manuales)</span>: mostrarte tu saldo, tus
            gráficos de gasto, y avisarte cuando te acercás a un límite de presupuesto.
          </li>
          <li>
            <span>Fecha de nacimiento y foto de perfil</span>: personalizar tu cuenta; son
            enteramente opcionales y no se usan para ningún otro fin.
          </li>
          <li>
            <span>Cookies de sesión</span>: mantenerte con la sesión iniciada y proteger el
            proceso de login contra falsificación de solicitudes (CSRF).
          </li>
        </ul>
        <p>
          No usamos ninguno de estos datos para publicidad, ni los combinamos con datos de
          terceros para crear perfiles de consumo.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Consentimiento">
        <p>
          El tratamiento de tus datos se basa en tu consentimiento informado y expreso: al iniciar
          sesión con Google, la propia pantalla de consentimiento de Google te muestra exactamente
          qué permisos pedimos (identidad y lectura de Gmail) antes de que autorices nada. Podés
          retirar ese consentimiento en cualquier momento, sin que eso afecte la licitud del
          tratamiento hecho antes del retiro.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Categorización con inteligencia artificial">
        <p>
          Si usás la función de categorizar transacciones automáticamente, el banco, el monto y la
          descripción de esas transacciones (sin ningún otro dato tuyo) se envían al modelo de IA
          de Anthropic (Claude) para que sugiera una categoría. Anthropic procesa esos datos
          únicamente para devolver la respuesta y no los usa para entrenar sus modelos.
        </p>
        <p>Esta función es opcional: solo se activa cuando vos tocás el botón de categorizar.</p>
        <p>
          <span>Declaración de cumplimiento de uso limitado</span>: el uso de datos de usuario,
          crudos o derivados, recibidos a través de las APIs de Google Workspace (Gmail) cumple
          con la Política de datos de usuario de los Servicios de API de Google, incluyendo los
          requisitos de Uso Limitado. Esos datos nunca se usan para entrenar modelos de
          inteligencia artificial, propios ni de terceros.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Cómo protegemos tus datos">
        <p>
          El token de acceso a tu Gmail se guarda cifrado en la base de datos (no en texto plano),
          con una llave separada de las credenciales de la base. Todo el tráfico va por HTTPS.
          Cada usuario solo puede ver y modificar sus propios datos: la base de datos tiene reglas
          de acceso (Row Level Security) que lo garantizan a nivel de base, no solo en el código de
          la app.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Con quién compartimos tus datos">
        <p>No vendemos ni alquilamos tus datos a nadie, bajo ninguna circunstancia.</p>
        <p>
          Los únicos terceros que procesan información en tu nombre, como encargados del
          tratamiento, son:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <span>Google</span>, para autenticarte y para leer los correos bancarios que vos
            autorizaste (Google LLC, Estados Unidos).
          </li>
          <li>
            <span>Supabase</span>, donde vive la base de datos y el sistema de autenticación
            (Supabase Inc., con infraestructura alojada en Estados Unidos).
          </li>
          <li>
            <span>Anthropic</span>, solo si usás la categorización automática con IA, y solo con
            los datos de esa transacción puntual (Anthropic, PBC, Estados Unidos).
          </li>
          <li>
            <span>Vercel</span>, donde corre la aplicación, es decir el hosting (Vercel Inc.,
            Estados Unidos).
          </li>
        </ul>
        <p>
          Esto implica una transferencia internacional de datos fuera de Costa Rica, hacia
          proveedores ubicados principalmente en Estados Unidos. Estos proveedores operan bajo sus
          propios compromisos contractuales de protección de datos y cifran la información en
          tránsito y en reposo. No compartimos datos con ninguna otra entidad, ni pública ni
          privada, salvo obligación legal.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Cuánto tiempo guardamos tus datos">
        <p>
          Guardamos tus datos mientras tu cuenta esté activa. Si borrás tu cuenta (o nos escribís
          pidiéndolo), eliminamos tus transacciones, presupuestos, categorías, conexiones de Gmail
          y datos de perfil de forma permanente, dentro de los siguientes 30 días.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Cookies y tecnologías similares">
        <p>
          Usamos únicamente cookies estrictamente necesarias para el funcionamiento del sitio: una
          cookie de sesión (para mantenerte con la sesión iniciada) y cookies temporales de
          seguridad usadas solo durante el proceso de inicio de sesión con Google, que expiran a
          los pocos minutos.
        </p>
        <p>
          No usamos cookies de publicidad, de rastreo entre sitios, ni herramientas de analítica
          de terceros. No vas a ver un banner de cookies porque no usamos ninguna que requiera tu
          consentimiento adicional.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Tus derechos ARCO">
        <p>
          Como titular de tus datos, la Ley 8968 te reconoce el derecho a Acceder, Rectificar,
          Cancelar y Oponerte al tratamiento de tu información (derechos ARCO):
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <span>Acceso</span>: pedir una copia de qué datos tuyos tenemos guardados.
          </li>
          <li>
            <span>Rectificación</span>: corregir datos tuyos que estén incorrectos o
            desactualizados.
          </li>
          <li>
            <span>Cancelación</span>: pedir que borremos tus datos.
          </li>
          <li>
            <span>Oposición</span>: oponerte a que usemos tus datos para un fin específico (por
            ejemplo, la categorización automática con IA).
          </li>
        </ul>
        <p>
          Desde Ajustes podés ejercer varios de estos derechos vos mismo, sin pedirle nada a
          nadie: desconectar cualquier cuenta de Gmail vinculada, borrar transacciones
          individuales o todo tu historial, exportar tus transacciones a CSV, y editar o borrar tu
          información de perfil.
        </p>
        <p>
          Para cualquier otra solicitud (incluyendo el acceso completo a tus datos o la
          cancelación total de tu cuenta), escribinos a{" "}
          <a href="mailto:info@ticofinanza.com">info@ticofinanza.com</a>. Respondemos dentro de
          un plazo máximo de 5 días hábiles, y ejercer estos derechos nunca tiene costo alguno
          para vos.
        </p>
        <p>
          También podés revocar el acceso a Gmail directamente desde{" "}
          <span>myaccount.google.com/permissions</span>, sin pasar por la app.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Autoridad de control: PRODHAB">
        <p>
          Si considerás que no atendimos correctamente tu solicitud, o que tus datos personales
          fueron tratados de forma indebida, podés presentar un reclamo ante la Agencia de
          Protección de Datos de los Habitantes (PRODHAB), la autoridad de control en Costa Rica
          en materia de protección de datos personales, independientemente de cualquier gestión
          que hagas con nosotros directamente.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Actualizaciones a esta política">
        <p>
          Si cambiamos algo importante de cómo manejamos tus datos, lo vamos a reflejar acá y
          actualizamos la fecha de arriba. Si el cambio es significativo, te avisamos por
          notificación push o correo, si tenés alguno activado.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Menores de edad">
        <p>
          TicoFinanza no está dirigido a menores de 13 años, y no recolectamos a sabiendas
          información de niños. Si sos padre/madre y creés que tu hijo/a nos dio información,
          escribinos y la borramos.
        </p>
      </LegalSection>

      <LegalSection number={14} title="Contacto">
        <p>
          Si tenés dudas sobre esta política, sobre cómo usamos tus datos, o querés ejercer tus
          derechos ARCO, escribinos a <a href="mailto:info@ticofinanza.com">info@ticofinanza.com</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
