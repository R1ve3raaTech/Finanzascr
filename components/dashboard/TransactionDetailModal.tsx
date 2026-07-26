"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PencilSimple, Trash, X } from "@phosphor-icons/react";
import { deleteTransaction, updateTransaction } from "@/app/dashboard/actions";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/format";
import { BANK_BRAND } from "@/lib/bankBrand";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/categories";
import { CURRENCY_LABEL, CURRENCY_SYMBOL, manualBankOptions } from "@/lib/transactionFormOptions";
import { BankLogo } from "./BankLogo";
import type { BankName, Currency, Transaction, TransactionType, UserCategory } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

/** "YYYY-MM-DDTHH:mm" en hora local, para <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TransactionDetailModal({
  transaction,
  customCategories = [],
  onClose,
}: {
  transaction: Transaction | null;
  customCategories?: UserCategory[];
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("CRC");
  const [bank, setBank] = useState<BankName>("Efectivo");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const allExpenseCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...customCategories.filter((c) => c.type === "EXPENSE").map((c) => c.name),
  ];
  const allIncomeCategories = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...customCategories.filter((c) => c.type === "INCOME").map((c) => c.name),
  ];
  const categories = type === "EXPENSE" ? allExpenseCategories : allIncomeCategories;

  function handleClose() {
    setConfirming(false);
    setEditing(false);
    setError(null);
    onClose();
  }

  function startEditing() {
    if (!transaction) return;
    setType(transaction.type);
    setAmount(String(transaction.amount));
    setCurrency(transaction.currency);
    setBank(transaction.bank_name);
    setCategory(
      transaction.category ??
        (transaction.type === "EXPENSE" ? allExpenseCategories[0] : allIncomeCategories[0])
    );
    setDescription(transaction.description ?? "");
    setDate(toLocalInput(transaction.transaction_date));
    setError(null);
    setEditing(true);
  }

  function pickType(t: TransactionType) {
    setType(t);
    setCategory(t === "EXPENSE" ? allExpenseCategories[0] : allIncomeCategories[0]);
  }

  function handleSave() {
    if (!transaction) return;
    setError(null);
    if (!amount || Number(amount.replace(",", ".")) <= 0) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }
    startTransition(async () => {
      const result = await updateTransaction(transaction.id, {
        amount: Number(amount.replace(",", ".")),
        currency,
        description: description.trim(),
        category,
        type,
        transactionDate: new Date(date).toISOString(),
        bank,
      });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Movimiento actualizado");
        setEditing(false);
      }
    });
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
            aria-label={editing ? "Editar movimiento" : "Detalle de transacción"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={spring}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[85dvh] max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:inset-x-0"
          >
            {!editing ? (
              <>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-100 cursor-pointer"
                      >
                        <PencilSimple size={14} weight="bold" />
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirming(true)}
                        className="flex items-center gap-2 rounded-full border border-rose-400/20 px-4 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-400/40 hover:bg-rose-400/10 cursor-pointer"
                      >
                        <Trash size={14} weight="bold" />
                        Eliminar
                      </button>
                    </div>
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
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-zinc-50">Editar movimiento</h2>
                  <button
                    onClick={() => setEditing(false)}
                    aria-label="Cancelar edición"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="mx-auto flex rounded-xl border border-white/10 p-1">
                    <button
                      onClick={() => pickType("EXPENSE")}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                        type === "EXPENSE"
                          ? "bg-zinc-800 text-zinc-50"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Gasto
                    </button>
                    <button
                      onClick={() => pickType("INCOME")}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                        type === "INCOME"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Ingreso
                    </button>
                  </div>

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

                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50"
                  />

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-zinc-400">Categoría</span>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            category === c
                              ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                              : "border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-zinc-400">Entidad</span>
                    <div className="flex flex-wrap gap-2">
                      {manualBankOptions.map((b) => (
                        <button
                          key={b}
                          onClick={() => setBank(b)}
                          className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors cursor-pointer ${
                            bank === b
                              ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                              : "border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          <BankLogo bank={b} size={18} />
                          {BANK_BRAND[b].initials}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
                  />

                  {error && <p className="text-sm text-rose-400">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      disabled={isPending}
                      className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      className="flex-1 rounded-xl bg-sky-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
                    >
                      {isPending ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
