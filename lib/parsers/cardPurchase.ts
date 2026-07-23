import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

const MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

/** Formato "Jul. 20, 2026, 21:11" (hora de Costa Rica) -> ISO UTC. */
function parseCardDate(raw: string): string {
  const match = raw.match(/(\w{3})\.?\s*(\d{1,2}),\s*(\d{4}),\s*(\d{1,2}):(\d{2})/);
  if (!match) return new Date().toISOString();
  const [, monthAbbr, day, year, hour, minute] = match;
  const month = MONTHS[monthAbbr.toLowerCase()] ?? 0;
  return crLocalToUtcIso(Number(year), month, Number(day), Number(hour), Number(minute));
}

/**
 * Notificación de compra con tarjeta (débito/crédito) en el formato de
 * tabla clave-valor usado por Banco Popular: Comercio / Fecha / Visa /
 * Autorización / Tipo de Transacción / Monto.
 */
export const parseCardPurchase: EmailParser = (bodyText) => {
  const comercio = bodyText.match(/Comercio:\s*([^\n]+)/i)?.[1]?.trim();
  const fecha = bodyText.match(/Fecha:\s*([^\n]+)/i)?.[1]?.trim();
  const tipo = bodyText.match(/Tipo de Transacci[oó]n:\s*([^\n]+)/i)?.[1]?.trim();
  const montoMatch = bodyText.match(/Monto:\s*(CRC|USD|₡|\$)\s*([\d,.]+)/i);

  if (!comercio || !montoMatch || !/COMPRA/i.test(tipo ?? "")) return null;

  // Las compras pagadas con PayPal aparecen en el estado de cuenta como
  // "PAYPAL *comercio": ya las captura el parser de PayPal con el nombre
  // real del comercio, así que se ignoran acá para no duplicar el gasto.
  if (/paypal/i.test(comercio)) return null;

  const [, currencyRaw, amountRaw] = montoMatch;
  const currency = /USD|\$/i.test(currencyRaw) ? "USD" : "CRC";

  return {
    bank_name: "BP",
    amount: parseCRAmount(amountRaw),
    currency,
    description: comercio,
    type: "EXPENSE",
    transaction_date: fecha ? parseCardDate(fecha) : new Date().toISOString(),
  };
};
