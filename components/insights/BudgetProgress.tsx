import { formatMoney } from "@/lib/format";
import type { Budget } from "@/lib/types";

export function BudgetProgress({
  budgets,
  spentByCategory,
}: {
  budgets: Budget[];
  spentByCategory: Map<string, number>;
}) {
  if (budgets.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No tenés presupuestos. Configuralos en Ajustes para ver tu progreso acá.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {budgets.map((b) => {
        const spent = spentByCategory.get(b.category) ?? 0;
        const pct = Math.min(1, spent / b.monthly_limit);
        const over = spent > b.monthly_limit;
        return (
          <li key={b.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-200">{b.category}</span>
              <span className={`font-mono ${over ? "text-rose-400" : "text-zinc-400"}`}>
                {formatMoney(spent, b.currency)} / {formatMoney(b.monthly_limit, b.currency)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  over ? "bg-rose-400" : pct > 0.8 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
