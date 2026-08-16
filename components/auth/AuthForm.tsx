"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GoogleMark } from "@/components/GoogleMark";
import { signInWithGoogle } from "@/lib/supabase/client";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function AuthForm() {
  const reduce = useReducedMotion();

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Entrá a tu cuenta</h1>
        <p className="mt-1.5 text-sm text-ink-3">
          Con tu cuenta de Google activás la lectura automática de tus correos bancarios.
        </p>
      </div>

      <motion.button
        onClick={() => signInWithGoogle()}
        whileHover={reduce ? undefined : { scale: 1.01 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="inline-flex items-center justify-center gap-3 rounded-xl border border-line bg-surface py-3.5 text-sm font-medium text-ink transition-colors hover:border-line-strong cursor-pointer"
      >
        <GoogleMark size={20} />
        Continuar con Google
      </motion.button>

      <p className="text-center text-xs text-ink-3">
        Si es la primera vez, se crea tu cuenta automáticamente.
      </p>
    </div>
  );
}
