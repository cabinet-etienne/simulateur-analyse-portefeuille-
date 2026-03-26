/**
 * Ensemble de scénarios de simulation appliqués à une version de portefeuille.
 *
 * Permet de simuler l'impact de chocs de marché, de variations de taux,
 * ou de réallocations sur le portefeuille.
 */
export interface ScenarioSet {
  id: string;
  portfolioVersionId: string;
  name: string; // ex: "Stress test taux +200bps"
  description: string;
  scenarios: ScenarioDefinition[];
  // Méta
  createdBy: string;
  createdAt: Date;
}

export interface ScenarioDefinition {
  id: string;
  label: string; // ex: "Hausse taux 100bps", "Crash actions -30%"
  type: ScenarioType;
  parameters: Record<string, number>; // ex: { rateShockBps: 100 } ou { equityShockPct: -30 }
}

export type ScenarioType =
  | "RATE_SHOCK"
  | "EQUITY_SHOCK"
  | "CREDIT_SPREAD"
  | "INFLATION"
  | "CUSTOM";

export interface ScenarioResult {
  scenarioId: string;
  scenarioSetId: string;
  portfolioVersionId: string;
  // Résultats
  impactAmount: number; // Impact en montant absolu
  impactPercent: number; // Impact en pourcentage
  newTotalAmount: number;
  detailByHolding: ScenarioHoldingImpact[];
  computedAt: Date;
}

export interface ScenarioHoldingImpact {
  holdingId: string;
  instrumentName: string;
  currentAmount: number;
  impactAmount: number;
  impactPercent: number;
  newAmount: number;
}
