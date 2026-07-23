function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function presetRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateKey(from), to: toDateKey(to) };
}

export const DATE_RANGE_PRESETS = [
  { label: "1 día", days: 1 },
  { label: "3 días", days: 3 },
  { label: "Semana", days: 7 },
  { label: "15 días", days: 15 },
  { label: "Mes", days: 30 },
] as const;

/** Convierte "YYYY-MM-DD" al final de ese día en ISO, para usar con `lte`. */
export function endOfDayISO(dateKey: string): string {
  const d = new Date(`${dateKey}T23:59:59.999`);
  return d.toISOString();
}

/** Convierte "YYYY-MM-DD" al inicio de ese día en ISO, para usar con `gte`. */
export function startOfDayISO(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00.000`);
  return d.toISOString();
}
