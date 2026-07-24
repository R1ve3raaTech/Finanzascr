"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Plus,
  X,
} from "@phosphor-icons/react";
import { addCashTransaction } from "@/app/dashboard/actions";
import { DEFAULT_EXPENSE_CATEGORIES as expenseCategories, DEFAULT_INCOME_CATEGORIES as incomeCategories } from "@/lib/categories";
import type { Currency, TransactionType, UserCategory } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;
const bounce = { type: "spring", stiffness: 400, damping: 22 } as const;

/** "YYYY-MM-DDTHH:mm" en hora local, para el valor inicial de <input type="datetime-local">. */
function nowForInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

type Step = 1 | 2 | 3 | 4;

export function AddCashModal({
  defaultCurrency = "CRC",
  customCategories = [],
}: {
  defaultCurrency?: Currency;
  customCategories?: UserCategory[];
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState(1);

  const allExpenseCategories = [
    ...expenseCategories,
    ...customCategories.filter((c) => c.type === "EXPENSE").map((c) => c.name),
  ];
  const allIncomeCategories = [
    ...incomeCategories,
    ...customCategories.filter((c) => c.type === "INCOME").map((c) => c.name),
  ];

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [category, setCategory] = useState(allExpenseCategories[0]);
  const categories = type === "EXPENSE" ? allExpenseCategories : allIncomeCategories;
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(nowForInput());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setStep(1);
    setDir(1);
    setType("EXPENSE");
    setAmount("");
    setCurrency(defaultCurrency);
    setCategory(allExpenseCategories[0]);
    setDescription("");
    setDate(nowForInput());
    setError(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function goTo(next: Step) {
    setDir(next > step ? 1 : -1);
    setError(null);
    setStep(next);
  }

  function pickType(t: TransactionType) {
    setType(t);
    setCategory(t === "EXPENSE" ? allExpenseCategories[0] : allIncomeCategories[0]);
    goTo(2);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addCashTransaction({
        amount: Number(amount.replace(",", ".")),
        currency,
        description: description.trim(),
        category,
        type,
        transactionDate: new Date(date).toISOString(),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        goTo(4);
        setTimeout(close, 1100);
      }
    });
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={spring}
        aria-label="Registrar efectivo"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-400 text-zinc-950 shadow-[0_8px_30px_rgba(56,189,248,0.35)] cursor-pointer"
      >
        <Plus size={24} weight="bold" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => step !== 4 && close()}
              className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Registrar efectivo"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
              transition={spring}
              className="fixed inset-x-4 bottom-4 top-4 z-50 mx-auto flex max-h-[calc(100dvh-2rem)] max-w-md flex-col overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 sm:inset-x-0 sm:inset-y-auto sm:top-1/2 sm:max-h-[85dvh] sm:-translate-y-1/2"
            >
              {step !== 4 && (
                <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900 px-6 pt-5 pb-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`h-1.5 w-5 rounded-full transition-colors ${
                          s <= step ? "bg-sky-400" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={close}
                    aria-label="Cerrar"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              )}

              <div className="relative min-h-[320px] px-6 pb-6 pt-4">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={spring}
                      className="flex flex-col gap-4"
                    >
                      <h2 className="text-base font-semibold text-zinc-50">
                        ¿Qué registrás?
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => pickType("EXPENSE")}
                          whileHover={reduce ? undefined : { scale: 1.03 }}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          transition={bounce}
                          className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-8 cursor-pointer"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                            <ArrowUpRight size={22} weight="bold" className="text-zinc-300" />
                          </div>
                          <span className="text-sm font-medium text-zinc-100">Gasto</span>
                        </motion.button>
                        <motion.button
                          onClick={() => pickType("INCOME")}
                          whileHover={reduce ? undefined : { scale: 1.03 }}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          transition={bounce}
                          className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-8 cursor-pointer"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15">
                            <ArrowDownLeft size={22} weight="bold" className="text-emerald-400" />
                          </div>
                          <span className="text-sm font-medium text-emerald-300">Ingreso</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={spring}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => goTo(1)}
                          aria-label="Atrás"
                          className="text-sm text-zinc-500 transition-colors hover:text-zinc-200 cursor-pointer"
                        >
                          ← Atrás
                        </button>
                      </div>
                      <h2 className="text-base font-semibold text-zinc-50">
                        {type === "EXPENSE" ? "¿Cuánto gastaste?" : "¿Cuánto recibiste?"}
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-3xl text-zinc-500">
                          {currency === "CRC" ? "₡" : "$"}
                        </span>
                        <input
                          autoFocus
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-40 bg-transparent text-center font-mono text-5xl text-zinc-50 outline-none placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="mx-auto flex rounded-xl border border-white/10 p-1">
                        {(["CRC", "USD"] as const).map((c) => (
                          <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                              currency === c
                                ? "bg-zinc-800 text-zinc-50"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {c === "CRC" ? "₡ Colones" : "$ Dólares"}
                          </button>
                        ))}
                      </div>
                      <motion.button
                        onClick={() => goTo(3)}
                        disabled={!amount || Number(amount.replace(",", ".")) <= 0}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className="rounded-xl bg-sky-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
                      >
                        Continuar
                      </motion.button>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={spring}
                      className="flex flex-col gap-4"
                    >
                      <button
                        onClick={() => goTo(2)}
                        aria-label="Atrás"
                        className="text-left text-sm text-zinc-500 transition-colors hover:text-zinc-200 cursor-pointer"
                      >
                        ← Atrás
                      </button>
                      <h2 className="text-base font-semibold text-zinc-50">¿Cuándo fue?</h2>

                      <div className="flex flex-col gap-2">
                        <input
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-sky-400/50 [color-scheme:dark]"
                        />
                      </div>

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

                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/50"
                      />

                      {error && <p className="text-sm text-rose-400">{error}</p>}

                      <motion.button
                        onClick={submit}
                        disabled={pending}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className="mt-1 rounded-xl bg-sky-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
                      >
                        {pending ? "Guardando..." : "Guardar movimiento"}
                      </motion.button>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center gap-4 py-10"
                    >
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 480, damping: 18 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400"
                      >
                        <Check size={30} weight="bold" className="text-zinc-950" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm font-medium text-zinc-200"
                      >
                        ¡Listo!
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
