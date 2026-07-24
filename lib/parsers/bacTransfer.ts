import {
  crLocalToUtcIso,
  namesLikelyMatch,
  normalizeName,
  parseIntlAmount,
  type EmailParser,
} from "./types";

/** Formato "23-07-2026 a las 01:54:03 horas" (hora de Costa Rica) -> ISO UTC. */
function parseBacDate(day: string, month: string, year: string, hour: string, minute: string, second: string): string {
  return crLocalToUtcIso(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
}

/**
 * Notificación de transferencia (local o SINPE Móvil) de BAC Credomatic
 * (alerta@baccredomatic.com): "BAC Credomatic le comunica que [remitente]
 * realizó una transferencia... a su cuenta N°..." dirigida a "Estimado(a)
 * [destinatario]". Este aviso puede llegar a la bandeja del usuario incluso
 * cuando el destinatario es otra persona (ej. transferencias familiares
 * compartiendo el mismo correo de notificaciones) — por eso la dirección
 * (ingreso/gasto) se decide comparando remitente y destinatario contra el
 * nombre del dueño de la cuenta de TicoFinanza, no asumiendo que el
 * destinatario siempre es el usuario.
 *
 * BAC no pone separador de miles bajo 1.000 CRC ("10,00") pero sí desde
 * 1.000 en adelante, al estilo europeo ("80.000,00"): por eso se usa
 * parseIntlAmount (punto = miles, coma = decimal) y no parseCRAmount.
 */
export const parseBacTransfer: EmailParser = (bodyText, { ownerName }) => {
  if (!/BAC Credomatic le comunica/i.test(bodyText)) return null;

  const addressee = bodyText.match(/Estimado\(a\)\s+([^:]+):/i)?.[1]?.trim();
  const sender = bodyText
    .match(/BAC Credomatic le comunica que\s+([^\n]+?)\s+realiz[oó] una transferencia/i)?.[1]
    ?.trim();
  const amountMatch = bodyText.match(/por un monto de\s*([\d.,]+)\s*(CRC|USD)/i);
  const dateMatch = bodyText.match(
    /el d[ií]a\s*(\d{2})-(\d{2})-(\d{4})\s*a las\s*(\d{2}):(\d{2}):(\d{2})\s*horas/i
  );
  const reference = bodyText.match(/n[uú]mero de referencia es\s*([A-Za-z0-9]+)/i)?.[1];

  if (!amountMatch || !dateMatch || !sender || !addressee) return null;

  const senderNorm = normalizeName(sender);
  const addresseeNorm = normalizeName(addressee);

  // Movimiento entre cuentas propias del usuario: se ignora.
  if (senderNorm === addresseeNorm) return null;

  let type: "INCOME" | "EXPENSE";
  let description: string;

  if (ownerName && namesLikelyMatch(ownerName, sender)) {
    type = "EXPENSE";
    description = `Transferencia a ${addressee}`;
  } else if (ownerName && namesLikelyMatch(ownerName, addressee)) {
    type = "INCOME";
    description = `Transferencia de ${sender}`;
  } else {
    // Ni remitente ni destinatario son el dueño de la cuenta: no es una
    // transacción del usuario (ej. notificación de otro familiar que
    // comparte el mismo correo de avisos de BAC).
    return null;
  }

  if (reference) description += ` (ref. ${reference})`;

  const [, amountRaw, currencyRaw] = amountMatch;
  const [, day, month, year, hour, minute, second] = dateMatch;

  return {
    bank_name: "BAC",
    amount: parseIntlAmount(amountRaw),
    currency: currencyRaw.toUpperCase() === "USD" ? "USD" : "CRC",
    description,
    type,
    transaction_date: parseBacDate(day, month, year, hour, minute, second),
  };
};
