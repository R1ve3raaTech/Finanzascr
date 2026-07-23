import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exchangeGoogleAuthCode,
  getGoogleAccountEmail,
} from "@/lib/google/oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?gmail_error=1`);
  }

  try {
    const redirectUri = `${origin}/auth/gmail-connect/callback`;
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${origin}/dashboard/settings?gmail_error=1`);
    }

    const email = await getGoogleAccountEmail(tokens.access_token);

    const admin = createAdminClient();
    const { error } = await admin.from("gmail_tokens").upsert(
      {
        user_id: user.id,
        email,
        refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,email" }
    );

    if (error) {
      return NextResponse.redirect(`${origin}/dashboard/settings?gmail_error=1`);
    }

    return NextResponse.redirect(`${origin}/dashboard/settings?gmail_connected=1`);
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/settings?gmail_error=1`);
  }
}
