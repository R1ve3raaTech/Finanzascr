"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trash, X } from "@phosphor-icons/react";
import { createSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { CURRENCY_LABEL, CURRENCY_SYMBOL } from "@/lib/transactionFormOptions";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import type { Currency, SavingsGoal } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

export function GoalModal({
  open,
  goal,
  onClose,
}: {
  open: boolean;
  /** null = crear una meta nueva; una meta = editarla. */
  goal: SavingsGoal | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  useLockBodyScroll(open);
  const toast = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("CRC");
  const [targetDate, setTargetDate] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // La sección que envuelve este componente tiene una animación de entrada
  // que deja un `transform` en el ancestro (aunque sea la identidad), lo
  // cual crea un containing block nuevo para `position: fixed` y rompe el
  // modal (queda posicionado relativo a la sección, no al viewport, y los
  // clicks caen en el contenido de atrás). Un portal a <body> lo evita.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Reinicializa el formulario cada vez que el modal se abre (para una meta
  // nueva o para editar otra) comparando contra la sesión anterior durante
  // el render, en vez de un efecto — evita un render extra innecesario.
  const sessionKey = open ? (goal?.id ?? "new") : null;
  const [lastSessionKey, setLastSessionKey] = useState<string | null>(null);
  if (sessionKey !== null && sessionKey !== lastSessionKey) {
    setLastSessionKey(sessionKey);
    setName(goal?.name ?? "");
    setAmount(goal ? String(goal.target_amount) : "");
    setCurrency(goal?.currency ?? "CRC");
    setTargetDate(goal?.target_date ?? "");
    setConfirmingDelete(false);
    setError(null);
  }

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Ponele un nombre a la meta.");
      return;
    }
    if (!amount || Number(amount.replace(",", ".")) <= 0) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }
    startTransition(async () => {
      const input = {
        name: name.trim(),
        targetAmount: Number(amount.replace(",", ".")),
        currency,
        targetDate: targetDate || null,
      };
      const result = goal
        ? await updateSavingsGoal(goal.id, input)
        : await createSavingsGoal(input);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success(goal ? "Meta actualizada" : "Meta creada");
        onClose();
      }
    });
  }

  function handleDelete() {
    if (!goal) return;
    startTransition(async () => {
      const result = await deleteSavingsGoal(goal.id);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success("Meta eliminada");
        onClose();
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <>
    <AnimatePresence>
      {open && (
        <>
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
            aria-label={goal ? "Editar meta de ahorro" : "Nueva meta de ahorro"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={spring}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[85dvh] max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:inset-x-0"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-zinc-50">
                {goal ? "Editar meta" : "Nueva meta de ahorro"}
              </h2>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Para qué? (ej. Viaje a Nicaragua)"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-3xl text-zinc-500">
                    {CURRENCY_SYMBOL[currency]}
                  </span>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-40 bg-transparent text-center font-mono text-5xl text-zinc-50 outline-none placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex rounded-xl border border-white/10 p-1">
                  {(["CRC", "USD", "NIC"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        currency === c
                          ? "bg-zinc-800 text-zinc-50"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {CURRENCY_SYMBOL[c]} {CURRENCY_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">
                  ¿Para cuándo? <span className="font-normal text-zinc-600">(opcional)</span>
                </span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
                />
              </label>

              {error && <p className="text-sm text-rose-400">{error}</p>}

              <div className="flex gap-2">
                {goal && (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    disabled={isPending}
                    aria-label="Eliminar meta"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 text-rose-400 transition-colors hover:border-rose-400/40 hover:bg-rose-400/10 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-sky-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {isPending ? "Guardando..." : goal ? "Guardar cambios" : "Crear meta"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    <ConfirmDialog
      open={confirmingDelete}
      title="¿Eliminar esta meta?"
      description="Esta acción no se puede deshacer."
      pending={isPending}
      onConfirm={handleDelete}
      onCancel={() => setConfirmingDelete(false)}
    />
    </>,
    document.body
  );
}
