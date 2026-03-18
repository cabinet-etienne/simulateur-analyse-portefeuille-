import type { Comment } from "@repo/core-domain";

import type { CommentRule } from "../rules/types";

/**
 * Évalue une liste de règles déclaratives contre un contexte de données.
 * Chaque règle produit 0 ou 1 commentaire selon que sa condition est remplie.
 *
 * Architecture :
 * - Les règles sont des objets déclaratifs (pas de callbacks)
 * - Le moteur évalue les conditions et produit les commentaires
 * - Les templates supportent l'interpolation de variables : {{variable}}
 */
export function evaluateRules(
  rules: CommentRule[],
  data: Record<string, unknown>,
): Comment[] {
  const comments: Comment[] = [];

  for (const rule of rules) {
    if (evaluateCondition(rule.condition, data)) {
      comments.push({
        id: rule.id,
        severity: rule.severity,
        category: rule.category,
        text: interpolateTemplate(rule.template, data),
      });
    }
  }

  return comments;
}

/**
 * Évalue une condition simple contre les données.
 * Supporte : gt, gte, lt, lte, eq, neq, between, in
 */
function evaluateCondition(
  condition: CommentRule["condition"],
  data: Record<string, unknown>,
): boolean {
  const value = data[condition.field];
  if (value === undefined || value === null) return false;

  const numValue = Number(value);

  switch (condition.operator) {
    case "gt":
      return numValue > Number(condition.value);
    case "gte":
      return numValue >= Number(condition.value);
    case "lt":
      return numValue < Number(condition.value);
    case "lte":
      return numValue <= Number(condition.value);
    case "eq":
      return value === condition.value;
    case "neq":
      return value !== condition.value;
    case "between": {
      const [min, max] = condition.value as [number, number];
      return numValue >= min && numValue <= max;
    }
    case "in":
      return (condition.value as unknown[]).includes(value);
    default:
      return false;
  }
}

/**
 * Interpole les variables {{xxx}} dans un template.
 * Ex: "Le TER de {{ter_pct}}% est élevé" → "Le TER de 0.45% est élevé"
 */
function interpolateTemplate(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const val = data[key];
    if (val === undefined || val === null) return "N/A";
    return String(val);
  });
}
