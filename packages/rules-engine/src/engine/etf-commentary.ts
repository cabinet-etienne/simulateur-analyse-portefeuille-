import type { EtfData, Product, Comment } from "@repo/core-domain";
import { formatPercent, formatAmount, roundTo } from "@repo/core-domain";
import { evaluateRules } from "./evaluate";
import { etfRuleSet } from "../rules/etf-rules";

/**
 * Prepare the data context for rule evaluation.
 * Pre-computes group-relative fields and formatted values.
 */
function prepareContext(
  product: Product,
  data: EtfData,
  groupData: Array<{ product: Product; data: EtfData }>,
): Record<string, unknown> {
  const allTers = groupData.map((g) => g.data.ter);
  const minTer = Math.min(...allTers);
  const maxTer = Math.max(...allTers);

  const allReturn1y = groupData
    .map((g) => g.data.return1y)
    .filter((r): r is number => r !== null);
  const maxReturn1y = allReturn1y.length > 0 ? Math.max(...allReturn1y) : null;

  const yearsSinceInception =
    (Date.now() - new Date(data.inceptionDate).getTime()) /
    (1000 * 60 * 60 * 24 * 365.25);

  return {
    // Identity
    name: product.name,

    // Raw values (used by rule conditions)
    ter: data.ter,
    trackingError: data.trackingError,
    trackingDifference: data.trackingDifference,
    aum: data.aum,
    avgDailyVolume: data.avgDailyVolume,
    sharpeRatio: data.sharpeRatio,
    maxDrawdown: data.maxDrawdown,
    volatility1y: data.volatility1y,
    return1y: data.return1y,
    return1yVsIndex: data.return1yVsIndex,
    return3y: data.return3y,
    replication: data.replicationMethod,
    pea: data.peaEligible,
    anciennete_annees: roundTo(yearsSinceInception, 1),

    // Group-relative booleans (pre-computed for rule conditions)
    is_ter_min: data.ter === minTer && groupData.length > 1,
    is_ter_max: data.ter === maxTer && groupData.length > 1 && maxTer !== minTer,
    is_return1y_max:
      data.return1y !== null &&
      maxReturn1y !== null &&
      data.return1y === maxReturn1y &&
      groupData.length > 1,

    // Formatted values (used in template interpolation)
    ter_pct: roundTo(data.ter * 100, 2).toString(),
    ter_spread_pct: roundTo((data.ter - minTer) * 100, 2).toString(),
    cost_10y_eur: formatAmount(data.ter * 100_000 * 10),
    te_pct: data.trackingError !== null ? roundTo(data.trackingError * 100, 2).toString() : "N/A",
    td_pct:
      data.trackingDifference !== null
        ? roundTo(data.trackingDifference * 100, 2).toString()
        : "N/A",
    aum_formatted: formatAmount(data.aum),
    volume:
      data.avgDailyVolume !== null
        ? new Intl.NumberFormat("fr-FR").format(data.avgDailyVolume)
        : "N/A",
    sharpe: data.sharpeRatio !== null ? roundTo(data.sharpeRatio, 2).toString() : "N/A",
    maxdd_pct:
      data.maxDrawdown !== null ? roundTo(data.maxDrawdown * 100, 1).toString() : "N/A",
    vol_pct:
      data.volatility1y !== null ? roundTo(data.volatility1y * 100, 1).toString() : "N/A",
    ret1y_pct: data.return1y !== null ? roundTo(data.return1y * 100, 2).toString() : "N/A",
    gap_pct:
      data.return1yVsIndex !== null
        ? roundTo(data.return1yVsIndex * 100, 2).toString()
        : "N/A",
  };
}

/**
 * Generate all comments for a single ETF within a comparison group.
 */
export function generateEtfComments(
  product: Product,
  data: EtfData,
  groupData: Array<{ product: Product; data: EtfData }>,
): Comment[] {
  const context = prepareContext(product, data, groupData);
  return evaluateRules(etfRuleSet.rules, context);
}

/**
 * Generate a comparative summary for the entire group.
 */
export function generateComparativeSummary(
  results: Array<{
    product: Product;
    data: EtfData;
    score: number;
    topAxes: string[];
    weakAxes: string[];
  }>,
): string {
  if (results.length === 0) {
    return "";
  }

  const sorted = [...results].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const bestStrengths =
    best.topAxes.length > 0 ? best.topAxes.join(", ") : "un profil équilibré";
  const worstWeaknesses =
    worst.weakAxes.length > 0 ? worst.weakAxes.join(", ") : "un profil en retrait";

  return (
    `Sur les ${results.length} ETF comparés, ${best.product.name} se distingue avec un score global de ${best.score}/100, ` +
    `porté par ${bestStrengths}. ${worst.product.name} est en retrait (${worst.score}/100), ` +
    `pénalisé par ${worstWeaknesses}.`
  );
}
