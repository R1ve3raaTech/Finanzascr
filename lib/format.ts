import type { Currency } from "./types";

const formatters: Record<"CRC" | "USD", Intl.NumberFormat> = {
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

// El código ISO 4217 real del córdoba nicaragüense es "NIO", pero Intl no
// tiene un símbolo corto para esa moneda en es-CR (imprime "NIO" en vez de
// un símbolo) — se formatea a mano para que se vea como las demás (símbolo
// + número), con "C$" que es como la gente realmente lo escribe.
const nicNumberFormat = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === "NIC") {
    const sign = amount < 0 ? "-" : "";
    return `${sign}C$${nicNumberFormat.format(Math.abs(amount))}`;
  }
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
