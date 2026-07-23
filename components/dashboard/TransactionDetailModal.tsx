"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/format";
import { BANK_BRAND } from "@/lib/bankBrand";
import { BankLogo } from "./BankLogo";
import type { Transaction } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {transaction && (
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
            aria-label="Detalle de transacción"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={spring}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <BankLogo bank={transaction.bank_name} size={36} />
                <div>
                  <p className="text-base font-semibold text-zinc-50">
                    {transaction.description ??
                      (transaction.type === "INCOME" ? "Ingreso" : "Gasto")}
                  </p>
                  <p
                    className={`mt-1 font-mono text-lg ${
                      transaction.type === "INCOME" ? "text-emerald-400" : "text-zinc-300"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatMoney(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="flex flex-col">
              <Row label="Entidad" value={BANK_BRAND[transaction.bank_name].label} />
              <Row
                label="Tipo"
                value={transaction.type === "INCOME" ? "Ingreso" : "Gasto"}
              />
              <Row label="Categoría" value={transaction.category ?? "Sin categoría"} />
              <Row
                label="Origen"
                value={transaction.is_automated ? "Automático (correo)" : "Manual"}
              />
              <Row
                label="Fecha"
                value={new Intl.DateTimeFormat("es-CR", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(transaction.transaction_date))}
              />
              <Row
                label="Registrado"
                value={new Intl.DateTimeFormat("es-CR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(transaction.created_at))}
              />
              <Row label="ID" value={transaction.id} />
              {transaction.gmail_message_id && (
                <Row label="ID de correo" value={transaction.gmail_message_id} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
