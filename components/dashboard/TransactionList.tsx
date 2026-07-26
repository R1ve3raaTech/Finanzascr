"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, EnvelopeSimple, Trash, X } from "@phosphor-icons/react";
import { deleteTransactions } from "@/app/dashboard/actions";
import { useToast } from "@/components/Toast";
import { formatDate, formatMoney } from "@/lib/format";
import { BankLogo } from "./BankLogo";
import { TransactionDetailModal } from "./TransactionDetailModal";
import type { Transaction, UserCategory } from "@/lib/types";

const HIGHLIGHT_MS = 2600;
const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function TransactionList({
  transactions,
  customCategories = [],
}: {
  transactions: Transaction[];
  customCategories?: UserCategory[];
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string> | null>(null);

  const [pickMode, setPickMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Solo se resaltan transacciones que aparecen DESPUÉS del primer render
  // (ej. tras un sync o un registro de efectivo) — en la carga inicial nada
  // se marca como "nuevo", para no animar toda la lista de una.
  useEffect(() => {
    const currentIds = new Set(transactions.map((t) => t.id));
    if (seenIds.current === null) {
      seenIds.current = currentIds;
      return;
    }
    const freshlyAdded = transactions
      .filter((t) => !seenIds.current!.has(t.id))
      .map((t) => t.id);
    seenIds.current = currentIds;
    if (freshlyAdded.length === 0) return;

    setNewIds(new Set(freshlyAdded));
    const timer = setTimeout(() => setNewIds(new Set()), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [transactions]);

  function exitPickMode() {
    setPickMode(false);
    setPickedIds(new Set());
    setConfirmingBulkDelete(false);
  }

  function togglePicked(id: string) {
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRowClick(t: Transaction) {
    if (pickMode) togglePicked(t.id);
    else setSelected(t);
  }

  function handleBulkDelete() {
    const ids = Array.from(pickedIds);
    startTransition(async () => {
      const result = await deleteTransactions(ids);
      if (result.error) {
        toast.error(result.error);
        setConfirmingBulkDelete(false);
      } else {
        toast.success(
          `${ids.length} movimiento${ids.length === 1 ? "" : "s"} eliminado${ids.length === 1 ? "" : "s"}`
        );
        exitPickMode();
      }
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
          <EnvelopeSimple size={22} className="text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-300">
          Todavía no hay movimientos
        </p>
        <p className="max-w-[38ch] text-sm text-zinc-500">
          Cuando lleguen correos de tus bancos aparecerán aquí solos. También
          podés registrar una compra en efectivo con el botón (+).
        </p>
      </div>
    );
  }

  const isColdLoad = seenIds.current === null;

  return (
    <>
      <div className="flex items-center justify-end">
        <button
          onClick={() => (pickMode ? exitPickMode() : setPickMode(true))}
          className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200 cursor-pointer"
        >
          {pickMode ? "Cancelar" : "Seleccionar"}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {transactions.map((t, i) => {
            const income = t.type === "INCOME";
            const isNew = newIds.has(t.id);
            const isPicked = pickedIds.has(t.id);
            return (
              <motion.li
                key={t.id}
                layout
                initial={false}
                animate={
                  isNew
                    ? {
                        scale: [1, 1.035, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(56,189,248,0)",
                          "0 0 0 0 rgba(56,189,248,0.55)",
                          "0 0 0 14px rgba(56,189,248,0)",
                        ],
                      }
                    : { scale: 1 }
                }
                transition={
                  isNew
                    ? { duration: 1.3, ease: "easeOut", times: [0, 0.25, 1] }
                    : { type: "spring", stiffness: 500, damping: 40 }
                }
                className={isColdLoad ? "animate-fade-up" : undefined}
                style={isColdLoad ? { animationDelay: `${Math.min(i, 10) * 40}ms` } : undefined}
              >
                <button
                  onClick={() => handleRowClick(t)}
                  className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    isPicked
                      ? "border-sky-400/50 bg-sky-400/5"
                      : isNew
                        ? "border-sky-400/40 bg-sky-400/5"
                        : "border-white/10 bg-zinc-900/60 hover:border-white/20"
                  }`}
                >
                  {pickMode && (
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isPicked
                          ? "border-sky-400 bg-sky-400 text-zinc-950"
                          : "border-white/20 text-transparent"
                      }`}
                    >
                      <Check size={12} weight="bold" />
                    </span>
                  )}
                  <BankLogo bank={t.bank_name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-100">
                      {t.description ?? (income ? "Ingreso" : "Gasto")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.bank_name} · {formatDate(t.transaction_date)}
                    </p>
                    {!pickMode && (
                      <p className="mt-0.5 text-[11px] text-zinc-600">Ver más detalles</p>
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm ${
                      income ? "text-emerald-400" : "text-zinc-300"
                    }`}
                  >
                    {income ? "+" : "-"}
                    {formatMoney(t.amount, t.currency)}
                  </span>

                  <AnimatePresence>
                    {isNew && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: "spring", stiffness: 420, damping: 20 }}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-950"
                      >
                        NUEVO
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <TransactionDetailModal
        transaction={selected}
        customCategories={customCategories}
        onClose={() => setSelected(null)}
      />

      <AnimatePresence>
        {pickMode && pickedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={tap}
            className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-3 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] sm:inset-x-0"
          >
            {!confirmingBulkDelete ? (
              <>
                <span className="text-sm text-zinc-300">
                  {pickedIds.size} seleccionado{pickedIds.size === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exitPickMode}
                    aria-label="Cancelar selección"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                  >
                    <X size={16} weight="bold" />
                  </button>
                  <button
                    onClick={() => setConfirmingBulkDelete(true)}
                    className="flex items-center gap-2 rounded-full bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-400/15 cursor-pointer"
                  >
                    <Trash size={14} weight="bold" />
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-zinc-300">
                  ¿Eliminar {pickedIds.size} movimiento{pickedIds.size === 1 ? "" : "s"}?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmingBulkDelete(false)}
                    disabled={isPending}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isPending}
                    className="rounded-full bg-rose-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
