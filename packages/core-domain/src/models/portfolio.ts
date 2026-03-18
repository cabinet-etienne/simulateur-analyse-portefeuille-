import type { AssetClass, RiskProfile } from "../enums";

/** Résultat complet de la consolidation portefeuille */
export interface PortfolioAnalysisResult {
  portfolioId: string;
  allocation: AllocationBreakdown;
  costAnalysis: PortfolioCostAnalysis;
  riskAnalysis: PortfolioRiskAnalysis;
  concentrationAnalysis: ConcentrationAnalysis;
  profileCoherence: ProfileCoherence;
  liquidityAnalysis: LiquidityAnalysis;
  comments: string[];
}

export interface AllocationBreakdown {
  byAssetClass: Record<AssetClass, number>;
  byGeography: Record<string, number>;
  bySector: Record<string, number>;
  byCurrency: Record<string, number>;
}

export interface PortfolioCostAnalysis {
  weightedAnnualCost: number;
  totalEntryFees: number;
  globalBreakEvenYears: number;
  costByProduct: Array<{
    productId: string;
    productName: string;
    annualCost: number;
    weight: number;
  }>;
}

export interface PortfolioRiskAnalysis {
  estimatedVolatility: number | null;
  expectedReturn: number | null;
  estimatedSharpe: number | null;
  aggregatedDuration: number | null;
  rateImpactBps100: number | null;
}

export interface ConcentrationAnalysis {
  hhi: number;
  hhiRating: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  topExposures: Array<{
    name: string;
    type: "SECTOR" | "GEOGRAPHY" | "ISSUER" | "ASSET_CLASS";
    weight: number;
  }>;
  alerts: string[];
}

export interface ProfileCoherence {
  targetProfile: RiskProfile;
  coherenceScore: number;
  deviations: Array<{
    metric: string;
    expected: string;
    actual: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
  }>;
}

export interface LiquidityAnalysis {
  liquidShare: number;
  illiquidShare: number;
  semiLiquidShare: number;
  stressScenario: string;
}
