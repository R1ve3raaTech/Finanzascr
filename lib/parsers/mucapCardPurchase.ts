import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

/** Formato "25/07/26 a las 21:11" (hora de Costa Rica, año de 2 dígitos, 24h) -> ISO UTC. */
function parseMucapCardDate(day: string, month: string, year2: string, hour: string, minute: string): string {
  const year = 2000 + Number(year2);
  return crLocalToUtcIso(year, Number(month) - 1, Number(day), Number(hour), Number(minute));
}

/**
 * Notificación de compra con tarjeta de MUCAP (info@mucap.fi.cr): "su
 * tarjeta finalizada en [4 dígitos] registra una compra de [monto] [moneda]
 * en [comercio] [fecha] a las [hora]." MUCAP marca el monto como "COL"
 * (colones) incluso en compras hechas en el extranjero — el cobro llega
 * convertido a colones, a diferencia de otros bancos que reportan el monto
 * en la moneda local de la compra.
 */
export const parseMucapCardPurchase: EmailParser = (bodyText) => {
  if (!/MUCAP le informa/i.test(bodyText) || !/registra una compra/i.test(bodyText)) return null;

  const match = bodyText.match(
    /registra una compra de\s*([\d,.]+)\s*(COL|USD|NIC)\s*en\s+([\s\S]+?)\s+(\d{2})\/(\d{2})\/(\d{2})\s*a las\s*(\d{1,2}):(\d{2})/i
  );
  if (!match) return null;

  const [, amountRaw, currencyRaw, merchant, day, month, year2, hour, minute] = match;
  const currency = /USD/i.test(currencyRaw) ? "USD" : /NIC/i.test(currencyRaw) ? "NIC" : "CRC";

  return {
    bank_name: "MUCAP",
    amount: parseCRAmount(amountRaw),
    currency,
    description: merchant.trim().replace(/\s+/g, " "),
    type: "EXPENSE",
    transaction_date: parseMucapCardDate(day, month, year2, hour, minute),
  };
};
