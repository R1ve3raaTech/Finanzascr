"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Currency, TransactionType } from "@/lib/types";

export async function updateDefaultCurrency(currency: Currency) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      default_currency: currency,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "No se pudo guardar la preferencia." };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function setNotificationsEnabled(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      notifications_enabled: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (!enabled) {
    await supabase.from("push_subscriptions").delete().eq("user_id", user.id);
  }

  if (error) return { error: "No se pudo guardar la preferencia." };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function addCategory(name: string, type: TransactionType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trimmed = name.trim();
  if (!trimmed) return { error: "Escribí un nombre para la categoría." };

  const { error } = await supabase
    .from("user_categories")
    .insert({ user_id: user.id, name: trimmed, type });

  if (error) {
    return {
      error: error.code === "23505" ? "Esa categoría ya existe." : "No se pudo agregar.",
    };
  }
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function disconnectGmail(tokenId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Se usa el cliente admin porque no hay política de select/delete pública
  // sobre gmail_tokens (guarda un refresh token, es sensible); se valida la
  // pertenencia a mano con el eq("user_id", ...) de abajo.
  const admin = createAdminClient();
  const { error } = await admin
    .from("gmail_tokens")
    .delete()
    .eq("id", tokenId)
    .eq("user_id", user.id);

  if (error) return { error: "No se pudo desconectar la cuenta." };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("user_categories").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}
