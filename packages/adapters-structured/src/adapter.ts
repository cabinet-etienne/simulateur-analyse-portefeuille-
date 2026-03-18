import type {
  AssetAdapter,
  FieldDefinition,
  Product,
  StructuredAnalysisResult,
  StructuredProductData,
  ValidationResult,
} from "@repo/core-domain";

import { structuredFieldDefinitions } from "./fields";

/**
 * Adapter pour l'analyse des produits structurés.
 *
 * Responsabilités :
 * - Valider les données d'un produit structuré
 * - Produire un résultat d'analyse structuré
 * - Calculer un score de complexité
 *
 * Le moteur de calcul complet sera implémenté dans une prochaine itération.
 * Ce scaffold expose le contrat et une implémentation minimale.
 */
export class StructuredProductAdapter
  implements AssetAdapter<StructuredProductData, StructuredAnalysisResult>
{
  readonly assetClass = "STRUCTURED" as const;

  analyze(product: Product, data: StructuredProductData): StructuredAnalysisResult {
    // Scaffold : retourne une structure typée avec calcul du score de complexité
    const complexityScore = this.computeComplexityScore(data);

    return {
      productId: product.id,
      payoffProfile: [], // À calculer en V1
      barrierAnalysis: {
        level: data.barrierLevel,
        type: data.barrierType,
        historicalBreachCount: null,
        historicalPeriodYears: null,
        distanceFromCurrent: 0, // À calculer avec données de marché
      },
      costBreakdown: {
        entryFees: data.feesEntry,
        ongoingFees: data.feesOngoing,
        estimatedStructurerMargin: null,
        totalFirstYear: data.feesEntry + data.feesOngoing,
      },
      complexityScore,
      comments: [],
    };
  }

  validate(data: Partial<StructuredProductData>): ValidationResult {
    const errors = [];
    const warnings = [];

    // Vérification des champs requis
    if (!data.issuer) {
      errors.push({ field: "issuer", message: "L'émetteur est requis", code: "REQUIRED" });
    }

    if (!data.underlying) {
      errors.push({ field: "underlying", message: "Le sous-jacent est requis", code: "REQUIRED" });
    }

    if (!data.underlyingType) {
      errors.push({ field: "underlyingType", message: "Le type de sous-jacent est requis", code: "REQUIRED" });
    }

    if (!data.productSubtype) {
      errors.push({ field: "productSubtype", message: "Le type de produit est requis", code: "REQUIRED" });
    }

    if (!data.strikeDate) {
      errors.push({ field: "strikeDate", message: "La date de strike est requise", code: "REQUIRED" });
    }

    if (!data.maturityDate) {
      errors.push({ field: "maturityDate", message: "La date de maturité est requise", code: "REQUIRED" });
    }

    if (data.capitalProtection == null) {
      errors.push({ field: "capitalProtection", message: "La protection du capital est requise", code: "REQUIRED" });
    }

    if (data.barrierLevel == null) {
      errors.push({ field: "barrierLevel", message: "Le niveau de barrière est requis", code: "REQUIRED" });
    }

    if (!data.barrierType) {
      errors.push({ field: "barrierType", message: "Le type de barrière est requis", code: "REQUIRED" });
    }

    if (data.couponRate == null) {
      errors.push({ field: "couponRate", message: "Le taux de coupon est requis", code: "REQUIRED" });
    }

    if (!data.couponType) {
      errors.push({ field: "couponType", message: "Le type de coupon est requis", code: "REQUIRED" });
    }

    if (data.couponTriggerLevel == null) {
      errors.push({ field: "couponTriggerLevel", message: "Le niveau de déclenchement du coupon est requis", code: "REQUIRED" });
    }

    if (data.feesEntry == null) {
      errors.push({ field: "feesEntry", message: "Les frais d'entrée sont requis", code: "REQUIRED" });
    }

    if (data.feesOngoing == null) {
      errors.push({ field: "feesOngoing", message: "Les frais courants sont requis", code: "REQUIRED" });
    }

    if (!data.payoffDescription) {
      errors.push({ field: "payoffDescription", message: "La description du payoff est requise", code: "REQUIRED" });
    }

    // Avertissement : pas de protection du capital et barrière basse
    if (data.capitalProtection === 0 && data.barrierLevel != null && data.barrierLevel < 0.5) {
      warnings.push({
        field: "barrierLevel",
        message: "Aucune protection du capital et barrière inférieure à 50% : risque de perte en capital élevé",
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getRequiredFields(): FieldDefinition[] {
    return structuredFieldDefinitions;
  }

  /**
   * Calcule un score de complexité du produit structuré (0 à 5).
   *
   * Critères :
   * - Autocall : +1
   * - Coupon mémoire (MEMORY) : +1
   * - Coupon conditionnel (CONDITIONAL) : +1
   * - Présence d'une barrière (barrierLevel < 1) : +1
   * - Barrière américaine ou daily close : +1
   */
  private computeComplexityScore(data: StructuredProductData): number {
    let score = 0;

    if (data.productSubtype === "AUTOCALL") {
      score += 1;
    }

    if (data.couponType === "MEMORY") {
      score += 1;
    }

    if (data.couponType === "CONDITIONAL") {
      score += 1;
    }

    if (data.barrierLevel < 1) {
      score += 1;
    }

    if (data.barrierType === "AMERICAN" || data.barrierType === "DAILY_CLOSE") {
      score += 1;
    }

    return Math.min(score, 5);
  }
}
