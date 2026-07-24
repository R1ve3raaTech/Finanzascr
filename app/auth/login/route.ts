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
  const nonce = crypto.randomUUID();

  const response = NextResponse.redirect(
    buildGoogleAuthUrl(redirectUri, state, LOGIN_SCOPE, nonce)
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/auth",
  };
  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(NONCE_COOKIE, nonce, cookieOptions);
  return response;
}
