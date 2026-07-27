/**
 * Categorización local por palabras clave, sin tocar la IA. Cubre los
 * comercios/patrones más comunes en Costa Rica — el objetivo es que la
 * mayoría de las transacciones normales nunca necesiten llamar a Claude.
 * Solo se usa si la categoría que mapea existe en la lista de categorías
 * disponibles del usuario (default + personalizadas); si no, se deja pasar
 * a la IA como antes.
 */

interface Rule {
  pattern: RegExp;
  category: string;
}

const EXPENSE_RULES: Rule[] = [
  {
    pattern:
      /uber\s*eats|rappi|glovo|mcdonald|kfc\b|burger\s*king|pizza|subway|taco\s*bell|popeyes|wendy|soda\b|restaurante|rosti\s*pollos|starbucks|spoon\b|bagelmen/i,
    category: "Comida",
  },
  {
    pattern:
      /\buber\b(?!\s*eats)|didi|indriver|taxi|gasolina|servicentro|\bdelta\b|autopista|peaje|parqueo|estacionamiento|rteca|riteve/i,
    category: "Transporte",
  },
  {
    pattern:
      /automercado|walmart|maxi\s*pali|max[ií]\s*pali|pricesmart|mas\s*x\s*menos|masxmenos|super\s*compro|\bpali\b|fresh\s*market|perimercados/i,
    category: "Súper",
  },
  {
    pattern: /farmacia|fischel|sucre|cl[ií]nica|hospital|laboratorio\s*cl[ií]nico|consultorio|ebais/i,
    category: "Salud",
  },
  {
    pattern:
      /netflix|spotify|disney\+?|\bhbo\b|youtube\s*premium|amazon\s*prime|paramount|crunchyroll|cine\s*mark|nova\s*cinemas|cinepolis/i,
    category: "Entretenimiento",
  },
];

const INCOME_RULES: Rule[] = [
  { pattern: /planilla|salario|n[oó]mina/i, category: "Salario" },
  { pattern: /reembolso|devoluci[oó]n/i, category: "Reembolso" },
];

/**
 * Devuelve la categoría si algún patrón matchea y esa categoría existe en
 * la lista disponible del usuario; null si no hay match local (hay que
 * preguntarle a la IA).
 */
export function localCategoryFor(
  text: string,
  type: "EXPENSE" | "INCOME",
  availableCategories: string[]
): string | null {
  const rules = type === "EXPENSE" ? EXPENSE_RULES : INCOME_RULES;
  for (const rule of rules) {
    if (rule.pattern.test(text) && availableCategories.includes(rule.category)) {
      return rule.category;
    }
  }
  return null;
}
