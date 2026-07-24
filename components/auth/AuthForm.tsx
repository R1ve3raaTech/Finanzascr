"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Envelope, Eye, EyeSlash, LockSimple, User } from "@phosphor-icons/react";
import { signInWithEmail, signUpWithEmail } from "@/app/auth/actions";
import { signInWithGoogle } from "@/lib/supabase/client";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

type Mode = "login" | "signup";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50";

export function AuthForm() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [dir, setDir] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, startTransition] = useTransition();

  function switchMode(next: Mode) {
    if (next === mode) return;
    setDir(next === "signup" ? 1 : -1);
    setMode(next);
    setError(null);
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

  if (needsConfirmation) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex max-w-sm flex-col gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
          <Check size={22} weight="bold" className="text-sky-400" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-50">Revisá tu correo</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Te mandamos un link a <span className="text-zinc-200">{email}</span> para confirmar
          la cuenta. Después de eso ya podés iniciar sesión.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {mode === "login" ? "Bienvenido de nuevo" : "Creá tu cuenta"}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          {mode === "login"
            ? "Entrá para ver tus movimientos."
            : "Empezá a controlar tus finanzas sin anotar nada a mano."}
        </p>
      </div>

      <motion.button
        onClick={() => signInWithGoogle()}
        whileHover={reduce ? undefined : { scale: 1.01 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-900 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/20 cursor-pointer"
      >
        <GoogleMark />
        Continuar con Google
      </motion.button>

      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <span className="h-px flex-1 bg-white/10" />
        o con tu correo
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-1 rounded-xl border border-white/10 p-1">
        <button
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
            mode === "login" ? "bg-zinc-800 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
            mode === "signup" ? "bg-zinc-800 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={mode}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            {mode === "signup" && (
              <div className="relative">
                <User
                  size={16}
                  weight="bold"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre"
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Envelope
                size={16}
                weight="bold"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Correo"
                className={inputClass}
              />
            </div>

            <div className="relative">
              <LockSimple
                size={16}
                weight="bold"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Contraseña"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <motion.button
        onClick={submit}
        disabled={pending || !email || !password}
        whileHover={reduce ? undefined : { scale: 1.01 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={tap}
        className="rounded-xl bg-sky-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
      >
        {pending ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </motion.button>
    </div>
  );
}
