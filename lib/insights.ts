import type { Transaction } from "./types";

export interface MonthTotal {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Últimos `months` meses (incluyendo el actual), solo movimientos en CRC. */
export function monthlyTotals(transactions: Transaction[], months = 6): MonthTotal[] {
  const now = new Date();
  const buckets: MonthTotal[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-CR", { month: "short" }).format(d);
    buckets.push({ monthKey: key, label, income: 0, expense: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.monthKey, b]));

  for (const t of transactions) {
    if (t.currency !== "CRC") continue;
    const bucket = byKey.get(monthKey(t.transaction_date));
    if (!bucket) continue;
    if (t.type === "INCOME") bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return buckets;
}

export interface BreakdownItem {
  label: string;
  amount: number;
  share: number;
}

/** Gasto en CRC del mes indicado (por defecto el actual), agrupado por `keyFn`. */
export function expenseBreakdown(
  transactions: Transaction[],
  keyFn: (t: Transaction) => string,
  targetMonthKey?: string
): BreakdownItem[] {
  const target = targetMonthKey ?? monthKey(new Date().toISOString());
  const totals = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "EXPENSE" || t.currency !== "CRC") continue;
    if (monthKey(t.transaction_date) !== target) continue;
    const key = keyFn(t);
    totals.set(key, (totals.get(key) ?? 0) + t.amount);
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([label, amount]) => ({ label, amount, share: grandTotal ? amount / grandTotal : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export function currentMonthKey(): string {
  return monthKey(new Date().toISOString());
}

export interface RecurringItem {
  description: string;
  bankName: string;
  currency: "CRC" | "USD";
  averageAmount: number;
  occurrences: number;
  lastDate: string;
}

/**
 * Detecta gastos recurrentes: mismo comercio + banco + moneda apareciendo
 * en al menos 2 meses distintos con montos parecidos (±10%). Heurística
 * simple sobre los datos que ya existen, no requiere tabla nueva.
 */
export function detectRecurring(transactions: Transaction[]): RecurringItem[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    if (t.type !== "EXPENSE" || !t.description) continue;
    const key = `${t.bank_name}::${t.description.toLowerCase().trim()}::${t.currency}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const results: RecurringItem[] = [];
  for (const group of groups.values()) {
    const distinctMonths = new Set(group.map((t) => monthKey(t.transaction_date)));
    if (distinctMonths.size < 2) continue;

    const amounts = group.map((t) => t.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    const consistent = group.filter((t) => Math.abs(t.amount - median) / median <= 0.1);
    if (consistent.length < 2) continue;

    const sorted = [...group].sort(
      (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    results.push({
      description: sorted[0].description!,
      bankName: sorted[0].bank_name,
      currency: sorted[0].currency,
      averageAmount: average,
      occurrences: group.length,
      lastDate: sorted[0].transaction_date,
    });
  }

  return results.sort((a, b) => b.averageAmount - a.averageAmount);
}
