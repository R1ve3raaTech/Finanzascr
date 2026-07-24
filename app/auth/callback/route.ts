import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleAuthCode } from "@/lib/google/oauth";
import { encryptToken } from "@/lib/tokenCrypto";

const STATE_COOKIE = "login_state";
const NONCE_COOKIE = "login_nonce";

function redirectAndClearState(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NONCE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const nonce = request.cookies.get(NONCE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectAndClearState(`${origin}/?error=auth`);
  }

  try {
    const redirectUri = `${origin}/auth/callback`;
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);

    if (!tokens.id_token) {
      console.error("[auth/callback] Google no devolvió id_token.");
      return redirectAndClearState(`${origin}/?error=auth`);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
      access_token: tokens.access_token,
      nonce,
    });

    if (error || !data.user) {
      console.error("[auth/callback] signInWithIdToken falló:", error);
      return redirectAndClearState(`${origin}/?error=auth`);
    }

    // Google solo manda refresh_token la primera vez (o con prompt=consent,
    // que forzamos siempre). Si no viene, dejamos el que ya teníamos.
    if (tokens.refresh_token) {
      const admin = createAdminClient();
      const { error: tokenError } = await admin.from("gmail_tokens").upsert(
        {
          user_id: data.user.id,
          email: data.user.email,
          refresh_token: encryptToken(tokens.refresh_token),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,email" }
      );
      if (tokenError) {
        console.error("[auth/callback] no se pudo guardar gmail_tokens:", tokenError);
      }
    } else {
      console.warn("[auth/callback] Google no devolvió refresh_token en este login.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", data.user.id)
      .maybeSingle();

    const destination = profile?.onboarding_completed_at ? "/dashboard" : "/bienvenida";
    return redirectAndClearState(`${origin}${destination}`);
  } catch (err) {
    console.error("[auth/callback]", err);
    return redirectAndClearState(`${origin}/?error=auth`);
  }
}
