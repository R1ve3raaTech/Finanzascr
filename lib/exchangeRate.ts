import "server-only";

/**
 * Tipo de cambio en tiempo real hacia colones, para convertir cualquier
 * transacción que llegue en otra moneda (dólares, córdobas, euros, lo que
 * sea) al único saldo que la app maneja. Usa open.er-api.com: gratis, sin
 * API key, sin límite de uso documentado, ~170 monedas — se actualiza una
 * vez al día del lado de ellos, que alcanza de sobra para gasto personal
 * (nadie necesita el tipo de cambio al segundo para saber cuánto costó el
 * almuerzo de ayer).
 *
 * Se pide "USD" como base y se cachea la respuesta completa (todas las
 * monedas de una sola vez) en vez de una request por moneda — así una
 * sincronización de Gmail con varias compras en distintas monedas hace como
 * mucho una sola llamada externa por hora.
 */
const BASE_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_SECONDS = 60 * 60;

interface RatesResponse {
  result: string;
  rates: Record<string, number>;
}

/**
 * Si la API externa falla (caída, timeout, formato inesperado), la
 * sincronización de Gmail no se puede caer entera por eso — se usan estas
 * tasas de respaldo, fijas y aproximadas, tomadas de un día cualquiera de
 * 2026. Peor es nada: el usuario igual ve el gasto en colones, aunque no
 * sea al centavo exacto del tipo de cambio de ese momento.
 */
const FALLBACK_CRC_PER_USD = 500;
const FALLBACK_USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  CRC: 1 / FALLBACK_CRC_PER_USD,
  NIO: 1 / 36.7,
  EUR: 1.08,
  GBP: 1.27,
};

async function fetchUsdRates(): Promise<Record<string, number>> {
  const response = await fetch(BASE_URL, { next: { revalidate: CACHE_SECONDS } });
  if (!response.ok) {
    throw new Error(`open.er-api.com respondió ${response.status}`);
  }
  const data = (await response.json()) as RatesResponse;
  if (data.result !== "success" || !data.rates?.CRC) {
    throw new Error("open.er-api.com devolvió una respuesta sin tasas usables");
  }
  return data.rates;
}

/**
 * Convierte un monto de `fromCurrency` a colones. Si ya viene en colones,
 * devuelve el monto tal cual (sin llamar a la API). El código de moneda no
 * es case-sensitive y acepta variantes comunes ("NIC" además de "NIO", el
 * código real ISO 4217 del córdoba).
 */
export async function convertToCRC(amount: number, fromCurrency: string): Promise<number> {
  const currency = normalizeCurrencyCode(fromCurrency);
  if (currency === "CRC") return amount;

  let usdRates: Record<string, number>;
  try {
    usdRates = await fetchUsdRates();
  } catch (err) {
    console.error("[exchangeRate] no se pudo obtener el tipo de cambio en vivo, usando respaldo fijo:", err);
    usdRates = FALLBACK_USD_PER_UNIT;
  }

  const crcPerUsd = usdRates.CRC ?? FALLBACK_CRC_PER_USD;
  const currencyPerUsd = usdRates[currency] ?? FALLBACK_USD_PER_UNIT[currency];

  if (!currencyPerUsd) {
    // Moneda que ni la API ni el respaldo conocen: no hay con qué convertir.
    // No debería pasar con las ~170 que trae open.er-api.com, pero si pasa
    // es mejor devolver el monto sin tocar (con la moneda original) que
    // inventar un número — eso lo maneja el llamador.
    throw new Error(`No se encontró tipo de cambio para la moneda "${currency}"`);
  }

  // amount está en `currency`; se pasa a USD y de ahí a CRC.
  const amountInUsd = amount / currencyPerUsd;
  const amountInCrc = amountInUsd * crcPerUsd;
  return Math.round(amountInCrc);
}

function normalizeCurrencyCode(raw: string): string {
  const upper = raw.trim().toUpperCase();
  // "NIC" es como el resto del código históricamente llamaba al córdoba;
  // "NIO" es el código ISO 4217 real, que es el que usan las APIs de tipo
  // de cambio.
  if (upper === "NIC") return "NIO";
  return upper;
}
