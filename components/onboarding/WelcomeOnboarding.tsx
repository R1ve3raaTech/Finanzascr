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
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-ground px-6 py-16 sm:px-10">
      <div
        aria-hidden="true"
        className="auth-blob-a pointer-events-none absolute right-[-15%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-accent/[0.07] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-[22rem] w-[22rem] rounded-full bg-accent/[0.04] blur-[120px]"
      />

      <div className="relative flex w-full max-w-md flex-col gap-8">
        <motion.span
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex w-fit -rotate-2 items-center rounded-md border border-dashed border-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-2"
        >
          Antes de arrancar
        </motion.span>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Qué bueno tenerte.
          </h1>
          <p className="text-sm leading-relaxed text-ink-3">
            Dos datos opcionales y listo — menos de un minuto.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Elegir foto de perfil"
            className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-ground cursor-pointer disabled:opacity-60"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Tu foto de perfil"
                width={56}
                height={56}
                // Igual que en ProfileSettings/ProfileAvatar: no se manda a
                // procesar con sharp/libvips en el servidor (ver ese archivo
                // para el detalle — CVEs de severidad alta en esa librería).
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera size={20} weight="bold" className="text-ink-3" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-ground/0 text-transparent transition-colors group-hover:bg-ground/50 group-hover:text-ink">
              <Camera size={18} weight="bold" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full border-b border-line-strong bg-transparent pb-1 text-base font-medium text-ink outline-none placeholder:text-ink-3 focus:border-accent"
            />
            <span className="text-xs text-ink-3">
              {uploading ? "Subiendo tu foto..." : "Tocá el círculo para ponerle una foto (opcional)"}
            </span>
          </div>
        </motion.div>

        <motion.label
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-1.5"
        >
          <span className="text-xs font-medium text-ink-2">
            ¿Cuándo es tu cumple? <span className="font-normal text-ink-3">(opcional — por si un día te queremos saludar)</span>
          </span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/50"
          />
        </motion.label>

        {error && <p className="text-sm text-expense">{error}</p>}

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
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
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {pending ? "Guardando..." : "Empezar a usar TicoFinanza"}
            {!pending && <ArrowRight size={16} weight="bold" />}
          </motion.button>
          <button
            onClick={skip}
            disabled={skipping}
            className="text-sm text-ink-3 transition-colors hover:text-ink-2 cursor-pointer disabled:opacity-40"
          >
            Ahora no
          </button>
        </motion.div>
      </div>
    </main>
  );
}
