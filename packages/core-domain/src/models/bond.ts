import type { BondSeniority, CouponFrequency, CreditRatingAgency, IssuerType } from "../enums";

export interface BondData {
  productId: string;
  issuer: string;
  issuerType: IssuerType;
  couponRate: number;
  couponFrequency: CouponFrequency;
  maturityDate: Date;
  issueDate: Date;
  nominalValue: number;
  purchasePrice: number;
  currentPrice: number;
  ytm: number | null;
  duration: number | null;
  modifiedDuration: number | null;
  convexity: number | null;
  creditRating: string;
  ratingAgency: CreditRatingAgency;
  seniority: BondSeniority;
  callable: boolean;
  callDate: Date | null;
  callPrice: number | null;
}

/** Résultat d'une analyse obligation */
export interface BondAnalysisResult {
  productId: string;
  yieldMetrics: BondYieldMetrics;
  sensitivityMetrics: BondSensitivityMetrics;
  creditAssessment: CreditAssessment;
  rateScenarios: RateScenario[];
  cashflows: Cashflow[];
  comments: string[];
}

export interface BondYieldMetrics {
  ytm: number;
  currentYield: number;
  yieldToCall: number | null;
  spreadVsRiskFree: number;
}

export interface BondSensitivityMetrics {
  duration: number;
  modifiedDuration: number;
  convexity: number;
  priceImpactBps100: number;
}

export interface CreditAssessment {
  rating: string;
  category: "INVESTMENT_GRADE" | "HIGH_YIELD" | "NOT_RATED";
  defaultProbability5y: number | null;
}

export interface RateScenario {
  shockBps: number;
  priceImpactPercent: number;
  newPrice: number;
}

export interface Cashflow {
  date: Date;
  type: "COUPON" | "PRINCIPAL" | "COUPON_AND_PRINCIPAL";
  amount: number;
}
