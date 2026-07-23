import { formatDate, formatMoney } from "@/lib/format";
import type { RecurringItem } from "@/lib/insights";

export function SubscriptionsList({ items }: { items: RecurringItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Todavía no detectamos gastos recurrentes (hace falta el mismo gasto en al
        menos 2 meses distintos).
      </p>
    );
  }

  const totalMonthly = items.reduce((sum, it) => sum + it.averageAmount, 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Aprox.{" "}
        <span className="font-mono text-zinc-100">{formatMoney(totalMonthly, "CRC")}</span>{" "}
        por mes en gastos que se repiten.
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={`${item.bankName}-${item.description}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-100">{item.description}</p>
              <p className="text-xs text-zinc-500">
                {item.occurrences} veces · última {formatDate(item.lastDate)}
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm text-zinc-300">
              ~{formatMoney(item.averageAmount, item.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
