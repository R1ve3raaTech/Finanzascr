import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleAuthUrl } from "@/lib/google/oauth";

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
  return NextResponse.redirect(buildGoogleAuthUrl(redirectUri));
}
