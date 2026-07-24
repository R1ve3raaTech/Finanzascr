import { redirect } from "next/navigation";
import { WelcomeOnboarding } from "@/components/onboarding/WelcomeOnboarding";
import { createClient } from "@/lib/supabase/server";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) redirect("/dashboard");

  const metadata = user.user_metadata as Record<string, string | undefined>;
  const initialFullName = profile?.full_name || metadata?.full_name || metadata?.name || "";
  const initialAvatarUrl = profile?.avatar_url || metadata?.avatar_url || metadata?.picture || null;

  return (
    <WelcomeOnboarding
      userId={user.id}
      initialFullName={initialFullName}
      initialAvatarUrl={initialAvatarUrl}
    />
  );
}
