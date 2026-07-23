"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { syncMyGmail } from "@/app/dashboard/actions";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function SyncGmailButton() {
  const reduce = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function sync() {
    setMessage(null);
    startTransition(async () => {
      const result = await syncMyGmail();
      if (result.error) {
        setMessage(result.error);
      } else if (result.inserted === 0) {
        setMessage("Sin movimientos nuevos.");
      } else {
        setMessage(
          `${result.inserted} movimiento${result.inserted === 1 ? "" : "s"} nuevo${
            result.inserted === 1 ? "" : "s"
          }.`
        );
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-xs text-zinc-500">{message}</span>}
      <motion.button
        onClick={sync}
        disabled={pending}
        aria-label="Leer correos ahora"
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={tap}
        className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
      >
        <motion.span
          animate={pending ? { rotate: 360 } : { rotate: 0 }}
          transition={
            pending
              ? { repeat: Infinity, duration: 0.8, ease: "linear" }
              : { duration: 0.2 }
          }
          className="flex"
        >
          <ArrowsClockwise size={14} weight="bold" />
        </motion.span>
        {pending ? "Leyendo..." : "Leer correos"}
      </motion.button>
    </div>
  );
}
