import type { DistributionPolicy, ReplicationMethod } from "../enums";

export interface EtfData {
  productId: string;
  indexTracked: string;
  replicationMethod: ReplicationMethod;
  ter: number;
  aum: number;
  distributionPolicy: DistributionPolicy;
  domicile: string;
  inceptionDate: Date;
  trackingError: number | null;
  volatility1y: number | null;
  volatility3y: number | null;
  returnYtd: number | null;
  return1y: number | null;
  return3y: number | null;
  return5y: number | null;
  sharpeRatio: number | null;
  sectorExposure: Record<string, number>;
  geoExposure: Record<string, number>;
  topHoldings: Holding[];
  peaEligible: boolean;
  sriLabel: string | null;
}

export interface Holding {
  name: string;
  weight: number;
  isin?: string;
}

/** Résultat d'une analyse ETF (produit par adapters-etf) */
export interface EtfAnalysisResult {
  productId: string;
  totalCost: number;
  performanceScore: number | null;
  trackingQuality: TrackingQuality | null;
  riskMetrics: EtfRiskMetrics | null;
  liquidityScore: number;
  comments: string[];
}

export interface TrackingQuality {
  trackingError: number;
  trackingDifference: number;
  rating: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
}

export interface EtfRiskMetrics {
  volatility: number;
  maxDrawdown: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
}
