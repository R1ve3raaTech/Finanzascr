import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface FinanceSnapshot {
  thisMonth: { income: number; expense: number };
  lastMonth: { income: number; expense: number } | null;
  topCategories: { label: string; amount: number }[];
  budgets: { category: string; limit: number; spent: number }[];
  recurring: { description: string; amount: number }[];
}

/**
 * Le pide a Claude un resumen corto en lenguaje natural (2-4 oraciones) de
 * cómo viene el mes. Tono profesional y directo — un asesor financiero, no
 * un amigo — sin jerga informal ni muletillas. Devuelve null si falla o si
 * Claude se niega a responder.
 */
export async function summarizeFinances(snapshot: FinanceSnapshot): Promise<string | null> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system:
        "Sos el asistente de análisis financiero de TicoFinanza, una app de finanzas " +
        "personales para Costa Rica. Te paso un resumen JSON de los movimientos del usuario " +
        "este mes (ingresos, gastos, categorías con más gasto, presupuestos y su avance, y " +
        "gastos recurrentes detectados). Escribí un resumen de 2 a 4 oraciones en español " +
        "neutro y profesional, como lo haría un asesor financiero: directo, claro, sin " +
        "muletillas ni tono de amigo (nada de \"mae\", \"pura vida\" o exclamaciones). Destacá " +
        "lo más útil de saber: si se pasó de algún presupuesto, si el gasto subió o bajó vs el " +
        "mes pasado, o algún patrón notable. Si los datos son muy escasos para decir algo " +
        "útil, decilo brevemente en vez de inventar. No uses markdown ni bullets, solo texto " +
        "corrido.",
      messages: [{ role: "user", content: JSON.stringify(snapshot) }],
    });

    if (response.stop_reason === "refusal") return null;
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;
    return textBlock.text.trim() || null;
  } catch {
    return null;
  }
}
