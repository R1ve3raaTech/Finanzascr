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
    // Fija la zona horaria: sin esto, el servidor (UTC) y el navegador del
    // usuario (Costa Rica, UTC-6) formatean horas distintas para el mismo
    // instante, y React tira un error de hidratación porque el texto
    // generado en el servidor no coincide con el del cliente.
    timeZone: "America/Costa_Rica",
  }).format(new Date(iso));
}
