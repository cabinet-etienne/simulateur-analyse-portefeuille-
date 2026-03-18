import type { CapitalType, ScpiType } from "../enums";

export interface ScpiData {
  productId: string;
  managementCompany: string;
  scpiType: ScpiType;
  capitalType: CapitalType;
  sharePrice: number;
  subscriptionFee: number;
  managementFee: number;
  withdrawalFee: number | null;
  distributionRate: number;
  revaluationRate: number;
  occupancyRate: number;
  capitalization: number;
  totalArea: number;
  nbProperties: number;
  nbTenants: number;
  debtRatio: number;
  sectorAllocation: Record<string, number>;
  geoAllocation: Record<string, number>;
  historicalReturns: ScpiYearlyReturn[];
  minimumSubscription: number;
  dismembermentAvailable: boolean;
  lifeInsuranceEligible: boolean;
}

export interface ScpiYearlyReturn {
  year: number;
  distribution: number;
  revaluation: number;
}

/** Résultat d'une analyse SCPI */
export interface ScpiAnalysisResult {
  productId: string;
  yieldAnalysis: ScpiYieldAnalysis;
  costAnalysis: ScpiCostAnalysis;
  qualityMetrics: ScpiQualityMetrics;
  historicalTrend: ScpiHistoricalTrend;
  comments: string[];
}

export interface ScpiYieldAnalysis {
  grossYield: number;
  netYield: number;
  totalReturn: number;
  yieldVsCategory: number;
}

export interface ScpiCostAnalysis {
  subscriptionFeeImpact: number;
  breakEvenYears: number;
  totalCostYear1: number;
  ongoingCostPerYear: number;
}

export interface ScpiQualityMetrics {
  occupancyScore: number;
  diversificationScore: number;
  tenantConcentrationIndex: number;
  sectorConcentrationIndex: number;
}

export interface ScpiHistoricalTrend {
  averageDistribution5y: number | null;
  distributionTrend: "INCREASING" | "STABLE" | "DECREASING" | null;
  sharePriceTrend: "INCREASING" | "STABLE" | "DECREASING" | null;
}
