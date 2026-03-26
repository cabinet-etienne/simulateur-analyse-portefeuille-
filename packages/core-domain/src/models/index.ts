export type { User, Product, Instrument, FieldSource, Portfolio, PortfolioAllocation, SharedReport, DataAuditEntry } from "./base";
export type { EtfData, Holding as EtfHolding, EtfScoringResult, EtfAxisScores, EtfScoringWeights, EtfAnalysisResult, EtfComparisonResult, EtfSelection } from "./etf";
export { DEFAULT_ETF_WEIGHTS, ETF_VERDICT_LABELS } from "./etf";
export type { EtfVerdict } from "./etf";
export type { FundData, FundHolding, FundAnalysisResult, FundCostAnalysis, FundPerformanceAnalysis, FundRiskAnalysis } from "./fund";
export type { BondData, BondAnalysisResult, BondYieldMetrics, BondSensitivityMetrics, CreditAssessment, RateScenario, Cashflow } from "./bond";
export type { StructuredProductData, ProductScenarios, ScenarioResult as StructuredScenarioResult, StructuredAnalysisResult, PayoffPoint, BarrierAnalysis, CostBreakdown } from "./structured";
export type { ScpiData, ScpiYearlyReturn, ScpiAnalysisResult, ScpiYieldAnalysis, ScpiCostAnalysis, ScpiQualityMetrics, ScpiHistoricalTrend } from "./scpi";
export type { PortfolioAnalysisResult, AllocationBreakdown, PortfolioCostAnalysis, PortfolioRiskAnalysis, ConcentrationAnalysis, ProfileCoherence, LiquidityAnalysis } from "./portfolio";

// ─── Nouveaux modèles V1 ────────────────────────────────────────────
export type { Wrapper, Contract } from "./wrapper";
export type { Holding } from "./holding";
export type { PortfolioVersion } from "./portfolio-version";
export type { ScenarioSet, ScenarioDefinition, ScenarioType, ScenarioResult, ScenarioHoldingImpact } from "./scenario";
export type { Report, ReportSnapshot } from "./report";
export type { DataFreshness } from "./data-freshness";
export { computeConfidence } from "./data-freshness";
