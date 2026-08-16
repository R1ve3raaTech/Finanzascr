"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

const MotionLink = motion.create(Link);

export function ProfileAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl?: string;
  name?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <MotionLink
      href="/dashboard/settings"
      aria-label="Editar perfil"
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={tap}
      title={name}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? "Perfil"}
          width={32}
          height={32}
          // Igual que en ProfileSettings: la imagen viene de Google o de un
          // archivo subido por el usuario, así que no se manda a procesar
          // con sharp/libvips en el servidor (ver ese archivo para el detalle).
          unoptimized
          className="h-8 w-8 rounded-full border border-line object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-xs font-medium text-ink-2">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
    </MotionLink>
  );
}
