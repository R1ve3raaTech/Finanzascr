import { convertToCRC } from "@/lib/exchangeRate";
import { parseBacCardPurchase } from "./bacCardPurchase";
import { parseBacTransfer } from "./bacTransfer";
import { parseBcrCardPurchase } from "./bcrCardPurchase";
import { parseBcrSinpe } from "./bcrSinpe";
import { parseBnCardPurchase } from "./bnCardPurchase";
import { parseBpCardPurchase } from "./bpCardPurchase";
import { parseBpServicePayment } from "./bpServicePayment";
import { parseDaviviendaCardPurchase } from "./daviviendaCardPurchase";
import { parseInternalTransfer } from "./internalTransfer";
import { parseMucapCardPurchase } from "./mucapCardPurchase";
import { parseMucapSinpe } from "./mucapSinpe";
import { parsePayPal } from "./paypal";
import { parseSinpeMovil } from "./sinpeMovil";
import type { EmailContext, EmailParser, ParsedTransaction } from "./types";

const parsers: EmailParser[] = [
  parseInternalTransfer,
  parseBacTransfer,
  parseSinpeMovil,
  parseMucapSinpe,
  parseMucapCardPurchase,
  parseBcrSinpe,
  parseBpServicePayment,
  parseBacCardPurchase,
  parseBpCardPurchase,
  parseDaviviendaCardPurchase,
  parseBnCardPurchase,
  parseBcrCardPurchase,
  parsePayPal,
];

/** Lo que devuelve parseEmail(): igual que lo que arma cada parser, pero con
 *  la moneda ya resuelta — siempre colones, la única que la app guarda. */
export interface ConvertedTransaction extends Omit<ParsedTransaction, "currency"> {
  currency: "CRC";
}

/**
 * Prueba cada parser conocido contra el cuerpo del correo hasta que uno
 * matchee, y si la transacción vino en otra moneda (dólares, córdobas,
 * euros, lo que sea) la convierte a colones con el tipo de cambio del día
 * antes de devolverla — ver lib/exchangeRate.ts. Así ningún parser
 * individual necesita saber de tipos de cambio: solo reporta la moneda cruda
 * que trae el correo del banco.
 */
export async function parseEmail(
  bodyText: string,
  ctx: EmailContext
): Promise<ConvertedTransaction | null> {
  for (const parser of parsers) {
    const result = parser(bodyText, ctx);
    if (!result) continue;

    if (result.currency === "CRC") {
      return { ...result, currency: "CRC" };
    }

    try {
      const amount = await convertToCRC(result.amount, result.currency);
      return { ...result, amount, currency: "CRC" };
    } catch (err) {
      // No se pudo convertir (moneda desconocida ni por la API ni por el
      // respaldo fijo) — mejor no registrar la transacción con un monto
      // inventado que registrarla mal.
      console.error(`[parseEmail] no se pudo convertir ${result.currency} a CRC:`, err);
      return null;
    }
  }
  return null;
}

/**
 * Dominios de correo bancario conocidos, usados para armar la query de
 * búsqueda de Gmail. Agregar acá cuando se sumen más bancos.
 */
export const KNOWN_BANK_SENDERS = [
  "bpdc.fi.cr",
  "bancopopularinforma.fi.cr",
  "baccredomatic.com",
  "notificacionesbaccr.com",
  "intl.paypal.com",
  "davibank.cr",
  "mucap.fi.cr",
  "bncr.fi.cr",
  "bancobcr.com",
];

export function buildGmailQuery(days = 3): string {
  const fromClause = KNOWN_BANK_SENDERS.map((domain) => `from:${domain}`).join(
    " OR "
  );
  return `(${fromClause}) newer_than:${days}d`;
}
