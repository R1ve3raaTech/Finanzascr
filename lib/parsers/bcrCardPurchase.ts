import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

/** Formato "21/07/2026 18:15:52" (hora de Costa Rica, 24h) -> ISO UTC. */
function parseDate(raw: string): string {
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return new Date().toISOString();
  const [, day, month, year, hour, minute, second] = match;
  return crLocalToUtcIso(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
}

/**
 * "Notificación de Transacciones BCR" (bcrtarjestcta@bancobcr.com): tabla
 * de una sola fila con columnas Fecha/Autorización/No.Referencia/Monto/
 * Moneda/Comercio/Estado, aplanada por el stripeo de HTML (encabezados
 * primero, valores después en el mismo orden). Si el Estado es "Negada"
 * (u otro rechazo) la transacción no se registra porque la plata nunca
 * se movió.
 */
export const parseBcrCardPurchase: EmailParser = (bodyText) => {
  if (!/SOMOS EL BANCO DE COSTA RICA/i.test(bodyText)) return null;

  const rowMatch = bodyText.match(/Estado\s*\n([\s\S]+?)\n(?:En caso de dudas)/i);
  if (!rowMatch) return null;

  const values = rowMatch[1]
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (values.length !== 7) return null;

  const [fecha, , , monto, moneda, comercio, estado] = values;

  if (/negada|rechazada|denegada/i.test(estado)) return null;

  return {
    bank_name: "BCR",
    amount: parseCRAmount(monto),
    currency: /USD|D[oó]LAR/i.test(moneda) ? "USD" : "CRC",
    description: comercio,
    type: "EXPENSE",
    transaction_date: parseDate(fecha),
  };
};
