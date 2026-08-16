"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Plus, X } from "@phosphor-icons/react";
import { addCategory, deleteCategory } from "@/app/dashboard/settings/actions";
import { useToast } from "@/components/Toast";
import type { TransactionType, UserCategory } from "@/lib/types";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const pop = { type: "spring", stiffness: 420, damping: 22 } as const;

function CategoryGroup({
  title,
  type,
  categories,
}: {
  title: string;
  type: TransactionType;
  categories: UserCategory[];
}) {
  const income = type === "INCOME";
  const reduce = useReducedMotion();
  const toast = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    const submittedName = name.trim();
    setError(null);
    startTransition(async () => {
      const result = await addCategory(name, type);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setName("");
        toast.success(`"${submittedName}" agregada`);
      }
    });
  }

  function remove(id: string, categoryName: string) {
    startTransition(async () => {
      await deleteCategory(id);
      toast.success(`"${categoryName}" eliminada`);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
        {income ? (
          <ArrowDownLeft size={12} weight="bold" className="text-emerald-400" />
        ) : (
          <ArrowUpRight size={12} weight="bold" className="text-ink-3" />
        )}
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {categories.map((c) => (
            <motion.span
              key={c.id}
              layout
              initial={reduce ? false : { opacity: 0, scale: 0.7, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={pop}
              className={`flex items-center gap-1.5 rounded-full border py-1.5 pl-3 pr-2 text-xs font-medium ${
                income
                  ? "border-emerald-400/25 bg-emerald-400/5 text-emerald-300"
                  : "border-line text-ink-2"
              }`}
            >
              {c.name}
              <motion.button
                onClick={() => remove(c.id, c.name)}
                aria-label={`Borrar ${c.name}`}
                whileTap={reduce ? undefined : { scale: 0.8 }}
                transition={tap}
                className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  income
                    ? "text-emerald-400/60 hover:bg-emerald-400/15 hover:text-emerald-300"
                    : "text-ink-3 hover:bg-surface-raised hover:text-ink"
                }`}
              >
                <X size={10} weight="bold" />
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>
        {categories.length === 0 && (
          <span className="text-xs text-ink-3">Sin categorías extra todavía.</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Nueva categoría"
          className="w-full rounded-lg border border-line bg-ground px-3 py-1.5 text-xs text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent/50"
        />
        <motion.button
          onClick={submit}
          disabled={pending || !name.trim()}
          aria-label="Agregar categoría"
          whileTap={reduce ? undefined : { scale: 0.88 }}
          transition={tap}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-white/20 hover:text-ink disabled:opacity-40 cursor-pointer"
        >
          <Plus size={14} weight="bold" />
        </motion.button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function CategoryManager({ categories }: { categories: UserCategory[] }) {
  const expense = categories.filter((c) => c.type === "EXPENSE");
  const income = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-medium text-ink">Categorías personalizadas</h3>
        <p className="text-xs text-ink-3">
          Se suman a las categorías por defecto al registrar efectivo.
        </p>
      </div>
      <CategoryGroup title="De gasto" type="EXPENSE" categories={expense} />
      <CategoryGroup title="De ingreso" type="INCOME" categories={income} />
    </div>
  );
}
