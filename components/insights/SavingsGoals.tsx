"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/format";
import { goalProgress } from "@/lib/insights";
import { GoalModal } from "./GoalModal";
import type { SavingsGoal, Transaction } from "@/lib/types";

function daysLeftLabel(targetDate: string): { text: string; overdue: boolean } {
  const days = Math.ceil(
    (new Date(targetDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000
  );
  if (days < 0) return { text: `venció hace ${Math.abs(days)} días`, overdue: true };
  if (days === 0) return { text: "es hoy", overdue: false };
  return { text: `faltan ${days} días`, overdue: false };
}

export function SavingsGoals({
  goals,
  transactions,
}: {
  goals: SavingsGoal[];
  transactions: Transaction[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  function openCreate() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function openEdit(goal: SavingsGoal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  return (
    <>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-3">
          El progreso se calcula solo: ingresos menos gastos en esa moneda desde que creaste la meta.
        </p>
        <button
          onClick={openCreate}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-accent/10 px-3 text-xs font-semibold text-accent-soft transition-colors hover:bg-accent/15 cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          Nueva meta
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="mt-3 text-sm text-ink-3">
          Todavía no tenés metas de ahorro. Creá una para ver cuánto llevás acumulado.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {goals.map((g) => {
            const progress = goalProgress(transactions, g);
            const pct = Math.min(1, progress / g.target_amount);
            const reached = progress >= g.target_amount;
            const deadline = g.target_date ? daysLeftLabel(g.target_date) : null;
            return (
              <li key={g.id}>
                <button
                  onClick={() => openEdit(g)}
                  className="flex w-full flex-col gap-1.5 rounded-xl border border-line bg-ground/40 p-4 text-left transition-colors hover:border-line-strong cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm">
                    <span className="min-w-0 truncate text-ink">{g.name}</span>
                    <span className="shrink-0 font-mono text-xs text-ink-2 sm:text-sm">
                      {formatMoney(progress, g.currency)} / {formatMoney(g.target_amount, g.currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className={`h-full w-full origin-left rounded-full transition-transform duration-500 ${
                        reached ? "bg-emerald-400" : "bg-accent"
                      }`}
                      style={{ transform: `scaleX(${pct})` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-3">
                    <span>{reached ? "¡Meta cumplida!" : `${Math.round(pct * 100)}%`}</span>
                    {deadline && (
                      <span className={deadline.overdue && !reached ? "text-amber-400" : undefined}>
                        {deadline.text}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <GoalModal open={modalOpen} goal={editingGoal} onClose={() => setModalOpen(false)} />
    </>
  );
}
