"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import type { MonthTotal } from "@/lib/insights";

export function MonthlyBarChart({ data }: { data: MonthTotal[] }) {
  const [hover, setHover] = useState<{ i: number; series: "income" | "expense" } | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));

  function toggle(i: number, series: "income" | "expense") {
    setHover((cur) => (cur?.i === i && cur.series === series ? null : { i, series }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Gastos
        </span>
      </div>

      <div className="relative flex h-40 items-end justify-between gap-2">
        {data.map((d, i) => (
          <div key={d.monthKey} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex h-32 w-full items-end justify-center gap-1">
              {(["income", "expense"] as const).map((series) => {
                const value = d[series];
                const heightPct = (value / max) * 100;
                const isHovered = hover?.i === i && hover.series === series;
                return (
                  <div key={series} className="relative flex h-full w-3 items-end">
                    <button
                      type="button"
                      aria-label={`${series === "income" ? "Ingresos" : "Gastos"} de ${d.label}: ${formatMoney(value, "CRC")}`}
                      onMouseEnter={() => setHover({ i, series })}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => toggle(i, series)}
                      className="absolute inset-y-0 -inset-x-2 cursor-pointer"
                    />
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: Math.max(heightPct, value > 0 ? 2 : 0) / 100 }}
                      transition={{ type: "spring", stiffness: 200, damping: 26 }}
                      className={`pointer-events-none h-full w-full origin-bottom rounded-t-sm ${
                        series === "income" ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                    {isHovered && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-100 shadow-lg">
                        {formatMoney(value, "CRC")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[11px] capitalize text-zinc-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
