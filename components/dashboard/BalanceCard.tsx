"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/format";

export function BalanceCard({
  crc,
  filtered = false,
  month,
}: {
  crc: number;
  filtered?: boolean;
  /** Ingresos y gastos del mes en curso. Solo se muestra en la vista sin
   *  filtro de fechas: con un rango puesto, "este mes" no querría decir nada. */
  month?: { income: number; expense: number };
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div className="p-6">
        <h2 className="text-sm font-medium text-ink-2">
          {filtered ? "Neto del período seleccionado" : "Saldo consolidado"}
        </h2>

        <p
          className={`money mt-3 font-mono text-3xl tracking-tight ${
            crc < 0 ? "text-expense" : "text-ink"
          }`}
        >
          {formatMoney(crc)}
        </p>
      </div>

      {month && (
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
          <MonthStat
            icon={ArrowDownLeft}
            label="Ingresos del mes"
            value={formatMoney(month.income)}
            tone="income"
          />
          <MonthStat
            icon={ArrowUpRight}
            label="Gastos del mes"
            value={formatMoney(month.expense)}
            tone="expense"
          />
        </div>
      )}
    </motion.section>
  );
}

function MonthStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "income" | "expense";
}) {
  return (
    <div className="flex items-center gap-3 bg-surface px-6 py-4">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          tone === "income" ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
        }`}
      >
        <Icon size={15} weight="bold" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-ink-3">{label}</p>
        <p
          className={`money font-mono text-sm ${
            tone === "income" ? "text-income" : "text-ink"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
