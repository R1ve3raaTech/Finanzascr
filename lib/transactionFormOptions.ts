import type { BankName, Currency } from "./types";

export const CURRENCY_SYMBOL: Record<Currency, string> = { CRC: "₡", USD: "$", NIC: "C$" };
export const CURRENCY_LABEL: Record<Currency, string> = {
  CRC: "Colones",
  USD: "Dólares",
  NIC: "Córdobas",
};

// Mismos bancos que soporta la lectura automática (ver lib/parsers/index.ts)
// — si a alguno no le llegó el correo, se puede registrar/editar a mano bajo
// el banco real en vez de que quede mezclado con "Efectivo".
export const manualBankOptions: BankName[] = [
  "Efectivo",
  "BAC",
  "BCR",
  "BNCR",
  "BP",
  "Davivienda",
  "MUCAP",
  "PayPal",
  "Otro",
];
