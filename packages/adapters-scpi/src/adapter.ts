import type {
  AssetAdapter,
  ScpiAnalysisResult,
  ScpiData,
  Product,
  ValidationResult,
  FieldDefinition,
} from "@repo/core-domain";

import { scpiFieldDefinitions } from "./fields";

/**
 * Adapter pour l'analyse des SCPI.
 *
 * Responsabilités :
 * - Valider les données d'une SCPI
 * - Produire un résultat d'analyse structuré
 *
 * Le moteur de calcul complet sera implémenté dans une prochaine itération.
 * Ce scaffold expose le contrat et une implémentation minimale.
 */
export class ScpiAdapter implements AssetAdapter<ScpiData, ScpiAnalysisResult> {
  readonly assetClass = "SCPI" as const;

  analyze(product: Product, data: ScpiData): ScpiAnalysisResult {
    const grossYield = data.distributionRate;
    const netYield = data.distributionRate - data.managementFee;
    const breakEvenYears =
      data.distributionRate > 0 ? data.subscriptionFee / data.distributionRate : Infinity;
    const occupancyScore = this.scoreOccupancy(data.occupancyRate);

    // Scaffold : retourne une structure typée avec calculs minimaux
    // Le moteur de calcul complet sera implémenté en V1
    return {
      productId: product.id,
      yieldAnalysis: {
        grossYield,
        netYield,
        totalReturn: grossYield + data.revaluationRate,
        yieldVsCategory: 0, // À calculer avec données de référence
      },
      costAnalysis: {
        subscriptionFeeImpact: data.subscriptionFee,
        breakEvenYears,
        totalCostYear1: data.subscriptionFee + data.managementFee, // Simplifié
        ongoingCostPerYear: data.managementFee,
      },
      qualityMetrics: {
        occupancyScore,
        diversificationScore: 0, // À calculer
        tenantConcentrationIndex: 0, // À calculer
        sectorConcentrationIndex: 0, // À calculer
      },
      historicalTrend: {
        averageDistribution5y: null, // À calculer avec historique
        distributionTrend: null,
        sharePriceTrend: null,
      },
      comments: [],
    };
  }

  validate(data: Partial<ScpiData>): ValidationResult {
    const errors = [];
    const warnings = [];

    // Vérification des champs requis
    const requiredStringFields: Array<{ key: keyof ScpiData; label: string }> = [
      { key: "managementCompany", label: "Société de gestion" },
      { key: "scpiType", label: "Type de SCPI" },
      { key: "capitalType", label: "Type de capital" },
    ];

    for (const { key, label } of requiredStringFields) {
      if (!data[key]) {
        errors.push({ field: key, message: `${label} est requis`, code: "REQUIRED" });
      }
    }

    const requiredNumberFields: Array<{ key: keyof ScpiData; label: string }> = [
      { key: "sharePrice", label: "Prix de la part" },
      { key: "subscriptionFee", label: "Frais de souscription" },
      { key: "managementFee", label: "Frais de gestion" },
      { key: "distributionRate", label: "Taux de distribution" },
      { key: "revaluationRate", label: "Taux de revalorisation" },
      { key: "occupancyRate", label: "Taux d'occupation" },
      { key: "capitalization", label: "Capitalisation" },
      { key: "nbProperties", label: "Nombre d'immeubles" },
      { key: "nbTenants", label: "Nombre de locataires" },
      { key: "debtRatio", label: "Ratio d'endettement" },
      { key: "minimumSubscription", label: "Souscription minimale" },
    ];

    for (const { key, label } of requiredNumberFields) {
      if (data[key] == null) {
        errors.push({ field: key, message: `${label} est requis`, code: "REQUIRED" });
      }
    }

    const requiredBooleanFields: Array<{ key: keyof ScpiData; label: string }> = [
      { key: "dismembermentAvailable", label: "Démembrement disponible" },
      { key: "lifeInsuranceEligible", label: "Éligible assurance-vie" },
    ];

    for (const { key, label } of requiredBooleanFields) {
      if (data[key] == null) {
        errors.push({ field: key, message: `${label} est requis`, code: "REQUIRED" });
      }
    }

    // Avertissements
    if (data.subscriptionFee != null && data.subscriptionFee > 0.10) {
      warnings.push({
        field: "subscriptionFee",
        message: "Frais de souscription supérieurs à 10% : impact significatif sur le rendement",
      });
    }

    if (data.occupancyRate != null && data.occupancyRate < 0.85) {
      warnings.push({
        field: "occupancyRate",
        message: "Taux d'occupation inférieur à 85% : risque locatif élevé",
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getRequiredFields(): FieldDefinition[] {
    return scpiFieldDefinitions;
  }

  private scoreOccupancy(rate: number): number {
    if (rate > 0.95) return 5;
    if (rate > 0.90) return 4;
    if (rate > 0.85) return 3;
    if (rate > 0.80) return 2;
    return 1;
  }
}
