import type { Comment } from "@repo/core-domain";

/**
 * Génère un résumé synthétique à partir d'une liste de commentaires.
 * Le résumé est un paragraphe de 2-3 phrases qui condense les points clés.
 */
export function generateSummary(comments: Comment[]): string {
  if (comments.length === 0) {
    return "Aucune observation particulière à signaler pour ce produit.";
  }

  const positives = comments.filter((c) => c.severity === "POSITIVE");
  const warnings = comments.filter((c) => c.severity === "WARNING");
  const negatives = comments.filter((c) => c.severity === "NEGATIVE");

  const parts: string[] = [];

  if (positives.length > 0) {
    parts.push(
      `${positives.length} point${positives.length > 1 ? "s" : ""} positif${positives.length > 1 ? "s" : ""} identifié${positives.length > 1 ? "s" : ""}`,
    );
  }

  if (warnings.length > 0 || negatives.length > 0) {
    const alertCount = warnings.length + negatives.length;
    parts.push(
      `${alertCount} point${alertCount > 1 ? "s" : ""} d'attention`,
    );
  }

  if (parts.length === 0) {
    return "Analyse neutre : aucun signal fort dans un sens ou dans l'autre.";
  }

  return `En synthèse : ${parts.join(", ")}.`;
}
