import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToken } from "@/lib/tokenCrypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Google solo manda refresh_token la primera vez (o con prompt=consent,
      // que forzamos en el login). Si no viene, dejamos el que ya teníamos.
      const refreshToken = data.session?.provider_refresh_token;
      if (refreshToken && data.user) {
        // Se usa el cliente admin porque el JWT recién emitido por
        // exchangeCodeForSession no se propaga a tiempo para pasar RLS
        // en esta misma request. El usuario ya fue verificado arriba.
        const admin = createAdminClient();
        const { error: tokenError } = await admin.from("gmail_tokens").upsert(
          {
            user_id: data.user.id,
            email: data.user.email,
            refresh_token: encryptToken(refreshToken),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,email" }
        );
        if (tokenError) {
          console.error("[auth/callback] no se pudo guardar gmail_tokens:", tokenError);
        }
      } else {
        console.warn(
          "[auth/callback] Google no devolvió provider_refresh_token en este login."
        );
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
