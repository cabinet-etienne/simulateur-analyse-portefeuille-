import type { DataConfidence, DataSource } from "../enums";

/**
 * Traçabilité structurée de la fraîcheur des données par champ.
 *
 * Remplace le JSON opaque `dataSources` sur Product.
 * Permet de savoir pour chaque champ : d'où vient la donnée,
 * quand elle a été récupérée, et quel niveau de confiance lui accorder.
 */
export interface DataFreshness {
  id: string;
  entityType: string; // "Instrument", "EtfData", "FundData", etc.
  entityId: string;
  field: string; // ex: "ter", "aum", "return1y"
  source: DataSource;
  sourceDetail: string | null; // ex: "justETF scraping", "import CSV client"
  confidence: DataConfidence;
  fetchedAt: Date; // Quand la donnée a été récupérée
  validUntil: Date | null; // Date d'expiration estimée
  updatedBy: string;
}

/**
 * Calcule le niveau de confiance en fonction de l'âge de la donnée.
 * Règle métier : HIGH < 24h, MEDIUM < 7j, LOW < 30j, STALE > 30j
 */
export function computeConfidence(fetchedAt: Date, now: Date = new Date()): DataConfidence {
  const ageMs = now.getTime() - fetchedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 24) return "HIGH";
  if (ageHours < 24 * 7) return "MEDIUM";
  if (ageHours < 24 * 30) return "LOW";
  return "STALE";
}
