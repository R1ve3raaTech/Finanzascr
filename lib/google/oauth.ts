import "server-only";

/**
 * Flujo de OAuth directo contra Google (no vía Supabase Auth) para conectar
 * cuentas de Gmail adicionales sin cerrar la sesión actual del usuario.
 */
export function buildGoogleAuthUrl(redirectUri: string): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email"
  );
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeGoogleAuthCode(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    throw new Error(`No se pudo canjear el código de Google: ${response.status}`);
  }
  return response.json();
}

export async function getGoogleAccountEmail(accessToken: string): Promise<string> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`No se pudo obtener el correo de la cuenta: ${response.status}`);
  }
  const data = await response.json();
  return data.email as string;
}
