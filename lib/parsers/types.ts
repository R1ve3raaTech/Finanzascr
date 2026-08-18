import type { BankName, TransactionType } from "@/lib/types";

export interface ParsedTransaction {
  bank_name: BankName;
  amount: number;
  /**
   * Moneda cruda tal como la detectó el parser (código ISO 4217 tipo
   * "USD"/"NIO"/"CRC", o "NIC" — el que usan los bancos para el córdoba, no
   * el código real). No es necesariamente "CRC": la conversión a colones
   * pasa después, una sola vez, en parseEmail() — así ningún parser
   * individual necesita saber de tipos de cambio.
   */
  currency: string;
  description: string;
  type: TransactionType;
  transaction_date: string;
}

export interface EmailContext {
  /** Fecha/hora real de recepción del correo (Gmail internalDate), usada
   * como respaldo por parsers cuyo formato no incluye la hora exacta. */
  receivedAt: string;
  /** Nombre completo del dueño de la cuenta de TicoFinanza (de su perfil),
   * usado por parsers cuyo correo no deja claro si el usuario es quien
   * envía o quien recibe la plata (ej. notificaciones de BAC). */
  ownerName?: string;
}

export type EmailParser = (
  bodyText: string,
  ctx: EmailContext
) => ParsedTransaction | null;

export function parseCRAmount(raw: string): number {
  return Number(raw.replace(/,/g, "").trim());
}

/**
 * ¿El nombre de comercio de una notificación de tarjeta corresponde en
 * realidad a un pago procesado por PayPal? Los bancos lo escriben como
 * "PAYPAL *comercio" o, más seguido, con la abreviatura de red de tarjeta
 * "PP*comercio" (ej. "PP*FSPRG.COM"). Ese mismo cobro también llega como
 * correo directo de PayPal — usar esto para no registrarlo dos veces.
 */
export function isPaypalRoutedMerchant(merchant: string): boolean {
  return /paypal|^\s*pp\*/i.test(merchant);
}

/**
 * Formato internacional/europeo (punto = miles, coma = decimal). Lo usan
 * PayPal siempre, y BAC para montos de 1.000 CRC en adelante (para montos
 * menores a mil BAC no pone separador de miles, ej. "10,00").
 */
export function parseIntlAmount(raw: string): number {
  return Number(raw.replace(/\./g, "").replace(",", ".").trim());
}

/** Compara nombres ignorando mayúsculas, acentos y espacios extra. */
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/**
 * Compara el nombre del perfil de Google (a veces un apodo recortado, ej.
 * "Camil Rivera (R1ve3raa__)") contra el nombre legal completo que usan los
 * bancos (ej. "CAMIL JOSUE RIVERA RODRIGUEZ"). No exige coincidencia
 * exacta: alcanza con que al menos dos palabras del nombre del perfil
 * (o todas, si tiene menos de dos) aparezcan en el nombre del banco.
 */
export function namesLikelyMatch(profileName: string, bankName: string): boolean {
  const withoutParens = profileName.replace(/\([^)]*\)/g, " ");
  const profileTokens = normalizeName(withoutParens)
    .split(" ")
    .filter((t) => t.length > 1);
  if (profileTokens.length === 0) return false;

  const bankNorm = normalizeName(bankName);
  const matches = profileTokens.filter((t) => bankNorm.includes(t));
  return matches.length >= Math.min(2, profileTokens.length);
}

/**
 * Construye un timestamp UTC a partir de una hora local de Costa Rica
 * (UTC-6 fijo, sin horario de verano). Evita depender de la zona horaria
 * del servidor donde corre el proceso.
 */
export function crLocalToUtcIso(
  year: number,
  month0: number,
  day: number,
  hour: number,
  minute: number,
  second = 0
): string {
  return new Date(Date.UTC(year, month0, day, hour + 6, minute, second)).toISOString();
}
