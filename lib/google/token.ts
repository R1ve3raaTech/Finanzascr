import "server-only";

interface RefreshedToken {
  access_token: string;
  expires_in: number;
}

/**
 * Intercambia el refresh token guardado en gmail_tokens por un access token
 * fresco. El refresh token de Google no expira (salvo revocación manual).
 */
export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<RefreshedToken> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo refrescar el access token de Google: ${response.status}`);
  }

  return response.json();
}
