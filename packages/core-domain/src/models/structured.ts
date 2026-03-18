import type {
  BarrierType,
  CouponType,
  ObservationFrequency,
  StructuredProductSubtype,
  UnderlyingType,
} from "../enums";

export interface StructuredProductData {
  productId: string;
  issuer: string;
  underlying: string;
  underlyingType: UnderlyingType;
  productSubtype: StructuredProductSubtype;
  strikeDate: Date;
  maturityDate: Date;
  capitalProtection: number;
  barrierLevel: number;
  barrierType: BarrierType;
  couponRate: number;
  couponType: CouponType;
  couponTriggerLevel: number;
  autocallTriggerLevel: number | null;
  autocallFrequency: ObservationFrequency | null;
  observationDates: Date[];
  feesEntry: number;
  feesOngoing: number;
  payoffDescription: string;
  scenarios: ProductScenarios;
}

export interface ProductScenarios {
  optimistic: ScenarioResult;
  median: ScenarioResult;
  pessimistic: ScenarioResult;
  stress: ScenarioResult;
}

export interface ScenarioResult {
  underlyingPerformance: number;
  productReturn: number;
  annualizedReturn: number;
  capitalReturn: number;
  description: string;
}

/** Résultat d'une analyse produit structuré */
export interface StructuredAnalysisResult {
  productId: string;
  payoffProfile: PayoffPoint[];
  barrierAnalysis: BarrierAnalysis;
  costBreakdown: CostBreakdown;
  complexityScore: number;
  comments: string[];
}

export interface PayoffPoint {
  underlyingLevel: number;
  productReturn: number;
}

export interface BarrierAnalysis {
  level: number;
  type: BarrierType;
  historicalBreachCount: number | null;
  historicalPeriodYears: number | null;
  distanceFromCurrent: number;
}

export interface CostBreakdown {
  entryFees: number;
  ongoingFees: number;
  estimatedStructurerMargin: number | null;
  totalFirstYear: number;
}
