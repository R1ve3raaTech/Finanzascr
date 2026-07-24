"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SignOut } from "@phosphor-icons/react";
import { signOut } from "@/app/dashboard/actions";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

export function SignOutButton() {
  const reduce = useReducedMotion();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setConfirming(true)}
        aria-label="Cerrar sesión"
        whileHover={reduce ? undefined : { scale: 1.04 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={tap}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 cursor-pointer sm:px-4"
      >
        <SignOut size={14} weight="bold" />
        <span className="hidden sm:inline">Salir</span>
      </motion.button>

      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirming(false)}
              className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm"
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label="Confirmar cierre de sesión"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={spring}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:inset-x-0"
            >
              <h2 className="text-base font-semibold text-zinc-50">
                ¿Cerrar sesión?
              </h2>
              <p className="mt-1.5 text-sm text-zinc-400">
                Vas a tener que volver a iniciar sesión con Google para ver tu dashboard.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <motion.button
                  onClick={() => setConfirming(false)}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={tap}
                  className="rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-100 cursor-pointer"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={() => signOut()}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={tap}
                  className="rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-zinc-50 transition-colors hover:bg-rose-400 cursor-pointer"
                >
                  Salir
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
