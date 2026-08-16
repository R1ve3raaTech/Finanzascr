import type { Currency } from "./types";

const formatters: Record<Currency, Intl.NumberFormat> = {
  CRC: new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    // Sin narrowSymbol, el dólar se imprime "USD 1 240,50" en vez de
    // "$1 240,50" — el colón sí sale como ₡ igual, pero se pide en ambos por
    // consistencia.
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }),
};

export function formatMoney(amount: number, currency: Currency): string {
  // es-CR agrupa los miles con un espacio fino ("₡482 350"), que no es como
  // se escribe la plata acá: en Costa Rica el separador de miles es el punto
  // (₡482.350), que es además lo que usan los correos de los bancos y la
  // propia landing. Se reemplaza solo la parte "group", sin tocar el símbolo
  // ni el separador decimal.
  return formatters[currency]
    .formatToParts(amount)
    .map((part) => (part.type === "group" ? "." : part.value))
    .join("");
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
