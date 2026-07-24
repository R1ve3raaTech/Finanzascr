"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Camera } from "@phosphor-icons/react";
import { updateProfile } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function ProfileSettings({
  userId,
  initialFullName,
  initialBirthDate,
  initialAvatarUrl,
}: {
  userId: string;
  initialFullName: string;
  initialBirthDate: string | null;
  initialAvatarUrl: string | null;
}) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

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
    setSaved(false);
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
      // Cache-bust para que se vea la nueva foto al toque, no la vieja cacheada.
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(bustedUrl);

      const result = await updateProfile({
        fullName,
        birthDate: birthDate || null,
        avatarUrl: bustedUrl,
      });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Foto de perfil actualizada");
      }
    } catch {
      const message = "No se pudo subir la foto. Intentá de nuevo.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile({ fullName, birthDate: birthDate || null, avatarUrl });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setSaved(true);
        toast.success("Perfil actualizado");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Perfil</h3>
        <p className="text-xs text-zinc-500">Tu nombre, foto y fecha de nacimiento.</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Cambiar foto de perfil"
          className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-950 cursor-pointer disabled:opacity-60"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Foto de perfil"
              width={64}
              height={64}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium text-zinc-400">
              {fullName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-950/0 text-transparent transition-colors group-hover:bg-zinc-950/50 group-hover:text-zinc-100">
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
        <div className="text-xs text-zinc-500">
          {uploading ? "Subiendo..." : "Tocá la foto para cambiarla. Máximo 5MB."}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-400">Nombre</span>
        <input
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSaved(false);
          }}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-400">Fecha de nacimiento</span>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => {
            setBirthDate(e.target.value);
            setSaved(false);
          }}
          max={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
        />
      </label>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <motion.button
        onClick={save}
        disabled={pending || !fullName.trim()}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="self-start rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
      >
        {pending ? "Guardando..." : saved ? "Guardado" : "Guardar"}
      </motion.button>
    </div>
  );
}
