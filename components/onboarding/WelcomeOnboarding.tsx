"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera } from "@phosphor-icons/react";
import { completeOnboarding, skipOnboarding } from "@/app/bienvenida/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

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
    <main className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-zinc-950 px-6 py-16 sm:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="-rotate-6 select-none whitespace-nowrap font-montserrat text-[26vw] font-bold leading-none text-white/[0.025] sm:text-[20vw]">
          TicoFinanza
        </span>
      </div>
      <div
        aria-hidden="true"
        className="auth-blob-a pointer-events-none absolute right-[-15%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-sky-400/[0.06] blur-[120px]"
      />

      <div className="relative flex w-full max-w-2xl flex-1 flex-col justify-center gap-10">
        <motion.span
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex w-fit -rotate-2 items-center rounded-md border border-dashed border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-400"
        >
          Antes de arrancar
        </motion.span>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-x-3 gap-y-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl md:text-[2.75rem]"
        >
          <span>Qué bueno tenerte,</span>
          <span className="inline-flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Elegir foto de perfil"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-zinc-900 cursor-pointer disabled:opacity-60 sm:h-12 sm:w-12"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Tu foto de perfil"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera size={18} weight="bold" className="text-zinc-600" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 text-transparent transition-colors group-hover:bg-zinc-950/50 group-hover:text-zinc-100">
                <Camera size={16} weight="bold" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="tu nombre"
              style={{ width: `${Math.max(fullName.length || 9, 5)}ch` }}
              className="max-w-full border-b-2 border-white/15 bg-transparent px-1 pb-0.5 text-inherit outline-none placeholder:text-zinc-700 focus:border-sky-400"
            />
          </span>
          <span>.</span>
        </motion.div>

        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[48ch] text-sm leading-relaxed text-zinc-500"
        >
          {uploading ? "Subiendo tu foto..." : "Tocá el círculo para ponerle una foto. Es opcional, como todo lo demás acá — esto toma menos de un minuto."}
        </motion.p>

        <motion.label
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-fit flex-col gap-1.5"
        >
          <span className="text-xs font-medium text-zinc-400">
            ¿Cuándo es tu cumple? <span className="font-normal text-zinc-600">(por si un día queremos saludarte 🎂)</span>
          </span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-56 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
          />
        </motion.label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-5"
        >
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
        </motion.div>
      </div>
    </main>
  );
}
