import { describe, expect, it } from "vitest";
import {
  scoreEtfGroup,
  scoreCosts,
  scorePerformance,
  scoreTracking,
  scoreRisk,
  scoreLiquidity,
  scoreMaturity,
  computeGlobalScore,
  getVerdict,
  clamp,
} from "./scoring";
import type { EtfData, Product, EtfAxisScores, EtfScoringWeights } from "@repo/core-domain";

// ─── Test Helpers ───────────────────────────────────────────

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    type: "ETF",
    subType: "ETF_UCITS",
    name: "Test ETF",
    isin: "IE00TEST0001",
    currency: "EUR",
    status: "ACTIVE",
    createdBy: "test",
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date("2020-01-01"),
    dataSources: {},
    tags: [],
    ...overrides,
  } as Product;
}

function makeEtfData(overrides: Partial<EtfData> = {}): EtfData {
  return {
    productId: "prod-1",
    indexTracked: "MSCI World",
    provider: "iShares",
    ticker: "IWDA",
    replicationMethod: "PHYSICAL",
    distributionPolicy: "CAPITALIZING",
    domicile: "IE",
    inceptionDate: new Date("2010-01-01"), // ~16 years old
    peaEligible: false,
    ucitsCompliant: true,
    sriLabel: null,
    ter: 0.002, // 0.20%
    transactionCost: null,
    spreadEstimate: null,
    returnYtd: 0.05,
    return1y: 0.12,
    return3y: 0.35,
    return5y: 0.60,
    return1yVsIndex: 0.001,
    volatility1y: 0.14,
    volatility3y: 0.15,
    maxDrawdown: -0.20,
    sharpeRatio: 0.9,
    sortinoRatio: 1.1,
    beta: 0.98,
    trackingError: 0.0004, // 0.04%
    trackingDifference: -0.0005,
    aum: 50_000_000_000, // 50B
    avgDailyVolume: 500_000,
    sectorExposure: {},
    geoExposure: {},
    topHoldings: [],
    ...overrides,
  };
}

function makeEntry(
  productOverrides: Partial<Product> = {},
  dataOverrides: Partial<EtfData> = {},
) {
  const product = makeProduct(productOverrides);
  const data = makeEtfData({ ...dataOverrides, productId: product.id });
  return { product, data };
}

// ─── Tests ──────────────────────────────────────────────────

describe("clamp", () => {
  it("should clamp values within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(120, 0, 100)).toBe(100);
  });
});

describe("getVerdict", () => {
  // Spec: >=85 EXCELLENT, >=70 BON, >=55 CORRECT, >=40 PASSABLE, <40 A_EVITER
  it("should return EXCELLENT for score >= 85", () => {
    expect(getVerdict(85)).toBe("EXCELLENT");
    expect(getVerdict(100)).toBe("EXCELLENT");
  });

  it("should return BON for score 70-84", () => {
    expect(getVerdict(70)).toBe("BON");
    expect(getVerdict(84)).toBe("BON");
  });

  it("should return CORRECT for score 55-69", () => {
    expect(getVerdict(55)).toBe("CORRECT");
    expect(getVerdict(69)).toBe("CORRECT");
  });

  it("should return PASSABLE for score 40-54", () => {
    expect(getVerdict(40)).toBe("PASSABLE");
    expect(getVerdict(54)).toBe("PASSABLE");
  });

  it("should return A_EVITER for score < 40", () => {
    expect(getVerdict(39)).toBe("A_EVITER");
    expect(getVerdict(0)).toBe("A_EVITER");
  });
});

describe("scoreCosts", () => {
  it("should give bonus +10 for TER < 0.10% (clamped to 100)", () => {
    // TER 0.05% = 0.0005 as decimal. Single ETF → rank score 50 + bonus 10 = 60
    const etf = makeEntry({}, { ter: 0.0005 });
    const score = scoreCosts(etf, [etf]);
    // Single ETF: rank score = 50, bonus +10 for ter < 0.001 → 60
    expect(score).toBe(60);
  });

  it("should apply malus -15 for TER > 0.50%", () => {
    // TER 0.60% = 0.006. Single ETF → rank score 50 - 15 = 35
    const etf = makeEntry({}, { ter: 0.006 });
    const score = scoreCosts(etf, [etf]);
    expect(score).toBe(35);
  });

  it("should rank cheapest ETF highest in a group of 3", () => {
    // Group of 3 with different TERs: 0.10%, 0.20%, 0.40%
    const cheap = makeEntry({ id: "cheap" }, { ter: 0.001 });
    const mid = makeEntry({ id: "mid" }, { ter: 0.002 });
    const expensive = makeEntry({ id: "exp" }, { ter: 0.004 });
    const group = [cheap, mid, expensive];

    const sCheap = scoreCosts(cheap, group);
    const sMid = scoreCosts(mid, group);
    const sExpensive = scoreCosts(expensive, group);

    // Rank 1/3 → 100, rank 2/3 → 50, rank 3/3 → 0
    // cheap TER 0.001 is exactly 0.10% boundary (not < 0.001, so no bonus)
    expect(sCheap).toBeGreaterThan(sMid);
    expect(sMid).toBeGreaterThan(sExpensive);
    expect(sCheap).toBe(100); // rank 1 → 100, no bonus/malus
    expect(sMid).toBe(50);    // rank 2 → 50
    expect(sExpensive).toBe(0); // rank 3 → 0
  });

  it("should include transactionCost in total cost for ranking", () => {
    // ETF A: TER 0.20% + transaction 0.10% = 0.30%
    // ETF B: TER 0.25% + no transaction = 0.25%
    // B is cheaper total → B ranks higher
    const a = makeEntry({ id: "a" }, { ter: 0.002, transactionCost: 0.001 });
    const b = makeEntry({ id: "b" }, { ter: 0.0025, transactionCost: null });
    const group = [a, b];

    const scoreA = scoreCosts(a, group);
    const scoreB = scoreCosts(b, group);
    expect(scoreB).toBeGreaterThan(scoreA);
  });
});

describe("scoreTracking", () => {
  // Spec thresholds: <=0.05%→100, <=0.10%→90, <=0.20%→75, <=0.50%→50, <=1%→25, >1%→0
  it("should return 100 for trackingError <= 0.05%", () => {
    const etf = makeEntry({}, { trackingError: 0.0004, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(100);
  });

  it("should return 90 for trackingError <= 0.10%", () => {
    const etf = makeEntry({}, { trackingError: 0.001, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(90);
  });

  it("should return 75 for trackingError <= 0.20%", () => {
    const etf = makeEntry({}, { trackingError: 0.002, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(75);
  });

  it("should return 50 for trackingError <= 0.50%", () => {
    const etf = makeEntry({}, { trackingError: 0.005, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(50);
  });

  it("should return 25 for trackingError <= 1.00%", () => {
    const etf = makeEntry({}, { trackingError: 0.01, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(25);
  });

  it("should return 0 for trackingError > 1.00%", () => {
    const etf = makeEntry({}, { trackingError: 0.015, trackingDifference: null });
    expect(scoreTracking(etf)).toBe(0);
  });

  it("should return null when trackingError is null", () => {
    const etf = makeEntry({}, { trackingError: null });
    expect(scoreTracking(etf)).toBeNull();
  });

  it("should apply trackingDifference malus of -10 when TD <= -0.10%", () => {
    // TE 0.05% → base 100, TD -0.20% (=-0.002) → -10 → 90
    const etf = makeEntry({}, { trackingError: 0.0005, trackingDifference: -0.002 });
    expect(scoreTracking(etf)).toBe(90);
  });

  it("should apply trackingDifference bonus of +5 when TD >= +0.05%", () => {
    // TE 0.10% → base 90, TD +0.10% (=0.001) → +5 → 95
    const etf = makeEntry({}, { trackingError: 0.001, trackingDifference: 0.001 });
    expect(scoreTracking(etf)).toBe(95);
  });
});

describe("scoreLiquidity", () => {
  // Spec: >=5B→100, >=1B→85, >=500M→70, >=100M→50, >=50M→30, <50M→10
  it("should return 100 for AUM >= 5B", () => {
    const etf = makeEntry({}, { aum: 5_000_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(100);
  });

  it("should return 85 for AUM >= 1B", () => {
    const etf = makeEntry({}, { aum: 1_500_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(85);
  });

  it("should return 70 for AUM >= 500M", () => {
    const etf = makeEntry({}, { aum: 600_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(70);
  });

  it("should return 50 for AUM >= 100M", () => {
    const etf = makeEntry({}, { aum: 200_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(50);
  });

  it("should return 30 for AUM >= 50M", () => {
    const etf = makeEntry({}, { aum: 60_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(30);
  });

  it("should return 10 for AUM < 50M", () => {
    const etf = makeEntry({}, { aum: 20_000_000, avgDailyVolume: null });
    expect(scoreLiquidity(etf)).toBe(10);
  });

  it("should add +10 for avgDailyVolume >= 1M", () => {
    // AUM 1B → 85, volume 2M → +10 → 95
    const etf = makeEntry({}, { aum: 1_000_000_000, avgDailyVolume: 2_000_000 });
    expect(scoreLiquidity(etf)).toBe(95);
  });

  it("should apply -15 for avgDailyVolume < 10K", () => {
    // AUM 100M → 50, volume 5K → -15 → 35
    const etf = makeEntry({}, { aum: 100_000_000, avgDailyVolume: 5_000 });
    expect(scoreLiquidity(etf)).toBe(35);
  });
});

describe("scoreMaturity", () => {
  it("should return 100 for ETF >= 10 years old (+ UCITS bonus)", () => {
    // 16 years old, PHYSICAL + UCITS → 100 + 5 + 5 = 110 clamped to 100
    const etf = makeEntry({}, {
      inceptionDate: new Date("2010-01-01"),
      replicationMethod: "PHYSICAL",
      ucitsCompliant: true,
    });
    expect(scoreMaturity(etf)).toBe(100);
  });

  it("should return 80 base for ETF >= 5 years old", () => {
    const etf = makeEntry({}, {
      inceptionDate: new Date("2020-01-01"), // ~6 years
      replicationMethod: "SYNTHETIC",
      ucitsCompliant: false,
    });
    // 80 base, no bonuses
    expect(scoreMaturity(etf)).toBe(80);
  });

  it("should return 60 base for ETF >= 3 years old", () => {
    const etf = makeEntry({}, {
      inceptionDate: new Date("2023-01-01"), // ~3 years
      replicationMethod: "SYNTHETIC",
      ucitsCompliant: false,
    });
    expect(scoreMaturity(etf)).toBe(60);
  });

  it("should return 40 base for ETF >= 1 year old", () => {
    const etf = makeEntry({}, {
      inceptionDate: new Date("2025-01-01"), // ~1.2 years
      replicationMethod: "SYNTHETIC",
      ucitsCompliant: false,
    });
    expect(scoreMaturity(etf)).toBe(40);
  });

  it("should return 15 base for ETF < 1 year old", () => {
    const etf = makeEntry({}, {
      inceptionDate: new Date("2026-01-01"), // ~2 months
      replicationMethod: "SYNTHETIC",
      ucitsCompliant: false,
    });
    expect(scoreMaturity(etf)).toBe(15);
  });

  it("should add +5 for PHYSICAL replication and +5 for UCITS", () => {
    // 3 years old → 60, PHYSICAL +5, UCITS +5 → 70
    const etf = makeEntry({}, {
      inceptionDate: new Date("2023-01-01"),
      replicationMethod: "PHYSICAL",
      ucitsCompliant: true,
    });
    expect(scoreMaturity(etf)).toBe(70);
  });
});

describe("scoreRisk", () => {
  it("should normalize sharpe ratio on [-1, 3] scale", () => {
    // Sharpe = 1.0 → normalized = (1-(-1))/(3-(-1)) = 2/4 = 0.5 → 50
    // Single ETF: vol rank 50, dd rank 50
    // Composite: 50*0.4 + 50*0.3 + 50*0.3 = 50 (renormalized by 1.0)
    const etf = makeEntry({}, {
      sharpeRatio: 1.0,
      volatility1y: 0.15,
      maxDrawdown: -0.15,
    });
    const score = scoreRisk(etf, [etf]);
    // sharpe = 50, vol rank single = 50, dd rank single = 50 → 50
    expect(score).toBe(50);
  });

  it("should apply +5 bonus when sharpe > 1.5", () => {
    // Sharpe = 2.0 → (2+1)/4 = 0.75 → 75
    // Single ETF all components → 75*0.4 + 50*0.3 + 50*0.3 = 30+15+15 = 60
    // bonus +5 → 65
    const etf = makeEntry({}, {
      sharpeRatio: 2.0,
      volatility1y: 0.15,
      maxDrawdown: -0.15,
    });
    const score = scoreRisk(etf, [etf]);
    expect(score).toBe(65);
  });

  it("should apply -10 malus when maxDrawdown < -30%", () => {
    // Sharpe 0.5 → (0.5+1)/4 = 0.375 → 37.5
    // Single ETF: 37.5*0.4 + 50*0.3 + 50*0.3 = 15+15+15 = 45
    // malus -10 for DD < -0.30 → 35
    const etf = makeEntry({}, {
      sharpeRatio: 0.5,
      volatility1y: 0.20,
      maxDrawdown: -0.35,
    });
    const score = scoreRisk(etf, [etf]);
    expect(score).toBe(35);
  });

  it("should return null when all risk data is null", () => {
    const etf = makeEntry({}, {
      sharpeRatio: null,
      volatility1y: null,
      maxDrawdown: null,
    });
    expect(scoreRisk(etf, [etf])).toBeNull();
  });
});

describe("scorePerformance", () => {
  it("should return null when no return data available", () => {
    const etf = makeEntry({}, {
      return1y: null,
      return3y: null,
      return5y: null,
    });
    expect(scorePerformance(etf, [etf])).toBeNull();
  });

  it("should apply +5 bonus when return1yVsIndex > 0", () => {
    // Single ETF → all rank scores = 50, weighted = 50, +5 bonus → 55
    const etf = makeEntry({}, { return1yVsIndex: 0.01 });
    const score = scorePerformance(etf, [etf]);
    expect(score).toBe(55);
  });

  it("should apply -10 malus when return1yVsIndex < -0.02", () => {
    // Single ETF → all rank scores = 50, weighted = 50, -10 malus → 40
    const etf = makeEntry({}, { return1yVsIndex: -0.03 });
    const score = scorePerformance(etf, [etf]);
    expect(score).toBe(40);
  });
});

describe("computeGlobalScore", () => {
  it("should compute weighted average of all axes", () => {
    const axes: EtfAxisScores = {
      costs: 80,
      performance: 70,
      tracking: 90,
      risk: 60,
      liquidity: 50,
      maturity: 40,
    };
    const weights: EtfScoringWeights = {
      costs: 0.25,
      performance: 0.20,
      tracking: 0.20,
      risk: 0.15,
      liquidity: 0.10,
      maturity: 0.10,
    };
    // 80*0.25 + 70*0.20 + 90*0.20 + 60*0.15 + 50*0.10 + 40*0.10
    // = 20 + 14 + 18 + 9 + 5 + 4 = 70
    expect(computeGlobalScore(axes, weights)).toBe(70);
  });

  it("should exclude null axes and renormalize weights", () => {
    const axes: EtfAxisScores = {
      costs: 80,
      performance: null,
      tracking: null,
      risk: null,
      liquidity: 100,
      maturity: 60,
    };
    const weights: EtfScoringWeights = {
      costs: 0.25,
      performance: 0.20,
      tracking: 0.20,
      risk: 0.15,
      liquidity: 0.10,
      maturity: 0.10,
    };
    // Active weights: costs 0.25, liquidity 0.10, maturity 0.10 → sum 0.45
    // Weighted sum: 80*0.25 + 100*0.10 + 60*0.10 = 20 + 10 + 6 = 36
    // Renormalized: 36 / 0.45 = 80
    expect(computeGlobalScore(axes, weights)).toBe(80);
  });
});

describe("scoreEtfGroup", () => {
  it("should rank a group of 3 ETFs correctly by global score", () => {
    // Best: low TER, high perf, excellent tracking, high AUM, old
    const best = makeEntry(
      { id: "best", name: "Best ETF" },
      {
        ter: 0.001,
        return1y: 0.15, return3y: 0.45, return5y: 0.80,
        return1yVsIndex: 0.005,
        trackingError: 0.0003,
        sharpeRatio: 1.2, volatility1y: 0.12, maxDrawdown: -0.10,
        aum: 10_000_000_000,
        inceptionDate: new Date("2010-01-01"),
        replicationMethod: "PHYSICAL",
        ucitsCompliant: true,
      },
    );
    // Medium
    const mid = makeEntry(
      { id: "mid", name: "Mid ETF" },
      {
        ter: 0.003,
        return1y: 0.10, return3y: 0.30, return5y: 0.55,
        return1yVsIndex: -0.005,
        trackingError: 0.0015,
        sharpeRatio: 0.7, volatility1y: 0.16, maxDrawdown: -0.20,
        aum: 2_000_000_000,
        inceptionDate: new Date("2015-01-01"),
        replicationMethod: "PHYSICAL",
        ucitsCompliant: true,
      },
    );
    // Worst: high TER, low perf, poor tracking, low AUM, young
    const worst = makeEntry(
      { id: "worst", name: "Worst ETF" },
      {
        ter: 0.006,
        return1y: 0.05, return3y: 0.15, return5y: 0.30,
        return1yVsIndex: -0.03,
        trackingError: 0.008,
        sharpeRatio: 0.2, volatility1y: 0.22, maxDrawdown: -0.35,
        aum: 40_000_000,
        inceptionDate: new Date("2024-06-01"),
        replicationMethod: "SYNTHETIC",
        ucitsCompliant: false,
      },
    );

    const results = scoreEtfGroup([worst, best, mid]); // intentionally unordered input

    // Should be ranked: best, mid, worst
    expect(results[0]!.productId).toBe("best");
    expect(results[1]!.productId).toBe("mid");
    expect(results[2]!.productId).toBe("worst");

    // Ranks assigned correctly
    expect(results[0]!.rank).toBe(1);
    expect(results[1]!.rank).toBe(2);
    expect(results[2]!.rank).toBe(3);

    // Best should have highest global score
    expect(results[0]!.globalScore).toBeGreaterThan(results[1]!.globalScore);
    expect(results[1]!.globalScore).toBeGreaterThan(results[2]!.globalScore);
  });

  it("should handle single ETF group gracefully", () => {
    const single = makeEntry({ id: "solo" }, {});
    const results = scoreEtfGroup([single]);

    expect(results).toHaveLength(1);
    expect(results[0]!.rank).toBe(1);
    expect(results[0]!.productId).toBe("solo");
    // Single ETF should get a reasonable score (not 0 or NaN)
    expect(results[0]!.globalScore).toBeGreaterThan(0);
    expect(results[0]!.globalScore).toBeLessThanOrEqual(100);
  });

  it("should handle ETFs with all optional data as null", () => {
    const etf = makeEntry(
      { id: "sparse" },
      {
        ter: 0.003,
        transactionCost: null,
        return1y: null,
        return3y: null,
        return5y: null,
        return1yVsIndex: null,
        trackingError: null,
        trackingDifference: null,
        sharpeRatio: null,
        volatility1y: null,
        maxDrawdown: null,
        avgDailyVolume: null,
        aum: 100_000_000,
        inceptionDate: new Date("2020-01-01"),
        replicationMethod: "PHYSICAL",
        ucitsCompliant: true,
      },
    );

    const results = scoreEtfGroup([etf]);

    expect(results).toHaveLength(1);
    // Null axes should be excluded
    expect(results[0]!.scores.performance).toBeNull();
    expect(results[0]!.scores.tracking).toBeNull();
    expect(results[0]!.scores.risk).toBeNull();
    // Non-null axes should have valid scores
    expect(results[0]!.scores.costs).toBeGreaterThanOrEqual(0);
    expect(results[0]!.scores.liquidity).toBeGreaterThanOrEqual(0);
    expect(results[0]!.scores.maturity).toBeGreaterThanOrEqual(0);
    // Global score should still be computed from available axes
    expect(results[0]!.globalScore).toBeGreaterThan(0);
    expect(typeof results[0]!.verdict).toBe("string");
  });

  it("should accept custom weights", () => {
    const etf = makeEntry({ id: "custom" }, {
      ter: 0.001,       // very low → high cost score
      aum: 10_000_000,  // very low → low liquidity score
    });

    // Heavily weight costs → higher global
    const costWeighted = scoreEtfGroup([etf], { costs: 0.90, liquidity: 0.10 });
    // Heavily weight liquidity → lower global
    const liqWeighted = scoreEtfGroup([etf], { costs: 0.10, liquidity: 0.90 });

    expect(costWeighted[0]!.globalScore).toBeGreaterThan(liqWeighted[0]!.globalScore);
  });
});
