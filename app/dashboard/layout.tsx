import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { resolveAvatarUrl, resolveFirstName } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell compartido por /dashboard, /dashboard/insights y /dashboard/settings:
 * agrega la barra lateral de escritorio sin tocar el header mobile que cada
 * página ya trae (ese header pasa a `lg:hidden` en cada page.tsx). Si no hay
 * sesión, cada página sigue haciendo su propio `redirect("/")` — acá solo se
 * intenta traer nombre/foto para la barra, sin bloquear el render si falla.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName: string | undefined;
  let avatarUrl: string | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    firstName = resolveFirstName(user, profile?.full_name);
    avatarUrl = resolveAvatarUrl(user, profile?.avatar_url);
  }

  return (
    <div className="lg:flex">
      <AppSidebar name={firstName} avatarUrl={avatarUrl} />
      <div className="min-w-0 lg:flex-1">{children}</div>
    </div>
  );
}
