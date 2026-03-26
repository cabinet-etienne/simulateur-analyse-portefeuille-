import type {
  AssetClass,
  BondData,
  EtfData,
  FundData,
  LiquidityAnalysis,
  PortfolioAnalysisResult,
  PortfolioCostAnalysis,
  Product,
  ScpiData,
  StructuredProductData,
} from "@repo/core-domain";

import { computeAllocation } from "../allocation/compute-allocation";
import { analyzeConcentration } from "../analysis/concentration";

type ProductData = EtfData | FundData | BondData | StructuredProductData | ScpiData;

interface ConsolidationInput {
  product: Product;
  data: ProductData;
  weight: number;
  amount: number;
}

/**
 * Point d'entrée principal de la consolidation portefeuille.
 *
 * Scaffold : les calculs sont implémentés de manière minimale.
 * Le moteur complet sera développé en V2.
 */
export function consolidatePortfolio(
  inputs: ConsolidationInput[],
  portfolioId: string,
): PortfolioAnalysisResult {
  const allocation = computeAllocation(
    inputs.map((i) => ({
      product: i.product,
      weight: i.weight,
      geoExposure: getGeoExposure(i.product.type, i.data),
      sectorExposure: getSectorExposure(i.product.type, i.data),
    })),
  );

  const costAnalysis = computeCosts(inputs);
  const liquidityAnalysis = analyzeLiquidity(inputs);

  const assetClassExposures = Object.entries(allocation.byAssetClass).map(
    ([name, weight]) => ({
      name,
      type: "ASSET_CLASS" as const,
      weight,
    }),
  );
  const concentrationAnalysis = analyzeConcentration(assetClassExposures);

  return {
    portfolioId,
    allocation,
    costAnalysis,
    riskAnalysis: {
      estimatedVolatility: null,
      expectedReturn: null,
      estimatedSharpe: null,
      aggregatedDuration: null,
      rateImpactBps100: null,
    },
    concentrationAnalysis,
    profileCoherence: {
      targetProfile: "EQUILIBRE",
      coherenceScore: 0,
      deviations: [],
    },
    liquidityAnalysis,
    comments: [],
  };
}

function computeCosts(inputs: ConsolidationInput[]): PortfolioCostAnalysis {
  let weightedAnnualCost = 0;
  let totalEntryFees = 0;
  const costByProduct = [];

  for (const input of inputs) {
    const annualCost = getAnnualCost(input.product.type, input.data);
    const entryCost = getEntryCost(input.product.type, input.data);

    weightedAnnualCost += annualCost * input.weight;
    totalEntryFees += entryCost * input.amount;

    costByProduct.push({
      productId: input.product.id,
      productName: input.product.name,
      annualCost,
      weight: input.weight,
    });
  }

  const globalBreakEvenYears =
    weightedAnnualCost > 0 ? totalEntryFees / (weightedAnnualCost * inputs.reduce((s, i) => s + i.amount, 0)) : 0;

  return { weightedAnnualCost, totalEntryFees, globalBreakEvenYears, costByProduct };
}

function analyzeLiquidity(inputs: ConsolidationInput[]): LiquidityAnalysis {
  let liquidShare = 0;
  let illiquidShare = 0;
  let semiLiquidShare = 0;

  for (const input of inputs) {
    switch (input.product.type) {
      case "ETF":
      case "FUND":
      case "BOND":
        liquidShare += input.weight;
        break;
      case "SCPI":
        illiquidShare += input.weight;
        break;
      case "STRUCTURED":
        semiLiquidShare += input.weight;
        break;
      default:
        illiquidShare += input.weight;
    }
  }

  return {
    liquidShare,
    illiquidShare,
    semiLiquidShare,
    stressScenario:
      illiquidShare > 0.4
        ? "Plus de 40% du portefeuille est illiquide. En cas de besoin urgent de liquidité, seule une partie du portefeuille serait mobilisable rapidement."
        : "Le profil de liquidité du portefeuille est compatible avec un besoin de liquidité modéré.",
  };
}

// ─── Helpers d'extraction par type ──────────────────────────────────

function getGeoExposure(type: AssetClass, data: ProductData): Record<string, number> {
  if (type === "ETF") return (data as EtfData).geoExposure;
  if (type === "FUND") return (data as FundData).geoExposure;
  if (type === "SCPI") return (data as ScpiData).geoAllocation;
  return {};
}

function getSectorExposure(type: AssetClass, data: ProductData): Record<string, number> {
  if (type === "ETF") return (data as EtfData).sectorExposure;
  if (type === "FUND") return (data as FundData).sectorExposure;
  if (type === "SCPI") return (data as ScpiData).sectorAllocation;
  return {};
}

function getAnnualCost(type: AssetClass, data: ProductData): number {
  if (type === "ETF") return Number((data as EtfData).ter);
  if (type === "FUND") return Number((data as FundData).ongoingCharges);
  if (type === "SCPI") return Number((data as ScpiData).managementFee);
  if (type === "STRUCTURED") return Number((data as StructuredProductData).feesOngoing);
  return 0;
}

function getEntryCost(type: AssetClass, data: ProductData): number {
  if (type === "FUND") return Number((data as FundData).entryFee ?? 0);
  if (type === "SCPI") return Number((data as ScpiData).subscriptionFee);
  if (type === "STRUCTURED") return Number((data as StructuredProductData).feesEntry);
  return 0;
}
