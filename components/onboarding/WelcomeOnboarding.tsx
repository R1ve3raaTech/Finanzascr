"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, ShieldCheck } from "@phosphor-icons/react";
import { completeOnboarding, skipOnboarding } from "@/app/bienvenida/actions";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "";
}

function memberSince(): string {
  const label = new Date().toLocaleDateString("es-CR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function WelcomeOnboarding({
  userId,
  initialFullName,
  initialAvatarUrl,
}: {
  userId: string;
  initialFullName: string;
  initialAvatarUrl: string | null;
}) {
  const reduce = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [skipping, startSkipTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Elegí un archivo de imagen.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("La imagen no puede pesar más de 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    } catch {
      setError("No se pudo subir la foto. Intentá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        fullName,
        birthDate: birthDate || null,
        avatarUrl,
      });
      if (result?.error) setError(result.error);
    });
  }

  function skip() {
    startSkipTransition(async () => {
      await skipOnboarding();
    });
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-zinc-950 lg:flex-row">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-blob-a absolute left-[-10%] top-[-5%] h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-[110px]" />
        <div className="auth-blob-b absolute bottom-[-10%] right-[-5%] h-[24rem] w-[24rem] rounded-full bg-emerald-400/[0.06] blur-[110px]" />
      </div>

      <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-[55%] lg:px-20">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <Logo subtitle="finanzas personales" />

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              {firstName(initialFullName) ? `¡Qué bueno tenerte, ${firstName(initialFullName)}!` : "¡Bienvenido/a!"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Antes de mostrarte tus movimientos, terminemos de armar tu cuenta. Toma menos de
              un minuto, y podés cambiar todo esto después desde Ajustes.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Elegir foto de perfil"
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-900 cursor-pointer disabled:opacity-60"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Tu foto de perfil"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-zinc-500">
                  {fullName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 text-transparent transition-colors group-hover:bg-zinc-950/50 group-hover:text-zinc-100">
                <Camera size={20} weight="bold" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-zinc-500">
              {uploading ? "Subiendo..." : "Tocá el círculo para poner una foto (opcional)."}
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">¿Cómo te llamás?</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">
                Fecha de nacimiento{" "}
                <span className="font-normal text-zinc-600">
                  (opcional, por si un día queremos saludarte 🎂)
                </span>
              </span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
              />
            </label>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <div className="mt-2 flex items-center gap-4">
              <motion.button
                onClick={submit}
                disabled={pending || !fullName.trim()}
                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
              >
                {pending ? "Guardando..." : "Empezar a usar TicoFinanza"}
                {!pending && <ArrowRight size={16} weight="bold" />}
              </motion.button>
              <button
                onClick={skip}
                disabled={skipping}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer disabled:opacity-40"
              >
                Ahora no
              </button>
            </div>
          </motion.div>

          <p className="flex items-center gap-1.5 text-xs text-zinc-600">
            <ShieldCheck size={13} weight="bold" className="text-sky-400" />
            Solo vos ves estos datos. Nunca los vendemos.
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center border-l border-white/10 lg:flex">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.94, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          whileHover={reduce ? undefined : { rotate: 0, scale: 1.02 }}
          className="flex w-72 flex-col gap-5 rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-xs font-bold tracking-tight text-zinc-50">
              TicoFinanza
            </span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
              Miembro
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-950">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-zinc-600">
                  {fullName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <p className="max-w-full truncate text-base font-medium text-zinc-50">
              {fullName.trim() || "Tu nombre acá"}
            </p>
            <p className="text-xs text-zinc-500">Miembro desde {memberSince()}</p>
          </div>

          <div className="border-t border-white/5 pt-4 text-center text-[11px] text-zinc-600">
            Costa Rica 🇨🇷
          </div>
        </motion.div>
      </div>
    </main>
  );
}
