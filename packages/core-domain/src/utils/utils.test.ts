import { describe, expect, it } from "vitest";

import { computeHHI, daysBetween, formatAmount, formatPercent, isValidIsin, roundTo } from "./index";

describe("roundTo", () => {
  it("arrondit à 2 décimales", () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
  });

  it("arrondit à 4 décimales", () => {
    expect(roundTo(0.00345, 4)).toBe(0.0035);
  });

  it("arrondit à 0 décimales", () => {
    expect(roundTo(99.5, 0)).toBe(100);
  });
});

describe("formatPercent", () => {
  it("formate un taux décimal en pourcentage", () => {
    expect(formatPercent(0.0345)).toBe("3.45%");
  });

  it("formate avec le nombre de décimales spécifié", () => {
    expect(formatPercent(0.03456, 1)).toBe("3.5%");
  });
});

describe("formatAmount", () => {
  it("formate un montant en euros", () => {
    const result = formatAmount(1234567.89);
    // Le format exact dépend du locale, on vérifie juste la présence des éléments clés
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("567");
  });
});

describe("computeHHI", () => {
  it("retourne 1 pour un portefeuille totalement concentré", () => {
    // Source: Un seul actif à 100% → HHI = 1² = 1
    expect(computeHHI([1])).toBe(1);
  });

  it("retourne 0.5 pour deux actifs à parts égales", () => {
    // Source: 2 actifs à 50% → HHI = 0.5² + 0.5² = 0.5
    expect(computeHHI([0.5, 0.5])).toBe(0.5);
  });

  it("retourne ~0.25 pour quatre actifs à parts égales", () => {
    // Source: 4 actifs à 25% → HHI = 4 × 0.25² = 0.25
    expect(computeHHI([0.25, 0.25, 0.25, 0.25])).toBeCloseTo(0.25);
  });

  it("retourne 0 pour un portefeuille vide", () => {
    expect(computeHHI([])).toBe(0);
  });
});

describe("isValidIsin", () => {
  it("valide un ISIN correct (FR)", () => {
    expect(isValidIsin("FR0010296061")).toBe(true);
  });

  it("valide un ISIN correct (IE)", () => {
    expect(isValidIsin("IE00B4L5Y983")).toBe(true);
  });

  it("rejette un ISIN trop court", () => {
    expect(isValidIsin("FR001029")).toBe(false);
  });

  it("rejette un ISIN avec des caractères invalides", () => {
    expect(isValidIsin("FR001029606!")).toBe(false);
  });
});

describe("daysBetween", () => {
  it("calcule le nombre de jours entre deux dates", () => {
    const from = new Date("2024-01-01");
    const to = new Date("2024-01-31");
    expect(daysBetween(from, to)).toBe(30);
  });

  it("retourne 0 pour la même date", () => {
    const date = new Date("2024-06-15");
    expect(daysBetween(date, date)).toBe(0);
  });
});
