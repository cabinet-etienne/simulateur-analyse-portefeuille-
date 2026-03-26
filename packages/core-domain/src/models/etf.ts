import type { DistributionPolicy, ReplicationMethod } from "../enums";

export interface EtfData {
  productId: string;
  // Identification
  indexTracked: string;
  provider: string | null;
  ticker: string | null;
  // Structure
  replicationMethod: ReplicationMethod;
  distributionPolicy: DistributionPolicy;
  domicile: string;
  inceptionDate: Date;
  peaEligible: boolean;
  ucitsCompliant: boolean;
  sriLabel: string | null;
  // Coûts
  ter: number;
  transactionCost: number | null;
  spreadEstimate: number | null;
  // Performance
  returnYtd: number | null;
  return1y: number | null;
  return3y: number | null;
  return5y: number | null;
  return1yVsIndex: number | null;
  // Risque
  volatility1y: number | null;
  volatility3y: number | null;
  maxDrawdown: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  beta: number | null;
  // Tracking
  trackingError: number | null;
  trackingDifference: number | null;
  // Liquidité
  aum: number;
  avgDailyVolume: number | null;
  // Expositions
  sectorExposure: Record<string, number>;
  geoExposure: Record<string, number>;
  topHoldings: Holding[];
}

export interface Holding {
  name: string;
  weight: number;
  isin?: string;
}

// ─── Scoring ────────────────────────────────────────────────

export interface EtfScoringResult {
  productId: string;
  scores: EtfAxisScores;
  globalScore: number;
  rank: number;
  verdict: EtfVerdict;
}

export interface EtfAxisScores {
  costs: number;
  performance: number | null;
  tracking: number | null;
  risk: number | null;
  liquidity: number;
  maturity: number;
}

export type EtfVerdict = "EXCELLENT" | "BON" | "CORRECT" | "PASSABLE" | "A_EVITER";

export const ETF_VERDICT_LABELS: Record<EtfVerdict, string> = {
  EXCELLENT: "Excellent",
  BON: "Bon",
  CORRECT: "Correct",
  PASSABLE: "Passable",
  A_EVITER: "À éviter",
};

export interface EtfScoringWeights {
  costs: number;
  performance: number;
  tracking: number;
  risk: number;
  liquidity: number;
  maturity: number;
}

export const DEFAULT_ETF_WEIGHTS: EtfScoringWeights = {
  costs: 0.25,
  performance: 0.20,
  tracking: 0.20,
  risk: 0.15,
  liquidity: 0.10,
  maturity: 0.10,
};

// ─── Analyse complète (scoring + commentaires) ──────────────

export interface EtfAnalysisResult {
  productId: string;
  scoring: EtfScoringResult;
  comments: import("../interfaces").Comment[];
  summary: string;
}

// ─── Comparaison ────────────────────────────────────────────

export interface EtfComparisonResult {
  etfs: EtfAnalysisResult[];
  ranking: Array<{ productId: string; name: string; score: number; rank: number }>;
  bestPerAxis: Record<keyof EtfAxisScores, { productId: string; name: string; score: number }>;
  comparativeSummary: string;
}

// ─── Sélection pour portefeuille ────────────────────────────

export interface EtfSelection {
  productId: string;
  name: string;
  isin: string;
  score: number;
  verdict: EtfVerdict;
  selectionRationale: string;
}
