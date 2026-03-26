import type {
  AssetAdapter,
  EtfAnalysisResult,
  EtfData,
  Product,
  ValidationResult,
  FieldDefinition,
} from "@repo/core-domain";

import { etfFieldDefinitions } from "./fields";
import { scoreEtfGroup } from "./scoring";

/**
 * Adapter pour l'analyse des ETF.
 *
 * Responsabilités :
 * - Valider les données d'un ETF
 * - Produire un résultat d'analyse structuré (scoring + commentaires)
 */
export class EtfAdapter implements AssetAdapter<EtfData, EtfAnalysisResult> {
  readonly assetClass = "ETF" as const;

  analyze(product: Product, data: EtfData): EtfAnalysisResult {
    const results = scoreEtfGroup([{ product, data }]);
    const scored = results[0]!;
    return {
      productId: product.id,
      scoring: scored,
      comments: [],
      summary: "",
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
}
