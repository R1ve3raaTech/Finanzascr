"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!email || !input.password) {
    return { error: "Completá el correo y la contraseña.", needsConfirmation: false };
  }
  if (input.password.length < 6) {
    return {
      error: "La contraseña debe tener al menos 6 caracteres.",
      needsConfirmation: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: fullName ? { data: { full_name: fullName } } : undefined,
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return {
        error: "Ese correo ya tiene una cuenta. Iniciá sesión en vez de registrarte.",
        needsConfirmation: false,
      };
    }
    if (error.code === "weak_password") {
      return { error: "Esa contraseña es muy débil.", needsConfirmation: false };
    }
    return { error: "No se pudo crear la cuenta. Intentá de nuevo.", needsConfirmation: false };
  }

  // Si el proyecto pide confirmar el correo antes de dejar entrar, Supabase
  // no devuelve sesión todavía.
  if (!data.session) {
    return { error: null, needsConfirmation: true };
  }

  redirect("/dashboard");
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    return { error: "Completá el correo y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirmá tu correo antes de iniciar sesión (revisá tu bandeja)." };
    }
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/dashboard");
}
