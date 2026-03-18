import type {
  AssetAdapter,
  BondAnalysisResult,
  BondData,
  Product,
  ValidationResult,
  FieldDefinition,
} from "@repo/core-domain";

import { bondFieldDefinitions } from "./fields";

/**
 * Adapter pour l'analyse des obligations.
 *
 * Responsabilités :
 * - Valider les données d'une obligation
 * - Produire un résultat d'analyse structuré
 *
 * Le moteur de calcul complet sera implémenté dans une prochaine itération.
 * Ce scaffold expose le contrat et une implémentation minimale.
 */
export class BondAdapter implements AssetAdapter<BondData, BondAnalysisResult> {
  readonly assetClass = "BOND" as const;

  analyze(product: Product, data: BondData): BondAnalysisResult {
    // Scaffold : calcul YTM simplifié (approximation linéaire)
    // Le moteur de calcul complet sera implémenté en V1
    const yearsToMaturity = Math.max(
      (new Date(data.maturityDate).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000),
      0.01,
    );

    const coupon = Number(data.couponRate) * Number(data.nominalValue);
    const capitalGain = (Number(data.nominalValue) - Number(data.currentPrice) / 100 * Number(data.nominalValue));
    const avgPrice = (Number(data.currentPrice) / 100 * Number(data.nominalValue) + Number(data.nominalValue)) / 2;
    const ytmApprox = avgPrice > 0 ? (coupon + capitalGain / yearsToMaturity) / avgPrice : 0;

    const currentYield = Number(data.currentPrice) > 0
      ? Number(data.couponRate) / (Number(data.currentPrice) / 100)
      : 0;

    const creditCategory = this.categorizeCreditRating(data.creditRating);

    return {
      productId: product.id,
      yieldMetrics: {
        ytm: ytmApprox,
        currentYield,
        yieldToCall: null, // À calculer si callable
        spreadVsRiskFree: 0, // À calculer
      },
      sensitivityMetrics: {
        duration: data.duration ?? 0,
        modifiedDuration: data.modifiedDuration ?? 0,
        convexity: data.convexity ?? 0,
        priceImpactBps100: data.modifiedDuration != null ? data.modifiedDuration * 0.01 : 0,
      },
      creditAssessment: {
        rating: data.creditRating,
        category: creditCategory,
        defaultProbability5y: null, // À calculer
      },
      rateScenarios: [], // À implémenter
      cashflows: [], // À implémenter
      comments: [],
    };
  }

  validate(data: Partial<BondData>): ValidationResult {
    const errors = [];
    const warnings = [];

    // Vérification des champs requis
    if (!data.issuer) {
      errors.push({ field: "issuer", message: "L'émetteur est requis", code: "REQUIRED" });
    }

    if (!data.issuerType) {
      errors.push({ field: "issuerType", message: "Le type d'émetteur est requis", code: "REQUIRED" });
    }

    if (data.couponRate == null) {
      errors.push({ field: "couponRate", message: "Le taux de coupon est requis", code: "REQUIRED" });
    }

    if (!data.couponFrequency) {
      errors.push({ field: "couponFrequency", message: "La fréquence du coupon est requise", code: "REQUIRED" });
    }

    if (!data.maturityDate) {
      errors.push({ field: "maturityDate", message: "La date de maturité est requise", code: "REQUIRED" });
    }

    if (!data.issueDate) {
      errors.push({ field: "issueDate", message: "La date d'émission est requise", code: "REQUIRED" });
    }

    if (data.nominalValue == null) {
      errors.push({ field: "nominalValue", message: "La valeur nominale est requise", code: "REQUIRED" });
    }

    if (data.purchasePrice == null) {
      errors.push({ field: "purchasePrice", message: "Le prix d'achat est requis", code: "REQUIRED" });
    }

    if (data.currentPrice == null) {
      errors.push({ field: "currentPrice", message: "Le prix actuel est requis", code: "REQUIRED" });
    }

    if (!data.creditRating) {
      errors.push({ field: "creditRating", message: "La notation crédit est requise", code: "REQUIRED" });
    }

    if (!data.ratingAgency) {
      errors.push({ field: "ratingAgency", message: "L'agence de notation est requise", code: "REQUIRED" });
    }

    if (!data.seniority) {
      errors.push({ field: "seniority", message: "La séniorité est requise", code: "REQUIRED" });
    }

    if (data.callable == null) {
      errors.push({ field: "callable", message: "Le caractère callable est requis", code: "REQUIRED" });
    }

    // Validation de la plage du taux de coupon
    if (data.couponRate != null && (Number(data.couponRate) < 0 || Number(data.couponRate) > 0.20)) {
      errors.push({ field: "couponRate", message: "Le taux de coupon doit être entre 0% et 20%", code: "OUT_OF_RANGE" });
    }

    // Avertissement si callable sans callDate
    if (data.callable === true && !data.callDate) {
      warnings.push({ field: "callDate", message: "Obligation callable sans date de call renseignée" });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getRequiredFields(): FieldDefinition[] {
    return bondFieldDefinitions;
  }

  private categorizeCreditRating(rating: string): "INVESTMENT_GRADE" | "HIGH_YIELD" | "NOT_RATED" {
    if (!rating || rating === "NR" || rating === "N/A") {
      return "NOT_RATED";
    }

    const upperRating = rating.toUpperCase();

    // S&P / Fitch scale: AAA, AA+, AA, AA-, A+, A, A-, BBB+, BBB, BBB- = IG
    // Moody's scale: Aaa, Aa1-Aa3, A1-A3, Baa1-Baa3 = IG
    const investmentGradePatterns = [
      /^AAA/,
      /^AA/,
      /^A[^A]/,
      /^A$/,
      /^BBB/,
      /^AAA/,
      /^AA/,
      /^BAA/,
    ];

    for (const pattern of investmentGradePatterns) {
      if (pattern.test(upperRating)) {
        return "INVESTMENT_GRADE";
      }
    }

    return "HIGH_YIELD";
  }
}
