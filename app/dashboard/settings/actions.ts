"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { issueDeletionCode, verifyDeletionCode } from "@/lib/accountDeletion";
import type { Theme, TransactionType } from "@/lib/types";

export async function updateProfile(input: {
  fullName: string;
  birthDate: string | null;
  avatarUrl: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const fullName = input.fullName.trim();
  if (!fullName) return { error: "El nombre no puede estar vacío." };

  if (input.birthDate && Number.isNaN(new Date(input.birthDate).getTime())) {
    return { error: "La fecha de nacimiento no es válida." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      birth_date: input.birthDate || null,
      avatar_url: input.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar el perfil. Intentá de nuevo." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function setBudget(category: string, monthlyLimit: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
    return { error: "El límite debe ser mayor a cero." };
  }

  const { error } = await supabase.from("budgets").upsert(
    { user_id: user.id, category, monthly_limit: monthlyLimit, currency: "CRC" },
    { onConflict: "user_id,category" }
  );

  if (error) return { error: "No se pudo guardar el presupuesto." };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/insights");
  return { error: null };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/insights");
  return { error: null };
}

export async function updateTheme(theme: Theme) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      theme,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "No se pudo guardar la preferencia." };
  revalidatePath("/dashboard/settings");
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

export async function deleteAllTransactions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);

  if (error) return { error: "Hubo un error. Volvé a intentarlo." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insights");
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

/**
 * Manda el código de eliminación de cuenta al correo real del usuario (el
 * mismo con el que hizo login con Google, no uno que pueda escribir a
 * mano). Limitado a 3 pedidos cada 15 minutos por usuario para que alguien
 * con la sesión abierta no pueda spamear el envío de correos.
 */
export async function requestAccountDeletionCode() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/");

  const admin = createAdminClient();

  const rateLimit = await checkRateLimit(admin, user.id, "request_deletion_code", {
    maxCalls: 3,
    windowSeconds: 900,
  });
  if (!rateLimit.allowed) {
    return {
      error: `Esperá ${Math.ceil(rateLimit.retryAfterSeconds! / 60)} min antes de pedir otro código.`,
    };
  }

  return issueDeletionCode(admin, user.id, user.email);
}

/**
 * Verifica el código y, si es correcto, borra el usuario de auth.users —
 * todas las tablas relacionadas caen en cascada (ver migración 0015).
 * Cierra la sesión después para que las cookies no queden apuntando a un
 * usuario que ya no existe.
 */
export async function confirmAccountDeletion(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const admin = createAdminClient();

  const result = await verifyDeletionCode(admin, user.id, code);
  if (!result.ok) return { error: result.error };

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return { error: "No se pudo eliminar la cuenta. Intentá de nuevo." };

  await supabase.auth.signOut();
  return { error: null };
}
