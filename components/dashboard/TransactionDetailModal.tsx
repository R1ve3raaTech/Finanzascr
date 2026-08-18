"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Buildings,
  CalendarBlank,
  PencilSimple,
  Tag,
  TextAa,
  Trash,
  X,
} from "@phosphor-icons/react";
import { deleteTransaction, updateTransaction } from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/format";
import { BANK_BRAND } from "@/lib/bankBrand";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/categories";
import { manualBankOptions } from "@/lib/transactionFormOptions";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { BankLogo } from "./BankLogo";
import type { BankName, Transaction, TransactionType, UserCategory } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
      <span className="text-xs text-ink-3">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
      <Icon size={13} weight="bold" className="text-ink-3" />
      {children}
    </span>
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
  useLockBodyScroll(Boolean(transaction));
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
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
    <>
      <AnimatePresence>
        {transaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-ground/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? "Editar movimiento" : "Detalle de transacción"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={spring}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[85dvh] max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-6 sm:inset-x-0"
            >
              {!editing ? (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <BankLogo bank={transaction.bank_name} size={36} />
                      <div>
                        <p className="text-base font-semibold text-ink">
                          {transaction.description ??
                            (transaction.type === "INCOME" ? "Ingreso" : "Gasto")}
                        </p>
                        <p
                          className={`mt-1 font-mono text-lg ${
                            transaction.type === "INCOME" ? "text-income" : "text-ink-2"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      aria-label="Cerrar"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-raised hover:text-ink cursor-pointer"
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
                        timeZone: "America/Costa_Rica",
                      }).format(new Date(transaction.transaction_date))}
                    />
                    <Row
                      label="Registrado"
                      value={new Intl.DateTimeFormat("es-CR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "America/Costa_Rica",
                      }).format(new Date(transaction.created_at))}
                    />
                    <Row label="ID" value={transaction.id} />
                    {transaction.gmail_message_id && (
                      <Row label="ID de correo" value={transaction.gmail_message_id} />
                    )}
                  </div>

                  <div className="mt-5 border-t border-line pt-4">
                    {error && <p className="mb-3 text-xs text-expense">{error}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink cursor-pointer"
                      >
                        <PencilSimple size={14} weight="bold" />
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirming(true)}
                        className="flex items-center gap-2 rounded-full border border-expense/20 px-4 py-2 text-xs font-medium text-expense transition-colors hover:border-expense/40 hover:bg-expense/10 cursor-pointer"
                      >
                        <Trash size={14} weight="bold" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-base font-semibold text-ink">Editar movimiento</h2>
                    <button
                      onClick={() => setEditing(false)}
                      aria-label="Cancelar edición"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-raised hover:text-ink cursor-pointer"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-ground/40 p-5">
                      <div className="flex rounded-xl border border-line p-1">
                        <button
                          onClick={() => pickType("EXPENSE")}
                          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                            type === "EXPENSE"
                              ? "bg-surface-raised text-ink"
                              : "text-ink-3 hover:text-ink-2"
                          }`}
                        >
                          Gasto
                        </button>
                        <button
                          onClick={() => pickType("INCOME")}
                          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                            type === "INCOME"
                              ? "bg-income/15 text-income"
                              : "text-ink-3 hover:text-ink-2"
                          }`}
                        >
                          Ingreso
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-3xl text-ink-3">₡</span>
                        <input
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-40 bg-transparent text-center font-mono text-5xl text-ink outline-none placeholder:text-ink-3"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={TextAa}>Descripción</FieldLabel>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/50"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={Tag}>Categoría</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              category === c
                                ? "border-accent/50 bg-accent/10 text-accent-soft"
                                : "border-line text-ink-2 hover:border-line-strong"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={Buildings}>Entidad</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {manualBankOptions.map((b) => (
                          <button
                            key={b}
                            onClick={() => setBank(b)}
                            className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors cursor-pointer ${
                              bank === b
                                ? "border-accent/50 bg-accent/10 text-accent-soft"
                                : "border-line text-ink-2 hover:border-line-strong"
                            }`}
                          >
                            <BankLogo bank={b} size={18} />
                            {BANK_BRAND[b].initials}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={CalendarBlank}>Fecha</FieldLabel>
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/50"
                      />
                    </div>

                    {error && <p className="text-sm text-expense">{error}</p>}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        disabled={isPending}
                        className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40 cursor-pointer"
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

      <ConfirmDialog
        open={confirming}
        title="¿Eliminar este movimiento?"
        description="Esta acción no se puede deshacer."
        pending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
