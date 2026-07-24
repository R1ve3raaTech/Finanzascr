"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarBlank } from "@phosphor-icons/react";
import { DATE_RANGE_PRESETS, presetRange } from "@/lib/dateRange";

const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

function pillClass(active: boolean) {
  return `flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors cursor-pointer ${
    active
      ? "border-sky-400/40 bg-sky-400/10 text-sky-400"
      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-100"
  }`;
}

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={tap}
          onClick={() => {
            setShowCustom(false);
            applyRange(null);
          }}
          className={pillClass(!hasFilter)}
        >
          Todo
        </motion.button>

        {DATE_RANGE_PRESETS.map((p) => (
          <motion.button
            key={p.label}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={tap}
            onClick={() => {
              setShowCustom(false);
              applyRange(presetRange(p.days));
            }}
            className={pillClass(activePreset?.label === p.label)}
          >
            {p.label}
          </motion.button>
        ))}

        <motion.button
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={tap}
          onClick={() => setShowCustom((v) => !v)}
          className={pillClass(hasFilter && !activePreset)}
        >
          <CalendarBlank size={14} weight="bold" />
          Personalizado
        </motion.button>
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 p-3">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Desde
            <input
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 [color-scheme:dark]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Hasta
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 [color-scheme:dark]"
            />
          </label>
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="rounded-full bg-sky-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 disabled:opacity-40 cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
