import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleAuthUrl } from "@/lib/google/oauth";

const STATE_COOKIE = "gmail_connect_state";

/**
 * Inicia la conexión de una cuenta de Gmail adicional (distinta a la de
 * login) sin cerrar la sesión actual. Redirige directo a Google, no pasa
 * por Supabase Auth.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/auth/gmail-connect/callback`;

  // Parámetro state anti-CSRF: sin esto, alguien podría hacer que tu sesión
  // canjee el "code" de OTRA persona y le conecte su cuenta de Gmail a la
  // tuya. Se guarda en una cookie httpOnly de corta vida y se valida en el
  // callback antes de canjear el code.
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(redirectUri, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/auth/gmail-connect",
  });
  return response;
}
