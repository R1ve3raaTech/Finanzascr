"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trash, X } from "@phosphor-icons/react";
import { deleteTransaction } from "@/app/dashboard/actions";
import { useToast } from "@/components/Toast";
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
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setConfirming(false);
    setError(null);
    onClose();
  }

  function handleDelete() {
    if (!transaction) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTransaction(transaction.id);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setConfirming(false);
      } else {
        toast.success("Movimiento eliminado");
        handleClose();
      }
    });
  }

  return (
    <AnimatePresence>
      {transaction && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                onClick={handleClose}
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

            <div className="mt-5 border-t border-white/5 pt-4">
              {error && <p className="mb-3 text-xs text-rose-400">{error}</p>}
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="flex items-center gap-2 rounded-full border border-rose-400/20 px-4 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-400/40 hover:bg-rose-400/10 cursor-pointer"
                >
                  <Trash size={14} weight="bold" />
                  Eliminar este movimiento
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-400">¿Seguro que querés eliminarlo?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded-full bg-rose-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={isPending}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
