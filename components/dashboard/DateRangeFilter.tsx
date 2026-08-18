"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarBlank } from "@phosphor-icons/react";
import { DATE_RANGE_PRESETS, presetRange } from "@/lib/dateRange";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;
const slide = { type: "spring", stiffness: 500, damping: 40 } as const;

export function DateRangeFilter() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const hasFilter = Boolean(from && to);

  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  function applyRange(range: { from: string; to: string } | null) {
    const params = new URLSearchParams();
    if (range) {
      params.set("from", range.from);
      params.set("to", range.to);
    }
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    applyRange({ from: customFrom, to: customTo });
  }

  // ¿el filtro activo coincide con alguno de los presets?
  const activePreset = DATE_RANGE_PRESETS.find((p) => {
    const r = presetRange(p.days);
    return r.from === from && r.to === to;
  });

  const segments = [{ label: "Todo", days: null }, ...DATE_RANGE_PRESETS] as const;
  const activeLabel = !hasFilter ? "Todo" : (activePreset?.label ?? null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-0.5 rounded-full border border-line bg-surface/60 p-1">
          {segments.map((s) => {
            const active = activeLabel === s.label;
            return (
              <button
                key={s.label}
                onClick={() => {
                  setShowCustom(false);
                  applyRange(s.days === null ? null : presetRange(s.days));
                }}
                className="relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              >
                {active && (
                  <motion.span
                    layoutId="date-range-active"
                    transition={slide}
                    className="absolute inset-0 rounded-full bg-accent/15"
                  />
                )}
                <span className={`relative ${active ? "text-accent" : "text-ink-2 hover:text-ink"}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={tap}
          onClick={() => setShowCustom((v) => !v)}
          aria-label="Rango personalizado"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer ${
            hasFilter && !activePreset
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
          }`}
        >
          <CalendarBlank size={14} weight="bold" />
        </motion.button>
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/60 p-3">
          <label className="flex items-center gap-2 text-xs text-ink-3">
            Desde
            <input
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-line bg-ground px-2 py-1 text-xs text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-3">
            Hasta
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-line bg-ground px-2 py-1 text-xs text-ink"
            />
          </label>
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40 cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
