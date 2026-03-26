import type {
  EtfData,
  Product,
  EtfScoringResult,
  EtfAxisScores,
  EtfScoringWeights,
  EtfVerdict,
} from "@repo/core-domain";
import { DEFAULT_ETF_WEIGHTS } from "@repo/core-domain";

// ─── Helpers ────────────────────────────────────────────────

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Rank-based score: best rank (1) → 100, worst rank (n) → 0.
 * When the group has a single element, returns 50.
 */
function rankScore(rank: number, groupSize: number): number {
  if (groupSize <= 1) return 50;
  return 100 * (1 - (rank - 1) / (groupSize - 1));
}

/**
 * Compute the 1-based rank of `value` within `values` (ascending — lower is better).
 * Ties share the same rank.
 */
function rankAsc(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.indexOf(value) + 1;
}

/**
 * Compute the 1-based rank of `value` within `values` (descending — higher is better).
 */
function rankDesc(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => b - a);
  return sorted.indexOf(value) + 1;
}

type EtfEntry = { product: Product; data: EtfData };

// ─── Axis: Costs ────────────────────────────────────────────

export function scoreCosts(etf: EtfEntry, group: EtfEntry[]): number {
  const totalCost = (e: EtfEntry) => e.data.ter + (e.data.transactionCost ?? 0);
  const costs = group.map(totalCost);
  const myCost = totalCost(etf);
  const rank = rankAsc(myCost, costs);
  let score = rankScore(rank, group.length);

  // Absolute bonus / malus based on TER
  if (etf.data.ter < 0.001) score += 10; // TER < 0.10%
  if (etf.data.ter > 0.005) score -= 15; // TER > 0.50%

  return clamp(Math.round(score), 0, 100);
}

// ─── Axis: Performance ──────────────────────────────────────

export function scorePerformance(etf: EtfEntry, group: EtfEntry[]): number | null {
  // Need at least return1y to compute
  const hasAny = (e: EtfEntry) =>
    e.data.return1y != null || e.data.return3y != null || e.data.return5y != null;

  if (!hasAny(etf)) return null;

  // Weighted composite: return1y 20%, return3y 40%, return5y 40%
  const horizons: Array<{ key: "return1y" | "return3y" | "return5y"; weight: number }> = [
    { key: "return1y", weight: 0.2 },
    { key: "return3y", weight: 0.4 },
    { key: "return5y", weight: 0.4 },
  ];

  let score = 0;
  let totalWeight = 0;

  for (const h of horizons) {
    const val = etf.data[h.key];
    if (val == null) continue;

    const groupVals = group.map((e) => e.data[h.key]).filter((v): v is number => v != null);
    if (groupVals.length === 0) continue;

    const rank = rankDesc(val, groupVals);
    const s = rankScore(rank, groupVals.length);
    score += s * h.weight;
    totalWeight += h.weight;
  }

  if (totalWeight === 0) return null;
  score = score / totalWeight; // renormalize if some horizons missing

  // Bonus / malus on return1yVsIndex
  if (etf.data.return1yVsIndex != null) {
    if (etf.data.return1yVsIndex > 0) score += 5;
    if (etf.data.return1yVsIndex < -0.02) score -= 10;
  }

  return clamp(Math.round(score), 0, 100);
}

// ─── Axis: Tracking ─────────────────────────────────────────

export function scoreTracking(etf: EtfEntry): number | null {
  if (etf.data.trackingError == null) return null;

  const te = etf.data.trackingError;
  let score: number;
  if (te <= 0.0005) score = 100;      // <= 0.05%
  else if (te <= 0.001) score = 90;   // <= 0.10%
  else if (te <= 0.002) score = 75;   // <= 0.20%
  else if (te <= 0.005) score = 50;   // <= 0.50%
  else if (te <= 0.01) score = 25;    // <= 1.00%
  else score = 0;                      // > 1.00%

  // trackingDifference adjustment
  if (etf.data.trackingDifference != null) {
    if (etf.data.trackingDifference <= -0.001) score -= 10; // <= -0.10%
    else if (etf.data.trackingDifference >= 0.0005) score += 5; // >= +0.05%
  }

  return clamp(Math.round(score), 0, 100);
}

// ─── Axis: Risk ─────────────────────────────────────────────

export function scoreRisk(etf: EtfEntry, group: EtfEntry[]): number | null {
  const hasSharpe = etf.data.sharpeRatio != null;
  const hasVol = etf.data.volatility1y != null;
  const hasDD = etf.data.maxDrawdown != null;

  if (!hasSharpe && !hasVol && !hasDD) return null;

  let score = 0;
  let totalWeight = 0;

  // Sharpe (40%): normalized on [-1, 3] → 0-100
  if (hasSharpe) {
    const sharpeNorm = clamp((etf.data.sharpeRatio! - (-1)) / (3 - (-1)), 0, 1) * 100;
    score += sharpeNorm * 0.4;
    totalWeight += 0.4;
  }

  // Volatility (30%): inverse relative to group (lower is better)
  if (hasVol) {
    const groupVols = group
      .map((e) => e.data.volatility1y)
      .filter((v): v is number => v != null);
    if (groupVols.length > 0) {
      const rank = rankAsc(etf.data.volatility1y!, groupVols);
      const s = rankScore(rank, groupVols.length);
      score += s * 0.3;
      totalWeight += 0.3;
    }
  }

  // MaxDrawdown (30%): inverse relative to group (closer to 0 is better)
  if (hasDD) {
    const groupDDs = group
      .map((e) => e.data.maxDrawdown)
      .filter((v): v is number => v != null);
    if (groupDDs.length > 0) {
      // Higher (closer to 0) maxDrawdown is better → rank descending
      const rank = rankDesc(etf.data.maxDrawdown!, groupDDs);
      const s = rankScore(rank, groupDDs.length);
      score += s * 0.3;
      totalWeight += 0.3;
    }
  }

  if (totalWeight === 0) return null;
  score = score / totalWeight; // renormalize

  // Bonus / malus
  if (etf.data.sharpeRatio != null && etf.data.sharpeRatio > 1.5) score += 5;
  if (etf.data.maxDrawdown != null && etf.data.maxDrawdown < -0.30) score -= 10;

  return clamp(Math.round(score), 0, 100);
}

// ─── Axis: Liquidity ────────────────────────────────────────

export function scoreLiquidity(etf: EtfEntry): number {
  const aum = etf.data.aum;
  let score: number;
  if (aum >= 5_000_000_000) score = 100;
  else if (aum >= 1_000_000_000) score = 85;
  else if (aum >= 500_000_000) score = 70;
  else if (aum >= 100_000_000) score = 50;
  else if (aum >= 50_000_000) score = 30;
  else score = 10;

  // avgDailyVolume adjustment
  if (etf.data.avgDailyVolume != null) {
    if (etf.data.avgDailyVolume >= 1_000_000) score += 10;
    if (etf.data.avgDailyVolume < 10_000) score -= 15;
  }

  return clamp(Math.round(score), 0, 100);
}

// ─── Axis: Maturity ─────────────────────────────────────────

export function scoreMaturity(etf: EtfEntry): number {
  const now = new Date();
  const inception = new Date(etf.data.inceptionDate);
  const yearsActive = (now.getTime() - inception.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  let score: number;
  if (yearsActive >= 10) score = 100;
  else if (yearsActive >= 5) score = 80;
  else if (yearsActive >= 3) score = 60;
  else if (yearsActive >= 1) score = 40;
  else score = 15;

  // Replication bonus
  if (etf.data.replicationMethod === "PHYSICAL") score += 5;
  // UCITS bonus
  if (etf.data.ucitsCompliant) score += 5;

  return clamp(Math.round(score), 0, 100);
}

// ─── Global Score ───────────────────────────────────────────

export function computeGlobalScore(
  axes: EtfAxisScores,
  weights: EtfScoringWeights,
): number {
  const entries: Array<{ key: keyof EtfAxisScores; weight: number }> = [
    { key: "costs", weight: weights.costs },
    { key: "performance", weight: weights.performance },
    { key: "tracking", weight: weights.tracking },
    { key: "risk", weight: weights.risk },
    { key: "liquidity", weight: weights.liquidity },
    { key: "maturity", weight: weights.maturity },
  ];

  let weightedSum = 0;
  let totalWeight = 0;

  for (const { key, weight } of entries) {
    const score = axes[key];
    if (score == null) continue;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

// ─── Verdict ────────────────────────────────────────────────

export function getVerdict(score: number): EtfVerdict {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "BON";
  if (score >= 55) return "CORRECT";
  if (score >= 40) return "PASSABLE";
  return "A_EVITER";
}

// ─── Main Entry Point ───────────────────────────────────────

/**
 * Score a group of ETFs comparatively (scoring is relative to the group).
 * Returns an array of scoring results, one per ETF, ranked by global score.
 */
export function scoreEtfGroup(
  etfs: Array<{ product: Product; data: EtfData }>,
  weights?: Partial<EtfScoringWeights>,
): EtfScoringResult[] {
  const mergedWeights: EtfScoringWeights = {
    ...DEFAULT_ETF_WEIGHTS,
    ...weights,
  };

  const results: EtfScoringResult[] = etfs.map((etf) => {
    const scores: EtfAxisScores = {
      costs: scoreCosts(etf, etfs),
      performance: scorePerformance(etf, etfs),
      tracking: scoreTracking(etf),
      risk: scoreRisk(etf, etfs),
      liquidity: scoreLiquidity(etf),
      maturity: scoreMaturity(etf),
    };

    const globalScore = computeGlobalScore(scores, mergedWeights);
    const verdict = getVerdict(globalScore);

    return {
      productId: etf.product.id,
      scores,
      globalScore,
      rank: 0, // will be set after sorting
      verdict,
    };
  });

  // Sort by globalScore descending, assign ranks
  results.sort((a, b) => b.globalScore - a.globalScore);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return results;
}
