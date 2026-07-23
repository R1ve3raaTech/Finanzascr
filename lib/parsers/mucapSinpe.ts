import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

/** Formato "22/07/2026 a las 9:59 PM" (hora de Costa Rica) -> ISO UTC. */
function parseMucapDate(
  day: string,
  month: string,
  year: string,
  hourRaw: string,
  minute: string,
  ampm: string
): string {
  let hour = Number(hourRaw) % 12;
  if (ampm.toUpperCase() === "PM") hour += 12;
  return crLocalToUtcIso(Number(year), Number(month) - 1, Number(day), hour, Number(minute));
}

/**
 * Comprobante de SINPE Móvil recibido de MUCAP (sinpe-cgp@mucap.fi.cr).
 * Solo se ha visto el formato de "recibido" (ingreso); MUCAP puede acentuar
 * mal los correos ("M?vil" en vez de "Móvil"), por eso los acentos se
 * matchean con un comodín en vez de la letra exacta.
 */
export const parseMucapSinpe: EmailParser = (bodyText) => {
  if (!/MUCAP le informa/i.test(bodyText) || !/SINPE M.vil/i.test(bodyText)) return null;

  const sender = bodyText
    .match(/ha recibido de\s+([^\n]+?)\s+la siguiente transferencia/i)?.[1]
    ?.trim();
  const amountMatch = bodyText.match(/Monto:\s*([\d,.]+)/i);
  const dateMatch = bodyText.match(
    /enviada el\s*(\d{2})\/(\d{2})\/(\d{4})\s*a las\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!sender || !amountMatch || !dateMatch) return null;

  const [, day, month, year, hour, minute, ampm] = dateMatch;

  return {
    bank_name: "MUCAP",
    amount: parseCRAmount(amountMatch[1]),
    currency: "CRC",
    description: `SINPE Móvil de ${sender}`,
    type: "INCOME",
    transaction_date: parseMucapDate(day, month, year, hour, minute, ampm),
  };
};
