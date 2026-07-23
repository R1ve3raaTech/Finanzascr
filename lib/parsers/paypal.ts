import { parseIntlAmount, type EmailParser } from "./types";

/**
 * Notificación de pago de PayPal (service@intl.paypal.com). El correo no
 * incluye la hora exacta de la compra (solo la fecha), así que se usa la
 * hora real de recepción del correo como respaldo.
 *
 * Cuando PayPal convierte de colones a dólares se usa el monto original en
 * CRC ("Convertido desde") porque es lo que realmente salió de la cuenta o
 * tarjeta del usuario; si no hay conversión, se usa el total tal cual.
 */
export const parsePayPal: EmailParser = (bodyText, { receivedAt }) => {
  if (!/PayPal/i.test(bodyText) || !/Ha pagado/i.test(bodyText)) return null;
  if (!/Id\.\s*de transacci[oó]n/i.test(bodyText)) return null;

  const merchant = bodyText.match(/Comercio\s*\n\s*([^\n]+)/i)?.[1]?.trim();
  const crcMatch = bodyText.match(/Convertido desde:\s*₡?\s*([\d.,]+)\s*CRC/i);
  const totalMatch = bodyText.match(/Total\s*\n?\s*[₡$]?\s*([\d.,]+)\s*(USD|CRC)/i);

  if (!merchant || (!crcMatch && !totalMatch)) return null;

  const amount = parseIntlAmount(crcMatch ? crcMatch[1] : totalMatch![1]);
  const currency = crcMatch
    ? ("CRC" as const)
    : totalMatch![2].toUpperCase() === "USD"
      ? ("USD" as const)
      : ("CRC" as const);

  return {
    bank_name: "PayPal",
    amount,
    currency,
    description: merchant,
    type: "EXPENSE",
    transaction_date: receivedAt,
  };
};
