"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function ProfileAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl?: string;
  name?: string;
}) {
  const reduce = useReducedMotion();
  const MotionLink = motion.create(Link);

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
          className="h-8 w-8 rounded-full border border-white/10 object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-xs font-medium text-zinc-300">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
    </MotionLink>
  );
}
