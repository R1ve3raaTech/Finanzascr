import type { Currency } from "./types";

const formatters: Record<Currency, Intl.NumberFormat> = {
  CRC: new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }),
  // "NIC" es la etiqueta que usan los bancos costarricenses en sus correos;
  // el código ISO 4217 real del córdoba nicaragüense es "NIO".
  NIC: new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "NIO",
    maximumFractionDigits: 2,
  }),
};

export function formatMoney(amount: number, currency: Currency): string {
  return formatters[currency].format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
