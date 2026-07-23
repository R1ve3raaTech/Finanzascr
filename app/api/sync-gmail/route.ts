import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncGmailForUser } from "@/lib/google/sync";

/**
 * Disparado por un cron externo (Vercel Cron llama con GET; cron-job.org u
 * otros pueden usar POST) cada pocos minutos. Protegido con un secreto
 * compartido, no con sesión de usuario. Vercel agrega automáticamente
 * "Authorization: Bearer $CRON_SECRET" en sus llamadas de cron si esa
 * variable de entorno existe en el proyecto.
 */
async function handleSync(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days")) || 3;
  const maxResults = Number(url.searchParams.get("limit")) || 100;

  const supabase = createAdminClient();
  const { data: tokens, error } = await supabase
    .from("gmail_tokens")
    .select("id, user_id, refresh_token");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let usersProcessed = 0;
  let transactionsInserted = 0;
  const errors: string[] = [];

  for (const row of tokens ?? []) {
    try {
      const result = await syncGmailForUser({
        admin: supabase,
        userId: row.user_id,
        refreshToken: row.refresh_token,
        tokenId: row.id,
        days,
        maxResults,
      });
      transactionsInserted += result.transactionsInserted;
      errors.push(...result.errors.map((e) => `${row.user_id}/${e}`));
      usersProcessed++;
    } catch (err) {
      errors.push(`${row.user_id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ usersProcessed, transactionsInserted, errors });
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
