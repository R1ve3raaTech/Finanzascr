"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Wallet, X } from "@phosphor-icons/react";
import { deleteBudget, setBudget } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/format";
import type { Budget } from "@/lib/types";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const pop = { type: "spring", stiffness: 420, damping: 22 } as const;

export function BudgetManager({
  budgets,
  categories,
}: {
  budgets: Budget[];
  categories: string[];
}) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const available = categories.filter((c) => !budgets.some((b) => b.category === c));
  const [category, setCategory] = useState(available[0] ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const target = category || available[0];
    if (!target || !amount) return;
    setError(null);
    startTransition(async () => {
      const result = await setBudget(target, Number(amount.replace(",", ".")));
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setAmount("");
        toast.success(`Presupuesto de ${target} guardado`);
      }
    });
  }

  function remove(id: string, categoryName: string) {
    startTransition(async () => {
      await deleteBudget(id);
      toast.success(`Presupuesto de ${categoryName} eliminado`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-ink">Presupuestos mensuales</h3>
        <p className="text-xs text-ink-3">
          Te avisamos por push cuando te pasás del límite en una categoría.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {budgets.map((b) => (
            <motion.li
              key={b.id}
              layout
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={pop}
              className="flex items-center gap-3 rounded-xl border border-line bg-ground p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink-2">
                <Wallet size={15} weight="bold" />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{b.category}</span>
              <span className="font-mono text-sm text-ink-2">
                {formatMoney(b.monthly_limit)}
              </span>
              <motion.button
                onClick={() => remove(b.id, b.category)}
                whileTap={reduce ? undefined : { scale: 0.85 }}
                transition={tap}
                aria-label={`Borrar presupuesto de ${b.category}`}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-raised hover:text-expense cursor-pointer"
              >
                <X size={12} weight="bold" />
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
        {budgets.length === 0 && (
          <p className="text-xs text-ink-3">No tenés presupuestos configurados.</p>
        )}
      </ul>

      {available.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-3">
          <div className="flex flex-wrap gap-1.5">
            {available.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  (category || available[0]) === c
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-line text-ink-2 hover:border-line-strong"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-line bg-ground pl-3 pr-1.5">
              <span className="font-mono text-xs text-ink-3">₡</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                inputMode="decimal"
                placeholder="Límite mensual"
                className="w-full bg-transparent py-1.5 text-xs text-ink outline-none placeholder:text-ink-3"
              />
            </div>
            <motion.button
              onClick={submit}
              disabled={pending || !amount}
              whileTap={reduce ? undefined : { scale: 0.88 }}
              transition={tap}
              aria-label="Agregar presupuesto"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors hover:bg-accent/15 disabled:opacity-40 cursor-pointer"
            >
              <Plus size={14} weight="bold" />
            </motion.button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-expense">{error}</p>}
    </div>
  );
}
