"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  EnvelopeSimple,
  Funnel,
  ListChecks,
  MagnifyingGlass,
  Trash,
  X,
} from "@phosphor-icons/react";
import { deleteTransactions } from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { formatDate, formatMoney } from "@/lib/format";
import { BankLogo } from "./BankLogo";
import { SyncGmailButton } from "./SyncGmailButton";
import { TransactionDetailModal } from "./TransactionDetailModal";
import type { Transaction, UserCategory } from "@/lib/types";

const HIGHLIGHT_MS = 2600;
const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

export function TransactionList({
  title,
  transactions,
  customCategories = [],
}: {
  title: string;
  transactions: Transaction[];
  customCategories?: UserCategory[];
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string> | null>(null);

  const [pickMode, setPickMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterBank, setFilterBank] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category).filter((c): c is string => Boolean(c)))).sort(),
    [transactions]
  );
  const availableBanks = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.bank_name))).sort(),
    [transactions]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const activeFilterCount = (filterCategory ? 1 : 0) + (filterBank ? 1 : 0);
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterBank && t.bank_name !== filterBank) return false;
      if (normalizedQuery) {
        const haystack = `${t.description ?? ""} ${t.bank_name} ${t.category ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [transactions, filterCategory, filterBank, normalizedQuery]);

  function clearFilters() {
    setFilterCategory(null);
    setFilterBank(null);
  }

  // Solo se resaltan transacciones que aparecen DESPUÉS del primer render
  // (ej. tras un sync o un registro de efectivo) — en la carga inicial nada
  // se marca como "nuevo", para no animar toda la lista de una.
  useEffect(() => {
    const currentIds = new Set(transactions.map((t) => t.id));
    if (seenIds.current === null) {
      seenIds.current = currentIds;
      return;
    }
    const freshlyAdded = transactions
      .filter((t) => !seenIds.current!.has(t.id))
      .map((t) => t.id);
    seenIds.current = currentIds;
    if (freshlyAdded.length === 0) return;

    setNewIds(new Set(freshlyAdded));
    const timer = setTimeout(() => setNewIds(new Set()), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [transactions]);

  function exitPickMode() {
    setPickMode(false);
    setPickedIds(new Set());
    setConfirmingBulkDelete(false);
  }

  function togglePicked(id: string) {
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRowClick(t: Transaction) {
    if (pickMode) togglePicked(t.id);
    else setSelected(t);
  }

  function handleBulkDelete() {
    const ids = Array.from(pickedIds);
    startTransition(async () => {
      const result = await deleteTransactions(ids);
      if (result.error) {
        toast.error(result.error);
        setConfirmingBulkDelete(false);
      } else {
        toast.success(
          `${ids.length} movimiento${ids.length === 1 ? "" : "s"} eliminado${ids.length === 1 ? "" : "s"}`
        );
        exitPickMode();
      }
    });
  }

  const isColdLoad = seenIds.current === null;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-400">{title}</h2>
        <div className="flex items-center gap-2">
          <SyncGmailButton />
          {transactions.length > 0 && (
            <button
              onClick={() => (pickMode ? exitPickMode() : setPickMode(true))}
              className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors cursor-pointer ${
                pickMode
                  ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-100"
              }`}
            >
              {pickMode ? <X size={14} weight="bold" /> : <ListChecks size={14} weight="bold" />}
              {pickMode ? "Cancelar" : "Seleccionar"}
            </button>
          )}
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3">
              <MagnifyingGlass size={14} className="shrink-0 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por descripción, banco o categoría..."
                className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 cursor-pointer"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Filtros"
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-100"
              }`}
            >
              <Funnel size={15} weight="bold" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-[10px] font-bold text-zinc-950">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-3">
                  {availableCategories.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-zinc-500">Categoría</span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableCategories.map((c) => (
                          <button
                            key={c}
                            onClick={() => setFilterCategory(filterCategory === c ? null : c)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                              filterCategory === c
                                ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                                : "border-white/10 text-zinc-400 hover:border-white/20"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-zinc-500">Banco</span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableBanks.map((b) => (
                        <button
                          key={b}
                          onClick={() => setFilterBank(filterBank === b ? null : b)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            filterBank === b
                              ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                              : "border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="self-start text-xs text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
            <EnvelopeSimple size={22} className="text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Todavía no hay movimientos</p>
          <p className="max-w-[38ch] text-sm text-zinc-500">
            Cuando lleguen correos de tus bancos aparecerán aquí solos. También
            podés registrar una compra en efectivo con el botón (+).
          </p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-sm font-medium text-zinc-300">Sin resultados</p>
          <p className="max-w-[38ch] text-sm text-zinc-500">
            Ningún movimiento coincide con la búsqueda o los filtros.
          </p>
          <button
            onClick={() => {
              setQuery("");
              clearFilters();
            }}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 cursor-pointer"
          >
            Quitar búsqueda y filtros
          </button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {filteredTransactions.map((t, i) => {
              const income = t.type === "INCOME";
              const isNew = newIds.has(t.id);
              const isPicked = pickedIds.has(t.id);
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={false}
                  animate={
                    isNew
                      ? {
                          scale: [1, 1.035, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(56,189,248,0)",
                            "0 0 0 0 rgba(56,189,248,0.55)",
                            "0 0 0 14px rgba(56,189,248,0)",
                          ],
                        }
                      : { scale: 1 }
                  }
                  transition={
                    isNew
                      ? { duration: 1.3, ease: "easeOut", times: [0, 0.25, 1] }
                      : { type: "spring", stiffness: 500, damping: 40 }
                  }
                  className={isColdLoad ? "animate-fade-up" : undefined}
                  style={isColdLoad ? { animationDelay: `${Math.min(i, 10) * 40}ms` } : undefined}
                >
                  <button
                    onClick={() => handleRowClick(t)}
                    className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                      isPicked
                        ? "border-sky-400/50 bg-sky-400/5"
                        : isNew
                          ? "border-sky-400/40 bg-sky-400/5"
                          : "border-white/10 bg-zinc-900/60 hover:border-white/20"
                    }`}
                  >
                    {pickMode && (
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isPicked
                            ? "border-sky-400 bg-sky-400 text-zinc-950"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check size={12} weight="bold" />
                      </span>
                    )}
                    <BankLogo bank={t.bank_name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-100">
                        {t.description ?? (income ? "Ingreso" : "Gasto")}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {t.bank_name} · {formatDate(t.transaction_date)}
                      </p>
                      {!pickMode && (
                        <p className="mt-0.5 text-[11px] text-zinc-600">Ver más detalles</p>
                      )}
                    </div>
                    <span
                      className={`font-mono text-sm ${
                        income ? "text-emerald-400" : "text-zinc-300"
                      }`}
                    >
                      {income ? "+" : "-"}
                      {formatMoney(t.amount, t.currency)}
                    </span>

                    <AnimatePresence>
                      {isNew && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ type: "spring", stiffness: 420, damping: 20 }}
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-950"
                        >
                          NUEVO
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <TransactionDetailModal
        transaction={selected}
        customCategories={customCategories}
        onClose={() => setSelected(null)}
      />

      <AnimatePresence>
        {pickMode && pickedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={tap}
            className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-3 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] sm:inset-x-0"
          >
            <span className="text-sm text-zinc-300">
              {pickedIds.size} seleccionado{pickedIds.size === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={exitPickMode}
                aria-label="Cancelar selección"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
              <button
                onClick={() => setConfirmingBulkDelete(true)}
                className="flex items-center gap-2 rounded-full bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-400/15 cursor-pointer"
              >
                <Trash size={14} weight="bold" />
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmingBulkDelete}
        title={`¿Eliminar ${pickedIds.size} movimiento${pickedIds.size === 1 ? "" : "s"}?`}
        description="Esta acción no se puede deshacer."
        pending={isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmingBulkDelete(false)}
      />
    </>
  );
}
