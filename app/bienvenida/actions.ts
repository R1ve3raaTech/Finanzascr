"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(input: {
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
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: "No se pudo guardar. Intentá de nuevo." };

  redirect("/dashboard");
}

/** "Ahora no": no pisa nombre/foto/fecha, solo marca que ya no hay que insistir. */
export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect("/dashboard");
}
