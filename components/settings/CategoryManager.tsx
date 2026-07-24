"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "@phosphor-icons/react";
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
      <h4 className="text-xs font-medium text-zinc-400">{title}</h4>
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
              className="flex items-center gap-1.5 rounded-full border border-white/10 py-1.5 pl-3 pr-2 text-xs font-medium text-zinc-300"
            >
              {c.name}
              <motion.button
                onClick={() => remove(c.id, c.name)}
                aria-label={`Borrar ${c.name}`}
                whileTap={reduce ? undefined : { scale: 0.8 }}
                transition={tap}
                className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
              >
                <X size={10} weight="bold" />
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>
        {categories.length === 0 && (
          <span className="text-xs text-zinc-600">Sin categorías extra todavía.</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Nueva categoría"
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50"
        />
        <motion.button
          onClick={submit}
          disabled={pending || !name.trim()}
          aria-label="Agregar categoría"
          whileTap={reduce ? undefined : { scale: 0.88 }}
          transition={tap}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-40 cursor-pointer"
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
        <h3 className="text-sm font-medium text-zinc-100">Categorías personalizadas</h3>
        <p className="text-xs text-zinc-500">
          Se suman a las categorías por defecto al registrar efectivo.
        </p>
      </div>
      <CategoryGroup title="De gasto" type="EXPENSE" categories={expense} />
      <CategoryGroup title="De ingreso" type="INCOME" categories={income} />
    </div>
  );
}
