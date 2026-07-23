import { crLocalToUtcIso, parseCRAmount, type EmailParser } from "./types";

/** Formato "20/07/2026 09:05:58 PM" (hora de Costa Rica) -> ISO UTC. */
function parseSinpeDate(raw: string): string {
  const match = raw.match(
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i
  );
  if (!match) return new Date().toISOString();
  const [, day, month, year, hourRaw, minute, second, ampm] = match;
  let hour = Number(hourRaw) % 12;
  if (ampm.toUpperCase() === "PM") hour += 12;
  return crLocalToUtcIso(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour,
    Number(minute),
    Number(second)
  );
}

/**
 * Comprobante de transferencia SINPE Móvil (tabla "Transacción SINPE").
 * BP tiene al menos dos plantillas para el mismo tipo de correo: la de
 * "enviado" trae "Tipo de Movimiento" y "Monto Enviado"; la de "recibido"
 * (más corta) no trae "Tipo de Movimiento" y usa "Monto Neto" en su lugar.
 * Por eso la dirección (ingreso/gasto) se decide primero por el campo
 * "Tipo de Movimiento" si existe, y si no por la frase de introducción
 * ("ha recibido" vs "ha transferido").
 */
export const parseSinpeMovil: EmailParser = (bodyText) => {
  if (!/Transacci[oó]n SINPE/i.test(bodyText)) return null;

  const movimiento = bodyText.match(/Tipo de Movimiento:\s*([^\n]+)/i)?.[1]?.trim();
  const monto =
    bodyText.match(/Monto Enviado:\s*([\d,.]+)/i)?.[1] ??
    bodyText.match(/Monto Neto:\s*([\d,.]+)/i)?.[1];
  const moneda = bodyText.match(/Moneda:\s*([A-Z]{3})/i)?.[1]?.toUpperCase();
  const fecha = bodyText.match(/Fecha:\s*([^\n]+)/i)?.[1]?.trim();
  const nombreOrigen = bodyText.match(/Nombre Origen:\s*([^\n]+)/i)?.[1]?.trim();
  const nombreDestino = bodyText.match(/Nombre Destino:\s*([^\n]+)/i)?.[1]?.trim();

  if (!monto) return null;

  const income = movimiento
    ? /cr[eé]dito/i.test(movimiento)
    : /ha recibido/i.test(bodyText);

  return {
    bank_name: "BP",
    amount: parseCRAmount(monto),
    currency: moneda === "USD" ? "USD" : "CRC",
    description: income
      ? `SINPE Móvil de ${nombreOrigen ?? "desconocido"}`
      : `SINPE Móvil a ${nombreDestino ?? "desconocido"}`,
    type: income ? "INCOME" : "EXPENSE",
    transaction_date: fecha ? parseSinpeDate(fecha) : new Date().toISOString(),
  };
};
