import { formatDate, formatMoney } from "@/lib/format";
import type { RecurringItem } from "@/lib/insights";

export function SubscriptionsList({ items }: { items: RecurringItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-3">
        Todavía no detectamos gastos recurrentes (hace falta el mismo gasto en al
        menos 2 meses distintos).
      </p>
    );
  }

  const totalMonthly = items.reduce((sum, it) => sum + it.averageAmount, 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-2">
        Aprox.{" "}
        <span className="font-mono text-ink">{formatMoney(totalMonthly, "CRC")}</span>{" "}
        por mes en gastos que se repiten.
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={`${item.bankName}-${item.description}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ground p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{item.description}</p>
              <p className="text-xs text-ink-3">
                {item.occurrences} veces · última {formatDate(item.lastDate)}
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm text-ink-2">
              ~{formatMoney(item.averageAmount, item.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
