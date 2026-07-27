import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/** Cliente de Resend, creado una sola vez por proceso. */
export function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Falta RESEND_API_KEY en el entorno.");
    client = new Resend(apiKey);
  }
  return client;
}

export const DELETION_EMAIL_FROM = "TicoFinanza <no-responder@ticofinanza.com>";
