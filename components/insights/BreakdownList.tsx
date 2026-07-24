"use client";

import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import type { BreakdownItem } from "@/lib/insights";

// Paleta categórica validada (8 tonos, orden fijo, modo oscuro) para
// agrupaciones sin color de marca propio (ej. categorías de gasto).
const CATEGORICAL_DARK = [
  "#3987e5", "#d95926", "#199e70", "#c98500",
  "#d55181", "#008300", "#9085e9", "#e66767",
];

export function BreakdownList({
  items,
  colorMap,
  emptyLabel,
}: {
  items: BreakdownItem[];
  /** Color por etiqueta; si falta una, cae a la paleta categórica en orden fijo. */
  colorMap?: Record<string, string>;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-600">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.slice(0, 8).map((item, i) => {
        const color = colorMap?.[item.label] ?? CATEGORICAL_DARK[i % CATEGORICAL_DARK.length];
        return (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-zinc-200">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-mono text-zinc-400">
                {formatMoney(item.amount, "CRC")}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: item.share }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                className="h-full w-full origin-left rounded-full"
                style={{ background: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
