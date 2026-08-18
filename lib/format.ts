const crcFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  // es-CR agrupa los miles con un espacio fino ("₡482 350"), que no es como
  // se escribe la plata acá: en Costa Rica el separador de miles es el punto
  // (₡482.350), que es además lo que usan los correos de los bancos y la
  // propia landing. Se reemplaza solo la parte "group", sin tocar el símbolo
  // ni el separador decimal.
  return crcFormatter
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
