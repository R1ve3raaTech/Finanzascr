"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SignOut } from "@phosphor-icons/react";
import { signOut } from "@/app/dashboard/actions";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function SignOutButton() {
  const reduce = useReducedMotion();

  return (
    <motion.button
      onClick={() => signOut()}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={tap}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 cursor-pointer"
    >
      <SignOut size={14} weight="bold" />
      Salir
    </motion.button>
  );
}
