import type { DistributionPolicy, InstrumentSubType } from "../enums";

/**
 * Données spécifiques aux fonds classiques (OPCVM / SICAV / FCP).
 * Structure proche d'EtfData mais sans tracking (pas d'indice répliqué)
 * et avec des champs propres à la gestion active.
 */
export interface FundData {
  productId: string;
  // Classification
  fundSubType: Extract<InstrumentSubType, "OPCVM_SICAV" | "OPCVM_FCP" | "FUND_OTHER">;
  managementCompany: string;
  fundManager: string | null;
  category: string; // Morningstar category or AMF classification
  benchmark: string | null;
  // Structure
  distributionPolicy: DistributionPolicy;
  domicile: string;
  inceptionDate: Date;
  peaEligible: boolean;
  ucitsCompliant: boolean;
  sriLabel: string | null;
  // Coûts — Les OPCVM ont des frais plus complexes que les ETF
  ongoingCharges: number; // Frais courants (TFE / ongoing charges)
  managementFee: number; // Frais de gestion annuels
  entryFee: number | null; // Frais d'entrée max
  exitFee: number | null; // Frais de sortie max
  performanceFee: number | null; // Commission de surperformance
  // Performance
  returnYtd: number | null;
  return1y: number | null;
  return3y: number | null;
  return5y: number | null;
  return1yVsBenchmark: number | null;
  // Risque
  volatility1y: number | null;
  volatility3y: number | null;
  maxDrawdown: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  beta: number | null;
  // Taille & liquidité
  aum: number;
  // Expositions
  sectorExposure: Record<string, number>;
  geoExposure: Record<string, number>;
  topHoldings: FundHolding[];
  // Notation
  morningstarRating: number | null; // 1 à 5 étoiles
  morningstarCategory: string | null;
}

export interface FundHolding {
  name: string;
  weight: number;
  isin?: string;
}

// ─── Analyse ────────────────────────────────────────────────

export interface FundAnalysisResult {
  productId: string;
  costAnalysis: FundCostAnalysis;
  performanceAnalysis: FundPerformanceAnalysis;
  riskAnalysis: FundRiskAnalysis;
  comments: import("../interfaces").Comment[];
  summary: string;
}

export interface FundCostAnalysis {
  totalAnnualCost: number; // ongoing + management
  costImpact10y: number; // Impact cumulé sur 10 ans pour 10k€
  costRating: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
}

export interface FundPerformanceAnalysis {
  absoluteReturn1y: number | null;
  vsBenchmark1y: number | null;
  consistency3y: number | null; // Régularité des performances
  performanceRating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | null;
}

export interface FundRiskAnalysis {
  volatilityLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | null;
  drawdownSeverity: "MILD" | "MODERATE" | "SEVERE" | null;
  riskAdjustedReturn: number | null; // Sharpe
}
