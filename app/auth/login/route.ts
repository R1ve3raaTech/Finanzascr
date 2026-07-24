import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, LOGIN_SCOPE } from "@/lib/google/oauth";

const STATE_COOKIE = "login_state";
const NONCE_COOKIE = "login_nonce";

/**
 * Login principal, directo contra Google (no vía Supabase Auth). El
 * callback usa el id_token que devuelve Google para crear la sesión de
 * Supabase con signInWithIdToken — así la pantalla de consentimiento de
 * Google muestra el dominio real de la app, no "...supabase.co".
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/auth/callback`;

  const state = crypto.randomUUID();
  // Supabase's signInWithIdToken hashea el nonce que le pasás y lo compara
  // contra el claim "nonce" del id_token — así que a Google hay que
  // mandarle el hash, y guardar el nonce SIN hashear para dárselo a
  // Supabase después. Mandarle el mismo valor a los dos (como estaba antes)
  // rompe la verificación con "Nonces mismatch".
  const rawNonce = crypto.randomUUID();
  const hashedNonce = createHash("sha256").update(rawNonce).digest("hex");

  const response = NextResponse.redirect(
    buildGoogleAuthUrl(redirectUri, state, LOGIN_SCOPE, hashedNonce)
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/auth",
  };
  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(NONCE_COOKIE, rawNonce, cookieOptions);
  return response;
}
