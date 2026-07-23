"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";
import { categorizeUncategorized } from "@/app/dashboard/actions";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function CategorizeButton({ pendingCount }: { pendingCount: number }) {
  const reduce = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (pendingCount === 0) return null;

  function run() {
    setMessage(null);
    startTransition(async () => {
      const result = await categorizeUncategorized();
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(
          result.updated === 0
            ? "No se pudo categorizar ninguna."
            : `${result.updated} transacción${result.updated === 1 ? "" : "es"} categorizada${
                result.updated === 1 ? "" : "s"
              }.`
        );
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.button
        onClick={run}
        disabled={isPending}
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={tap}
        className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
      >
        <Sparkle size={14} weight="bold" />
        {isPending ? "Categorizando..." : `Categorizar con IA (${pendingCount})`}
      </motion.button>
      {message && <span className="text-xs text-zinc-500">{message}</span>}
    </div>
  );
}
