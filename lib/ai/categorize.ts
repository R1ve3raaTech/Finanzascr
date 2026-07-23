import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const BATCH_SIZE = 40;

interface CategorizableTransaction {
  id: string;
  bank_name: string;
  description: string | null;
  amount: number;
  currency: string;
}

/**
 * Le pide a Claude que le asigne una categoría (de la lista dada) a cada
 * transacción. Devuelve un Map id -> categoría; las que no se pudieron
 * categorizar con confianza simplemente no aparecen en el resultado.
 */
export async function categorizeTransactions(
  transactions: CategorizableTransaction[],
  categories: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (transactions.length === 0 || categories.length === 0) return result;

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    const batchResult = await categorizeBatch(batch, categories);
    for (const [id, category] of batchResult) result.set(id, category);
  }

  return result;
}

async function categorizeBatch(
  batch: CategorizableTransaction[],
  categories: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  const list = batch
    .map(
      (t) =>
        `- id: ${t.id} | banco: ${t.bank_name} | descripción: ${t.description ?? "(sin descripción)"} | monto: ${t.amount} ${t.currency}`
    )
    .join("\n");

  let response;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system:
        "Categorizás transacciones bancarias de un usuario en Costa Rica. Para cada transacción, elegí la categoría más probable de la lista dada, basándote en el nombre del banco/comercio y la descripción. Si no hay suficiente información para decidir con confianza, usá 'Otro' si está en la lista.",
      messages: [
        {
          role: "user",
          content: `Categorías disponibles: ${categories.join(", ")}\n\nTransacciones:\n${list}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    category: { type: "string", enum: categories },
                  },
                  required: ["id", "category"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    });
  } catch {
    return result;
  }

  if (response.stop_reason === "refusal") return result;

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return result;

  try {
    const parsed = JSON.parse(textBlock.text) as {
      results: { id: string; category: string }[];
    };
    const validIds = new Set(batch.map((t) => t.id));
    for (const item of parsed.results) {
      if (validIds.has(item.id) && categories.includes(item.category)) {
        result.set(item.id, item.category);
      }
    }
  } catch {
    return result;
  }

  return result;
}
