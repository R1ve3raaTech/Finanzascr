import { Warning } from "@phosphor-icons/react/dist/ssr";
import { formatMoney } from "@/lib/format";
import type { Budget } from "@/lib/types";

export function BudgetProgress({
  budgets,
  spentByCategoryCurrency,
}: {
  budgets: Budget[];
  /** Llaves `"categoría::MONEDA"` — ver expenseByCategoryAndCurrency. */
  spentByCategoryCurrency: Map<string, number>;
}) {
  if (budgets.length === 0) {
    return (
      <p className="text-sm text-ink-3">
        No tenés presupuestos. Configuralos en Ajustes para ver tu progreso acá.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {budgets.map((b) => {
        const spent = spentByCategoryCurrency.get(`${b.category}::${b.currency}`) ?? 0;
        const ratio = spent / b.monthly_limit;
        const pct = Math.min(1, ratio);
        const over = spent > b.monthly_limit;
        const near = !over && ratio > 0.8;

        return (
          <li key={b.id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-ink">{b.category}</span>
                {/* El estado no puede depender solo del color de la barra:
                    verde y ámbar son casi el mismo tono para alguien con
                    daltonismo. El porcentaje y el aviso lo dicen con texto. */}
                {(over || near) && (
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      over ? "bg-expense/10 text-expense" : "bg-warn/10 text-warn"
                    }`}
                  >
                    <Warning size={10} weight="bold" />
                    {over ? "Te pasaste" : "Casi"}
                  </span>
                )}
              </span>
              <span
                className={`money shrink-0 font-mono text-xs sm:text-sm ${
                  over ? "text-expense" : "text-ink-2"
                }`}
              >
                {formatMoney(spent, b.currency)} / {formatMoney(b.monthly_limit, b.currency)}
                <span className="ml-1.5 text-ink-3">{Math.round(ratio * 100)}%</span>
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuenow={Math.round(ratio * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Presupuesto de ${b.category}`}
            >
              <div
                className={`h-full w-full origin-left rounded-full transition-transform duration-500 ${
                  over ? "bg-expense" : near ? "bg-warn" : "bg-income"
                }`}
                style={{ transform: `scaleX(${pct})` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
