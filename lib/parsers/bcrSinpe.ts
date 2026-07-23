import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

/**
 * SINPE Móvil del BCR (mensajero@bancobcr.com): "se le ha debitado" =
 * gasto, "se le ha acreditado" = ingreso.
 */
export const parseBcrSinpe: EmailParser = (bodyText) => {
  if (!/Transacci[oó]n SINPE M[oó]VIL/i.test(bodyText)) return null;

  const debit = /se le ha debitado/i.test(bodyText);
  const credit = /se le ha acreditado/i.test(bodyText);
  if (!debit && !credit) return null;

  const counterpart = bodyText
    .match(/Nombre cliente (?:Destino|Origen):\s*([^\n]+)/i)?.[1]
    ?.trim();
  const montoMatch = bodyText.match(/Monto:\s*([\d,.]+)/i);
  const dateMatch = bodyText.match(
    /el\s*(\d{2})\/(\d{2})\/(\d{4})\s*a las\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!montoMatch || !dateMatch) return null;

  const [, day, month, year, hourRaw, minute, ampm] = dateMatch;
  let hour = Number(hourRaw) % 12;
  if (ampm.toUpperCase() === "PM") hour += 12;

  return {
    bank_name: "BCR",
    amount: parseCRAmount(montoMatch[1]),
    currency: "CRC",
    description: debit
      ? `SINPE Móvil a ${counterpart ?? "desconocido"}`
      : `SINPE Móvil de ${counterpart ?? "desconocido"}`,
    type: debit ? "EXPENSE" : "INCOME",
    transaction_date: crLocalToUtcIso(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour,
      Number(minute)
    ),
  };
};
