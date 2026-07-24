"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, EyeSlash, X } from "@phosphor-icons/react";
import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;
const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

type Mode = "login" | "signup";

export function EmailAuthModal({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, startTransition] = useTransition();

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNeedsConfirmation(false);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      if (mode === "signup") {
        const result = await signUpWithEmail({ email, password, fullName });
        if (result.error) setError(result.error);
        else if (result.needsConfirmation) setNeedsConfirmation(true);
      } else {
        const result = await signInWithEmail({ email, password });
        if (result?.error) setError(result.error);
      }
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
        transition={spring}
        className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
        >
          <X size={16} weight="bold" />
        </button>

        {needsConfirmation ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
              <Check size={22} weight="bold" className="text-sky-400" />
            </div>
            <p className="text-base font-semibold text-zinc-50">Revisá tu correo</p>
            <p className="text-sm text-zinc-400">
              Te mandamos un link a <span className="text-zinc-200">{email}</span> para
              confirmar la cuenta. Después de eso ya podés iniciar sesión.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-1 rounded-xl border border-white/10 p-1">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  mode === "login" ? "bg-zinc-800 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  mode === "signup" ? "bg-zinc-800 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Crear cuenta
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {mode === "signup" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-zinc-400">Nombre</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Correo</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Contraseña</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 pr-10 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <motion.button
                onClick={submit}
                disabled={pending || !email || !password}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={tap}
                className="mt-1 rounded-xl bg-sky-400 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
              >
                {pending
                  ? "Un momento..."
                  : mode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
