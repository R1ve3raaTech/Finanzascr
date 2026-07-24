import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export default async function EntrarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-[100dvh] bg-zinc-950 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <Link href="/" className="animate-fade-up mb-10 inline-flex w-fit">
          <Logo subtitle="finanzas personales" />
        </Link>
        <div className="animate-fade-up [animation-delay:80ms]">
          <AuthForm />
        </div>
      </div>
      <AuthShowcase />
    </main>
  );
}
