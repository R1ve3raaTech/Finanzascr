import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResend } from "@/lib/email/resend";

const WELCOME_EMAIL_FROM = "TicoFinanza <no-responder@ticofinanza.com>";

/**
 * Manda el correo de bienvenida la primera vez que alguien se registra —
 * nunca en logins posteriores. Reclama el envío con un UPDATE condicional
 * (`welcome_email_sent_at is null`) antes de mandar el correo: si dos
 * requests llegaran a la vez (poco probable, pero el callback de OAuth
 * puede reintentarse), solo una gana la carrera y solo esa manda el correo.
 */
export async function sendWelcomeEmailIfFirstTime(
  admin: SupabaseClient,
  userId: string,
  email: string,
  firstName: string | undefined
): Promise<void> {
  const { data: claimed } = await admin
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", userId)
    .is("welcome_email_sent_at", null)
    .select("id")
    .maybeSingle();

  if (!claimed) return;

  try {
    await getResend().emails.send({
      from: WELCOME_EMAIL_FROM,
      to: email,
      subject: "Bienvenido a TicoFinanza — así cuidamos tu información",
      html: welcomeEmailHtml(firstName),
      text: welcomeEmailText(firstName),
    });
  } catch (err) {
    // No revertimos welcome_email_sent_at: preferible perder un correo de
    // bienvenida a mandarlo duplicado si Resend falla de forma intermitente.
    console.error("[sendWelcomeEmailIfFirstTime]", err);
  }
}

function welcomeEmailHtml(firstName: string | undefined): string {
  const greeting = firstName ? `Hola, ${firstName}` : "Hola";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#08090c;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090c;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:480px;background:#0e1014;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px;height:36px;border-radius:9px;background:#38bdf8;text-align:center;vertical-align:middle;font-weight:800;font-size:15px;color:#04141f;font-family:Arial,sans-serif;">
                      TF
                    </td>
                    <td style="padding-left:10px;color:#f4f6f8;font-size:15px;font-weight:600;letter-spacing:-0.01em;">
                      TicoFinanza
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;color:#f4f6f8;font-size:20px;font-weight:700;letter-spacing:-0.01em;">
                ${greeting}, ya tenés tu cuenta lista.
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 0 32px;color:#a2aab8;font-size:15px;line-height:1.6;">
                Antes de que sigas, queremos ser directos sobre algo que seguramente viste al
                entrar: Google te mostró un aviso de <strong style="color:#f4f6f8;">"app no verificada"</strong>.
                Ese aviso no significa que algo esté mal — cualquier app que lee notificaciones
                de Gmail, como la nuestra, tiene que pasar una revisión de seguridad de Google
                antes de que desaparezca. Ya está en trámite. Mientras tanto tu cuenta está
                igual de protegida y la app funciona exactamente igual.
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px 0 32px;color:#f4f6f8;font-size:14px;font-weight:600;">
                Qué hacemos con tu Gmail, sin vueltas:
              </td>
            </tr>
            <tr>
              <td style="padding:10px 32px 0 32px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 10px;">
                  <tr>
                    <td style="width:20px;color:#34d399;font-size:14px;vertical-align:top;">✓</td>
                    <td style="color:#a2aab8;font-size:14px;line-height:1.55;">
                      Solo leemos las notificaciones que tu banco ya te manda a este mismo
                      Gmail (BAC, BCR, Banco Nacional, Banco Popular, DaviBank, MUCAP, PayPal,
                      SINPE Móvil).
                    </td>
                  </tr>
                  <tr>
                    <td style="width:20px;color:#fb7185;font-size:14px;vertical-align:top;">✗</td>
                    <td style="color:#a2aab8;font-size:14px;line-height:1.55;">
                      Nunca vemos el resto de tu correo: nada personal, nada de contactos, nada
                      que no sea esas notificaciones bancarias puntuales.
                    </td>
                  </tr>
                  <tr>
                    <td style="width:20px;color:#fb7185;font-size:14px;vertical-align:top;">✗</td>
                    <td style="color:#a2aab8;font-size:14px;line-height:1.55;">
                      Nunca pedimos ni guardamos la clave de tu banca en línea. No la tenemos,
                      ni la necesitamos.
                    </td>
                  </tr>
                  <tr>
                    <td style="width:20px;color:#38bdf8;font-size:14px;vertical-align:top;">→</td>
                    <td style="color:#a2aab8;font-size:14px;line-height:1.55;">
                      Podés quitarle el acceso a TicoFinanza cuando quieras desde tu propia
                      cuenta de Google, sin escribirnos ni pedir permiso.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <a href="https://www.ticofinanza.com/dashboard"
                   style="display:block;text-align:center;background:#38bdf8;color:#04141f;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;padding:13px 0;">
                  Entrar a mi cuenta
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px 32px;color:#6b7382;font-size:12px;line-height:1.6;">
                Los detalles completos están en nuestra
                <a href="https://www.ticofinanza.com/privacidad" style="color:#7dd3fc;text-decoration:underline;">política de privacidad</a>.
                ¿Dudas? Respondé este correo o escribinos a
                <a href="mailto:info@ticofinanza.com" style="color:#7dd3fc;text-decoration:underline;">info@ticofinanza.com</a>.
                <br /><br />
                — Camil, TicoFinanza
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function welcomeEmailText(firstName: string | undefined): string {
  const greeting = firstName ? `Hola, ${firstName}` : "Hola";
  return `${greeting}, ya tenés tu cuenta de TicoFinanza lista.

Seguramente viste al entrar que Google muestra un aviso de "app no verificada". Ese aviso no significa que algo esté mal: cualquier app que lee notificaciones de Gmail, como la nuestra, tiene que pasar una revisión de seguridad de Google antes de que desaparezca. Ya está en trámite. Mientras tanto tu cuenta está igual de protegida y la app funciona exactamente igual.

Qué hacemos con tu Gmail, sin vueltas:
- Solo leemos las notificaciones que tu banco ya te manda a este mismo Gmail (BAC, BCR, Banco Nacional, Banco Popular, DaviBank, MUCAP, PayPal, SINPE Móvil).
- Nunca vemos el resto de tu correo: nada personal, nada de contactos, nada que no sea esas notificaciones bancarias puntuales.
- Nunca pedimos ni guardamos la clave de tu banca en línea. No la tenemos, ni la necesitamos.
- Podés quitarle el acceso a TicoFinanza cuando quieras desde tu propia cuenta de Google.

Entrá a tu cuenta: https://www.ticofinanza.com/dashboard

Los detalles completos están en la política de privacidad: https://www.ticofinanza.com/privacidad
¿Dudas? Respondé este correo o escribinos a info@ticofinanza.com.

— Camil, TicoFinanza`;
}
