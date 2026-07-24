import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exchangeGoogleAuthCode,
  getGoogleAccountEmail,
} from "@/lib/google/oauth";

const STATE_COOKIE = "gmail_connect_state";

function redirectAndClearState(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectAndClearState(`${origin}/dashboard/settings?gmail_error=1`);
  }

  try {
    const redirectUri = `${origin}/auth/gmail-connect/callback`;
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);

    if (!tokens.refresh_token) {
      return redirectAndClearState(`${origin}/dashboard/settings?gmail_error=1`);
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
      return redirectAndClearState(`${origin}/dashboard/settings?gmail_error=1`);
    }

    return redirectAndClearState(`${origin}/dashboard/settings?gmail_connected=1`);
  } catch {
    return redirectAndClearState(`${origin}/dashboard/settings?gmail_error=1`);
  }
}
