import { parseBacTransfer } from "./bacTransfer";
import { parseBcrCardPurchase } from "./bcrCardPurchase";
import { parseBcrSinpe } from "./bcrSinpe";
import { parseBnCardPurchase } from "./bnCardPurchase";
import { parseBpServicePayment } from "./bpServicePayment";
import { parseCardPurchase } from "./cardPurchase";
import { parseDaviviendaCardPurchase } from "./daviviendaCardPurchase";
import { parseInternalTransfer } from "./internalTransfer";
import { parseMucapSinpe } from "./mucapSinpe";
import { parsePayPal } from "./paypal";
import { parseSinpeMovil } from "./sinpeMovil";
import type { EmailContext, EmailParser, ParsedTransaction } from "./types";

const parsers: EmailParser[] = [
  parseInternalTransfer,
  parseBacTransfer,
  parseSinpeMovil,
  parseMucapSinpe,
  parseBcrSinpe,
  parseBpServicePayment,
  parseCardPurchase,
  parseDaviviendaCardPurchase,
  parseBnCardPurchase,
  parseBcrCardPurchase,
  parsePayPal,
];

/** Prueba cada parser conocido contra el cuerpo del correo hasta que uno matchee. */
export function parseEmail(bodyText: string, ctx: EmailContext): ParsedTransaction | null {
  for (const parser of parsers) {
    const result = parser(bodyText, ctx);
    if (result) return result;
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
