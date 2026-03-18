import type { ConcentrationAnalysis } from "@repo/core-domain";
import { computeHHI } from "@repo/core-domain";

interface ExposureEntry {
  name: string;
  type: "SECTOR" | "GEOGRAPHY" | "ISSUER" | "ASSET_CLASS";
  weight: number;
}

/**
 * Analyse la concentration du portefeuille.
 *
 * Utilise l'indice Herfindahl-Hirschman (HHI) :
 * - HHI < 0.10 → Faible concentration (bien diversifié)
 * - HHI 0.10–0.18 → Concentration modérée
 * - HHI 0.18–0.25 → Concentration élevée
 * - HHI > 0.25 → Concentration très élevée
 *
 * Ref: US Department of Justice merger guidelines (seuils adaptés au contexte patrimonial)
 */
export function analyzeConcentration(
  exposures: ExposureEntry[],
): ConcentrationAnalysis {
  const weights = exposures.map((e) => e.weight);
  const hhi = computeHHI(weights);

  const hhiRating = rateHHI(hhi);

  const topExposures = [...exposures]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const alerts: string[] = [];

  // Alertes de concentration
  for (const exposure of topExposures) {
    if (exposure.weight > 0.30) {
      alerts.push(
        `Concentration élevée sur ${exposure.name} (${exposure.type}) : ${(exposure.weight * 100).toFixed(1)}% du portefeuille.`,
      );
    }
  }

  if (hhiRating === "VERY_HIGH") {
    alerts.push(
      "L'indice de concentration HHI suggère un portefeuille très concentré. Une diversification pourrait être envisagée.",
    );
  }

  return { hhi, hhiRating, topExposures, alerts };
}

function rateHHI(hhi: number): ConcentrationAnalysis["hhiRating"] {
  if (hhi < 0.10) return "LOW";
  if (hhi < 0.18) return "MODERATE";
  if (hhi < 0.25) return "HIGH";
  return "VERY_HIGH";
}
