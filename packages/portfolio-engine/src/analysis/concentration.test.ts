import { describe, expect, it } from "vitest";

import { analyzeConcentration } from "./concentration";

describe("analyzeConcentration", () => {
  it("détecte une faible concentration (4 expositions égales)", () => {
    const exposures = [
      { name: "Actions", type: "ASSET_CLASS" as const, weight: 0.25 },
      { name: "Obligations", type: "ASSET_CLASS" as const, weight: 0.25 },
      { name: "Immobilier", type: "ASSET_CLASS" as const, weight: 0.25 },
      { name: "Structurés", type: "ASSET_CLASS" as const, weight: 0.25 },
    ];

    const result = analyzeConcentration(exposures);

    // HHI = 4 × 0.25² = 0.25 → HIGH (seuil > 0.18)
    expect(result.hhi).toBeCloseTo(0.25);
    expect(result.hhiRating).toBe("HIGH");
  });

  it("détecte une très forte concentration (1 actif à 80%)", () => {
    const exposures = [
      { name: "Actions", type: "ASSET_CLASS" as const, weight: 0.80 },
      { name: "Obligations", type: "ASSET_CLASS" as const, weight: 0.10 },
      { name: "Immobilier", type: "ASSET_CLASS" as const, weight: 0.10 },
    ];

    const result = analyzeConcentration(exposures);

    // HHI = 0.64 + 0.01 + 0.01 = 0.66
    expect(result.hhi).toBeCloseTo(0.66);
    expect(result.hhiRating).toBe("VERY_HIGH");
  });

  it("génère une alerte si une exposition dépasse 30%", () => {
    const exposures = [
      { name: "France", type: "GEOGRAPHY" as const, weight: 0.45 },
      { name: "Allemagne", type: "GEOGRAPHY" as const, weight: 0.30 },
      { name: "Autres", type: "GEOGRAPHY" as const, weight: 0.25 },
    ];

    const result = analyzeConcentration(exposures);

    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts[0]).toContain("France");
  });

  it("retourne les top expositions triées par poids décroissant", () => {
    const exposures = [
      { name: "B", type: "SECTOR" as const, weight: 0.20 },
      { name: "A", type: "SECTOR" as const, weight: 0.50 },
      { name: "C", type: "SECTOR" as const, weight: 0.30 },
    ];

    const result = analyzeConcentration(exposures);

    expect(result.topExposures[0]?.name).toBe("A");
    expect(result.topExposures[1]?.name).toBe("C");
    expect(result.topExposures[2]?.name).toBe("B");
  });

  it("détecte un portefeuille bien diversifié (10 expositions)", () => {
    const exposures = Array.from({ length: 10 }, (_, i) => ({
      name: `Secteur ${i + 1}`,
      type: "SECTOR" as const,
      weight: 0.10,
    }));

    const result = analyzeConcentration(exposures);

    // HHI = 10 × 0.10² = 0.10 → MODERATE
    expect(result.hhi).toBeCloseTo(0.10);
    expect(result.hhiRating).toBe("MODERATE");
  });
});
