import { describe, expect, it } from "vitest";
import type { EtfData, Product } from "@repo/core-domain";

import { EtfAdapter } from "./adapter";

const adapter = new EtfAdapter();

const mockProduct: Product = {
  id: "test-etf-001",
  type: "ETF",
  name: "Test MSCI World ETF",
  isin: "IE00B4L5Y983",
  currency: "EUR",
  status: "VALIDATED",
  createdBy: "user-001",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  dataSources: {},
  tags: [],
};

const mockData: EtfData = {
  productId: "test-etf-001",
  indexTracked: "MSCI World",
  replicationMethod: "PHYSICAL",
  ter: 0.002,
  aum: 500_000_000,
  distributionPolicy: "CAPITALIZING",
  domicile: "Ireland",
  inceptionDate: new Date("2009-09-25"),
  trackingError: 0.003,
  volatility1y: 0.15,
  volatility3y: 0.14,
  returnYtd: 0.08,
  return1y: 0.12,
  return3y: 0.32,
  return5y: 0.55,
  sharpeRatio: 0.85,
  sectorExposure: { technology: 0.22, financials: 0.15, healthcare: 0.12 },
  geoExposure: { "united-states": 0.65, japan: 0.06, "united-kingdom": 0.04 },
  topHoldings: [
    { name: "Apple", weight: 0.045 },
    { name: "Microsoft", weight: 0.04 },
  ],
  peaEligible: false,
  sriLabel: null,
};

describe("EtfAdapter", () => {
  it("a la bonne classe d'actifs", () => {
    expect(adapter.assetClass).toBe("ETF");
  });

  describe("analyze", () => {
    it("retourne un résultat structuré", () => {
      const result = adapter.analyze(mockProduct, mockData);

      expect(result.productId).toBe("test-etf-001");
      expect(result.totalCost).toBe(0.002);
    });

    it("évalue correctement la tracking quality", () => {
      const result = adapter.analyze(mockProduct, mockData);

      expect(result.trackingQuality).not.toBeNull();
      expect(result.trackingQuality?.rating).toBe("GOOD");
    });

    it("évalue correctement la liquidité (AUM 500M)", () => {
      const result = adapter.analyze(mockProduct, mockData);

      // 500M → score 4
      expect(result.liquidityScore).toBe(4);
    });

    it("gère les données manquantes sans crash", () => {
      const partialData: EtfData = {
        ...mockData,
        trackingError: null,
        volatility1y: null,
        sharpeRatio: null,
      };
      const result = adapter.analyze(mockProduct, partialData);

      expect(result.trackingQuality).toBeNull();
      expect(result.riskMetrics).toBeNull();
    });
  });

  describe("validate", () => {
    it("valide des données complètes", () => {
      const result = adapter.validate(mockData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("génère une erreur si l'indice est manquant", () => {
      const result = adapter.validate({ ...mockData, indexTracked: "" });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "indexTracked")).toBe(true);
    });

    it("avertit si l'AUM est faible", () => {
      const result = adapter.validate({ ...mockData, aum: 30_000_000 });

      expect(result.warnings.some((w) => w.field === "aum")).toBe(true);
    });
  });

  describe("getRequiredFields", () => {
    it("retourne les définitions de champs", () => {
      const fields = adapter.getRequiredFields();

      expect(fields.length).toBeGreaterThan(0);
      expect(fields.some((f) => f.key === "ter")).toBe(true);
    });
  });
});
