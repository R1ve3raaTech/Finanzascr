"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CaretDown,
  Check,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { addCashTransaction, suggestCategory } from "@/app/dashboard/actions";
import { BankLogo } from "@/components/dashboard/BankLogo";
import { BANK_BRAND } from "@/lib/bankBrand";
import { DEFAULT_EXPENSE_CATEGORIES as expenseCategories, DEFAULT_INCOME_CATEGORIES as incomeCategories } from "@/lib/categories";
import { CURRENCY_LABEL, CURRENCY_SYMBOL, manualBankOptions } from "@/lib/transactionFormOptions";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import type { BankName, Currency, TransactionType, UserCategory } from "@/lib/types";

const spring = { type: "spring", stiffness: 300, damping: 28 } as const;
const bounce = { type: "spring", stiffness: 400, damping: 22 } as const;
const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
// Tiempo de pausa al tipear antes de pedirle a la IA que sugiera categoría.
const AI_SUGGEST_DELAY_MS = 650;

/** "YYYY-MM-DDTHH:mm" en hora local, para el valor inicial de <input type="datetime-local">. */
function nowForInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AddCashModal({
  defaultCurrency = "CRC",
  customCategories = [],
}: {
  defaultCurrency?: Currency;
  customCategories?: UserCategory[];
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  useLockBodyScroll(open);

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
  const [bank, setBank] = useState<BankName>("Efectivo");
  const [category, setCategory] = useState(allExpenseCategories[0]);
  const [categoryIsAiPick, setCategoryIsAiPick] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const categories = type === "EXPENSE" ? allExpenseCategories : allIncomeCategories;
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(nowForInput());
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestRequestId = useRef(0);

  function reset() {
    setSaved(false);
    setType("EXPENSE");
    setAmount("");
    setCurrency(defaultCurrency);
    setBank("Efectivo");
    setCategory(allExpenseCategories[0]);
    setCategoryIsAiPick(false);
    setSuggesting(false);
    setDescription("");
    setDate(nowForInput());
    setShowDetails(false);
    setError(null);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function pickType(t: TransactionType) {
    setType(t);
    setCategory(t === "EXPENSE" ? allExpenseCategories[0] : allIncomeCategories[0]);
    setCategoryIsAiPick(false);
  }

  function pickCategory(c: string) {
    setCategory(c);
    setCategoryIsAiPick(false);
  }

  // Sugerencia de categoría por IA: dispara sola una pausa después de que el
  // usuario deja de tipear la descripción, así no hace falta ni un botón ni
  // un tap extra para la mayoría de los movimientos.
  function handleDescriptionChange(value: string) {
    setDescription(value);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    if (value.trim().length < 3) {
      setSuggesting(false);
      return;
    }

    const requestId = ++suggestRequestId.current;
    suggestTimer.current = setTimeout(async () => {
      setSuggesting(true);
      const result = await suggestCategory({
        description: value,
        type,
        amount: Number(amount.replace(",", ".")) || 0,
        currency,
        bank,
      });
      if (requestId !== suggestRequestId.current) return;
      setSuggesting(false);
      if (result.category) {
        setCategory(result.category);
        setCategoryIsAiPick(true);
      }
    }, AI_SUGGEST_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, []);

  function submit() {
    setError(null);
    if (!amount || Number(amount.replace(",", ".")) <= 0) {
      setError("Ingresá un monto mayor a cero.");
      return;
    }
    startTransition(async () => {
      const result = await addCashTransaction({
        amount: Number(amount.replace(",", ".")),
        currency,
        description: description.trim(),
        category,
        type,
        transactionDate: new Date(date).toISOString(),
        bank,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-400 text-zinc-950 shadow-[0_8px_30px_rgba(251,146,60,0.35)] cursor-pointer"
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
              onClick={() => !saved && close()}
              className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Registrar movimiento"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={spring}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto flex max-h-[85dvh] max-w-md -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 sm:inset-x-0"
            >
              {!saved && (
                <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900 px-6 pt-5 pb-2">
                  <h2 className="text-base font-semibold text-zinc-50">Nuevo movimiento</h2>
                  <button
                    onClick={close}
                    aria-label="Cerrar"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              )}

              <div className="relative min-h-[320px] px-6 pb-6 pt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!saved ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="mx-auto flex rounded-xl border border-white/10 p-1">
                        <motion.button
                          onClick={() => pickType("EXPENSE")}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          transition={bounce}
                          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                            type === "EXPENSE"
                              ? "bg-zinc-800 text-zinc-50"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <ArrowUpRight size={14} weight="bold" />
                          Gasto
                        </motion.button>
                        <motion.button
                          onClick={() => pickType("INCOME")}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          transition={bounce}
                          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                            type === "INCOME"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <ArrowDownLeft size={14} weight="bold" />
                          Ingreso
                        </motion.button>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-3xl text-zinc-500">
                            {CURRENCY_SYMBOL[currency]}
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
                        <div className="flex rounded-xl border border-white/10 p-1">
                          {(["CRC", "USD"] as const).map((c) => (
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
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        placeholder={type === "EXPENSE" ? "¿En qué? (ej. Uber, súper...)" : "¿De dónde? (opcional)"}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-400/50"
                      />

                      <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                          Categoría
                          {suggesting && (
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                              className="flex items-center gap-1 text-orange-400"
                            >
                              <Sparkle size={12} weight="fill" />
                              pensando...
                            </motion.span>
                          )}
                          {!suggesting && categoryIsAiPick && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <Sparkle size={12} weight="fill" />
                              sugerido por IA
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((c) => (
                            <button
                              key={c}
                              onClick={() => pickCategory(c)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                category === c
                                  ? "border-orange-400/50 bg-orange-400/10 text-orange-300"
                                  : "border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-950/50">
                        <button
                          onClick={() => setShowDetails((v) => !v)}
                          className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 cursor-pointer"
                        >
                          <span>
                            {bank === "Efectivo" ? "Efectivo" : BANK_BRAND[bank].initials} ·{" "}
                            {new Date(date).toLocaleDateString("es-CR", { day: "numeric", month: "short" })}
                          </span>
                          <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={tap}>
                            <CaretDown size={14} weight="bold" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {showDetails && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-3 px-4 pb-4">
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs font-medium text-zinc-400">
                                    ¿De dónde salió? (si no te llegó solo)
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {manualBankOptions.map((b) => (
                                      <button
                                        key={b}
                                        onClick={() => setBank(b)}
                                        className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors cursor-pointer ${
                                          bank === b
                                            ? "border-orange-400/50 bg-orange-400/10 text-orange-300"
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
                                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-orange-400/50 [color-scheme:dark]"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {error && <p className="text-sm text-rose-400">{error}</p>}

                      <motion.button
                        onClick={submit}
                        disabled={pending}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className="rounded-xl bg-orange-400 py-3 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40 cursor-pointer"
                      >
                        {pending ? "Guardando..." : "Guardar movimiento"}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="done"
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
