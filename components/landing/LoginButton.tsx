"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function LoginButton({ large = false }: { large?: boolean }) {
  const reduce = useReducedMotion();
  const MotionLink = motion.create(Link);

  return (
    <MotionLink
      href="/entrar"
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-2 rounded-full bg-zinc-50 text-zinc-950 font-medium shadow-[0_8px_30px_rgba(56,189,248,0.12)] hover:shadow-[0_8px_40px_rgba(56,189,248,0.2)] transition-shadow cursor-pointer ${
        large ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm"
      }`}
    >
      Iniciar sesión
    </MotionLink>
  );
}
