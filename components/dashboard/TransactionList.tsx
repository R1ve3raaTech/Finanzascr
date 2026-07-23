"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { formatDate, formatMoney } from "@/lib/format";
import { BankLogo } from "./BankLogo";
import { TransactionDetailModal } from "./TransactionDetailModal";
import type { Transaction } from "@/lib/types";

const HIGHLIGHT_MS = 2600;

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string> | null>(null);

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
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {transactions.map((t, i) => {
            const income = t.type === "INCOME";
            const isNew = newIds.has(t.id);
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
                          "0 0 0 0 rgba(52,211,153,0)",
                          "0 0 0 0 rgba(52,211,153,0.55)",
                          "0 0 0 14px rgba(52,211,153,0)",
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
                  onClick={() => setSelected(t)}
                  className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    isNew
                      ? "border-emerald-400/40 bg-emerald-400/5"
                      : "border-white/10 bg-zinc-900/60 hover:border-white/20"
                  }`}
                >
                  <BankLogo bank={t.bank_name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-100">
                      {t.description ?? (income ? "Ingreso" : "Gasto")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.bank_name} · {formatDate(t.transaction_date)}
                    </p>
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
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-950"
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
      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}
