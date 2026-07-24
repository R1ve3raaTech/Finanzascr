"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "@phosphor-icons/react";
import { deleteBudget, setBudget } from "@/app/dashboard/settings/actions";
import { formatMoney } from "@/lib/format";
import type { Budget, Currency } from "@/lib/types";

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
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState(categories[0] ?? "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("CRC");
  const [error, setError] = useState<string | null>(null);

  const available = categories.filter((c) => !budgets.some((b) => b.category === c));

  function submit() {
    if (!category || !amount) return;
    setError(null);
    startTransition(async () => {
      const result = await setBudget(category, Number(amount.replace(",", ".")), currency);
      if (result.error) setError(result.error);
      else setAmount("");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteBudget(id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Presupuestos mensuales</h3>
        <p className="text-xs text-zinc-500">
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
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 p-3"
            >
              <span className="text-sm text-zinc-200">{b.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-zinc-400">
                  {formatMoney(b.monthly_limit, b.currency)}
                </span>
                <motion.button
                  onClick={() => remove(b.id)}
                  whileTap={reduce ? undefined : { scale: 0.85 }}
                  transition={tap}
                  aria-label={`Borrar presupuesto de ${b.category}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-rose-400 cursor-pointer"
                >
                  <X size={12} weight="bold" />
                </motion.button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {budgets.length === 0 && (
          <p className="text-xs text-zinc-600">No tenés presupuestos configurados.</p>
        )}
      </ul>

      {available.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-white/15 p-3">
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-50 outline-none focus:border-sky-400/50"
            >
              {available.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex rounded-lg border border-white/10 p-0.5">
              {(["CRC", "USD"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded px-2 text-xs font-medium transition-colors cursor-pointer ${
                    currency === c ? "bg-zinc-800 text-zinc-50" : "text-zinc-500"
                  }`}
                >
                  {c === "CRC" ? "₡" : "$"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              inputMode="decimal"
              placeholder="Límite mensual"
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-50 outline-none placeholder:text-zinc-600 focus:border-sky-400/50"
            />
            <motion.button
              onClick={submit}
              disabled={pending || !amount}
              whileTap={reduce ? undefined : { scale: 0.88 }}
              transition={tap}
              aria-label="Agregar presupuesto"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-40 cursor-pointer"
            >
              <Plus size={14} weight="bold" />
            </motion.button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
