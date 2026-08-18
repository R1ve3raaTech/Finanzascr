"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trash, Warning } from "@phosphor-icons/react";
import { deleteAllTransactions } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;
const CONFIRM_WORD = "ELIMINAR";

export function DangerZone({ transactionCount }: { transactionCount: number }) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setTyped("");
    setError(null);
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAllTransactions();
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Todas las transacciones fueron eliminadas");
        close();
      }
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Eliminar transacciones</h3>
          <p className="text-xs text-ink-3">
            Borra todos tus movimientos (automáticos y manuales). No se puede deshacer.
          </p>
        </div>
        <motion.button
          onClick={() => setOpen(true)}
          disabled={transactionCount === 0}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={spring}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-expense/30 px-3 py-1.5 text-xs font-medium text-expense transition-colors hover:border-expense/50 hover:bg-expense/10 disabled:opacity-40 cursor-pointer"
        >
          <Trash size={14} weight="bold" />
          Eliminar todo
        </motion.button>
      </div>

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
              aria-label="Eliminar todas las transacciones"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              transition={spring}
              className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl border border-expense/20 bg-surface p-6 sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-expense/10">
                <Warning size={22} weight="bold" className="text-expense" />
              </div>
              <h2 className="text-base font-semibold text-ink">
                ¿Eliminar {transactionCount} transacción{transactionCount === 1 ? "" : "es"}?
              </h2>
              <p className="mt-1.5 text-sm text-ink-2">
                Esta acción es permanente y no se puede deshacer. Se van a borrar todos tus
                gastos e ingresos, incluidos los leídos automáticamente de tus correos.
              </p>

              <label className="mt-4 flex flex-col gap-1.5 text-xs text-ink-3">
                Escribí <span className="font-mono font-semibold text-expense">{CONFIRM_WORD}</span>{" "}
                para confirmar
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  className="rounded-lg border border-line bg-ground px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-expense/50"
                />
              </label>

              {error && <p className="mt-2 text-xs text-expense">{error}</p>}

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
                  disabled={pending || typed !== CONFIRM_WORD}
                  className="rounded-xl bg-danger py-2.5 text-sm font-semibold text-on-danger transition-colors hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {pending ? "Eliminando..." : "Eliminar todo"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
