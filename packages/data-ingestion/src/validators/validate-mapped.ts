import type { FieldDefinition, MappedProduct, ValidationResult } from "@repo/core-domain";

/**
 * Valide un ensemble de produits mappés contre les définitions de champs.
 * Produit des erreurs (bloquantes) et des warnings (informatifs).
 */
export function validateMappedProducts(
  products: MappedProduct[],
  fieldDefinitions: FieldDefinition[],
): ValidationResult {
  const errors = [];
  const warnings = [];

  for (const product of products) {
    for (const field of fieldDefinitions) {
      const value = product.data[field.key];

      // Champ requis manquant
      if (field.required && (value === undefined || value === null || value === "")) {
        errors.push({
          field: field.key,
          message: `Ligne ${product.rowIndex} : le champ "${field.label}" est requis`,
          code: "REQUIRED",
        });
        continue;
      }

      if (value === undefined || value === null || value === "") continue;

      // Validation numérique
      if (field.type === "number") {
        const numVal = Number(value);
        if (isNaN(numVal)) {
          errors.push({
            field: field.key,
            message: `Ligne ${product.rowIndex} : "${field.label}" doit être un nombre`,
            code: "INVALID_TYPE",
          });
        } else {
          if (field.min !== undefined && numVal < field.min) {
            errors.push({
              field: field.key,
              message: `Ligne ${product.rowIndex} : "${field.label}" doit être ≥ ${field.min}`,
              code: "OUT_OF_RANGE",
            });
          }
          if (field.max !== undefined && numVal > field.max) {
            errors.push({
              field: field.key,
              message: `Ligne ${product.rowIndex} : "${field.label}" doit être ≤ ${field.max}`,
              code: "OUT_OF_RANGE",
            });
          }
        }
      }

      // Validation enum
      if (field.type === "enum" && field.enumValues) {
        if (!field.enumValues.includes(String(value))) {
          errors.push({
            field: field.key,
            message: `Ligne ${product.rowIndex} : "${field.label}" doit être l'un de : ${field.enumValues.join(", ")}`,
            code: "INVALID_ENUM",
          });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
