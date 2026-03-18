import type {
  AssetAdapter,
  EtfAnalysisResult,
  EtfData,
  Product,
  ValidationResult,
  FieldDefinition,
} from "@repo/core-domain";

import { etfFieldDefinitions } from "./fields";

/**
 * Adapter pour l'analyse des ETF.
 *
 * Responsabilités :
 * - Valider les données d'un ETF
 * - Produire un résultat d'analyse structuré
 *
 * Le moteur de calcul complet sera implémenté dans une prochaine itération.
 * Ce scaffold expose le contrat et une implémentation minimale.
 */
export class EtfAdapter implements AssetAdapter<EtfData, EtfAnalysisResult> {
  readonly assetClass = "ETF" as const;

  analyze(product: Product, data: EtfData): EtfAnalysisResult {
    // Scaffold : retourne une structure vide mais typée
    // Le moteur de calcul sera implémenté en V1
    return {
      productId: product.id,
      totalCost: Number(data.ter),
      performanceScore: null,
      trackingQuality: data.trackingError != null
        ? {
            trackingError: Number(data.trackingError),
            trackingDifference: 0, // À calculer
            rating: this.rateTrackingError(Number(data.trackingError)),
          }
        : null,
      riskMetrics: data.volatility1y != null
        ? {
            volatility: Number(data.volatility1y),
            maxDrawdown: null,
            sharpeRatio: data.sharpeRatio != null ? Number(data.sharpeRatio) : null,
            sortinoRatio: null,
          }
        : null,
      liquidityScore: this.assessLiquidity(Number(data.aum)),
      comments: [],
    };
  }

  validate(data: Partial<EtfData>): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!data.indexTracked) {
      errors.push({ field: "indexTracked", message: "L'indice répliqué est requis", code: "REQUIRED" });
    }

    if (data.ter != null && (Number(data.ter) < 0 || Number(data.ter) > 0.05)) {
      errors.push({ field: "ter", message: "Le TER doit être entre 0% et 5%", code: "OUT_OF_RANGE" });
    }

    if (data.aum != null && Number(data.aum) < 50_000_000) {
      warnings.push({ field: "aum", message: "Encours inférieur à 50M€ : risque de liquidité" });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getRequiredFields(): FieldDefinition[] {
    return etfFieldDefinitions;
  }

  private rateTrackingError(te: number): "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" {
    if (te <= 0.001) return "EXCELLENT";
    if (te <= 0.005) return "GOOD";
    if (te <= 0.01) return "AVERAGE";
    return "POOR";
  }

  private assessLiquidity(aum: number): number {
    if (aum >= 1_000_000_000) return 5;
    if (aum >= 500_000_000) return 4;
    if (aum >= 100_000_000) return 3;
    if (aum >= 50_000_000) return 2;
    return 1;
  }
}
