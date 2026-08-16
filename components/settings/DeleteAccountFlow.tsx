"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EnvelopeSimple, ShieldWarning, Trash } from "@phosphor-icons/react";
import {
  confirmAccountDeletion,
  requestAccountDeletionCode,
} from "@/app/dashboard/settings/actions";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;
const CONFIRM_WORD = "ELIMINAR";

type Step = "warn" | "sent" | "deleted";

export function DeleteAccountFlow({ email }: { email: string }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("warn");
  const [code, setCode] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useLockBodyScroll(open);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  function close() {
    if (pending) return;
    setOpen(false);
    setStep("warn");
    setCode("");
    setTyped("");
    setError(null);
  }

  function sendCode() {
    setError(null);
    startTransition(async () => {
      const result = await requestAccountDeletionCode();
      if (result.error) {
        setError(result.error);
      } else {
        setStep("sent");
      }
    });
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmAccountDeletion(code);
      if (result.error) {
        setError(result.error);
      } else {
        setStep("deleted");
        setTimeout(() => router.push("/"), 1800);
      }
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Eliminar cuenta</h3>
          <p className="text-xs text-ink-3">
            Borra tu cuenta y todos tus datos para siempre. No se puede deshacer.
          </p>
        </div>
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={spring}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-rose-400/30 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:border-rose-400/50 hover:bg-rose-400/10 cursor-pointer"
        >
          <Trash size={14} weight="bold" />
          Eliminar cuenta
        </motion.button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                  className="fixed inset-0 z-50 bg-ground/70 backdrop-blur-sm"
                />
                <motion.div
                  role="alertdialog"
                  aria-modal="true"
                  aria-label="Eliminar cuenta"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
                  transition={spring}
                  className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[85dvh] max-w-sm -translate-y-1/2 overflow-y-auto rounded-2xl border border-rose-400/20 bg-surface p-6 sm:inset-x-0"
                >
                  {step === "warn" && (
                    <>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-400/10">
                        <ShieldWarning size={22} weight="bold" className="text-rose-400" />
                      </div>
                      <h2 className="text-base font-semibold text-ink">
                        ¿Eliminar tu cuenta permanentemente?
                      </h2>
                      <p className="mt-1.5 text-sm text-ink-2">
                        Se borran tus transacciones, categorías, presupuestos, metas y la
                        conexión con Gmail. No hay forma de recuperarlo después.
                      </p>
                      <p className="mt-3 text-xs text-ink-3">
                        Te vamos a mandar un código de un solo uso a{" "}
                        <span className="text-ink-2">{email}</span> para confirmar que sos
                        vos.
                      </p>

                      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          onClick={close}
                          disabled={pending}
                          className="rounded-xl border border-line py-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={sendCode}
                          disabled={pending}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          <EnvelopeSimple size={15} weight="bold" />
                          {pending ? "Enviando..." : "Mandar código"}
                        </button>
                      </div>
                    </>
                  )}

                  {step === "sent" && (
                    <>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-400/10">
                        <EnvelopeSimple size={22} weight="bold" className="text-rose-400" />
                      </div>
                      <h2 className="text-base font-semibold text-ink">Revisá tu correo</h2>
                      <p className="mt-1.5 text-sm text-ink-2">
                        Te mandamos un código de 8 dígitos a {email}. Vence en 10 minutos.
                      </p>

                      <label className="mt-4 flex flex-col gap-1.5 text-xs text-ink-3">
                        Código de 8 dígitos
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                          inputMode="numeric"
                          autoFocus
                          placeholder="00000000"
                          className="rounded-lg border border-line bg-ground px-3 py-2 font-mono text-lg tracking-[0.2em] text-ink outline-none transition-colors focus:border-rose-400/50"
                        />
                      </label>

                      <label className="mt-3 flex flex-col gap-1.5 text-xs text-ink-3">
                        Escribí{" "}
                        <span className="font-mono font-semibold text-rose-400">
                          {CONFIRM_WORD}
                        </span>{" "}
                        para confirmar
                        <input
                          value={typed}
                          onChange={(e) => setTyped(e.target.value)}
                          className="rounded-lg border border-line bg-ground px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-rose-400/50"
                        />
                      </label>

                      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          onClick={close}
                          disabled={pending}
                          className="rounded-xl border border-line py-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirm}
                          disabled={pending || code.length !== 8 || typed !== CONFIRM_WORD}
                          className="rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          {pending ? "Eliminando..." : "Eliminar cuenta"}
                        </button>
                      </div>

                      <button
                        onClick={sendCode}
                        disabled={pending}
                        className="mt-3 w-full text-center text-xs text-ink-3 transition-colors hover:text-ink-2 disabled:opacity-50 cursor-pointer"
                      >
                        Reenviar código
                      </button>
                    </>
                  )}

                  {step === "deleted" && (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10">
                        <Trash size={22} weight="bold" className="text-emerald-400" />
                      </div>
                      <h2 className="text-base font-semibold text-ink">Cuenta eliminada</h2>
                      <p className="text-sm text-ink-2">
                        Todos tus datos fueron borrados. Te llevamos al inicio...
                      </p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
