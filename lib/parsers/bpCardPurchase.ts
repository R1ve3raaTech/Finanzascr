import {
  crLocalToUtcIso,
  isPaypalRoutedMerchant,
  parseCRAmount,
  type EmailParser,
} from "./types";

const MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

/** Formato "Ago. 15, 2026, 16:40" (hora de Costa Rica) -> ISO UTC. */
function parseCardDate(raw: string): string {
  const match = raw.match(/(\w{3})\.?\s*(\d{1,2}),\s*(\d{4}),\s*(\d{1,2}):(\d{2})/);
  if (!match) return new Date().toISOString();
  const [, monthAbbr, day, year, hour, minute] = match;
  const month = MONTHS[monthAbbr.toLowerCase()] ?? 0;
  return crLocalToUtcIso(Number(year), month, Number(day), Number(hour), Number(minute));
}

/**
 * "Comprobante de Compra" de Banco Popular (notificacion@bancopopularinforma.fi.cr):
 * tabla clave-valor Comercio / Ciudad y país / Fecha / Visa / Autorización /
 * Referencia / Tipo de Transacción / Monto — el mismo layout que usa BAC
 * para su propia notificación de compra (ver bacCardPurchase.ts), así que
 * el requisito de que aparezca "bp.fi.cr" en el cuerpo (el correo de
 * contacto que trae el pie de página) es lo que evita que un correo del
 * otro banco se cuele acá o viceversa.
 */
export const parseBpCardPurchase: EmailParser = (bodyText) => {
  if (!/bp\.fi\.cr/i.test(bodyText)) return null;

  const comercio = bodyText.match(/Comercio:\s*([^\n]+)/i)?.[1]?.trim();
  const fecha = bodyText.match(/Fecha:\s*([^\n]+)/i)?.[1]?.trim();
  const tipo = bodyText.match(/Tipo de Transacci[oó]n:\s*([^\n]+)/i)?.[1]?.trim();
  const montoMatch = bodyText.match(/Monto:\s*(CRC|USD|₡|\$)\s*([\d,.]+)/i);

  if (!comercio || !montoMatch || !/COMPRA/i.test(tipo ?? "")) return null;

  // Igual que en BAC: si la tarjeta pagó a través de PayPal, ese cobro ya lo
  // captura el parser de PayPal con el nombre real del comercio.
  if (isPaypalRoutedMerchant(comercio)) return null;

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
