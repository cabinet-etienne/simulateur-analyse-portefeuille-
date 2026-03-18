import type { FieldDefinition } from "@repo/core-domain";

/**
 * Définition des champs de saisie pour un produit structuré.
 * Utilisé par le formulaire de saisie et la validation.
 */
export const structuredFieldDefinitions: FieldDefinition[] = [
  { key: "issuer", label: "Émetteur", type: "string", required: true },
  { key: "underlying", label: "Sous-jacent", type: "string", required: true },
  {
    key: "underlyingType",
    label: "Type de sous-jacent",
    type: "enum",
    required: true,
    enumValues: ["INDEX", "STOCK", "BASKET", "RATE", "FUND"],
  },
  {
    key: "productSubtype",
    label: "Type de produit",
    type: "enum",
    required: true,
    enumValues: ["AUTOCALL", "PHOENIX", "REVERSE_CONVERTIBLE", "CAPITAL_PROTECTED", "OTHER"],
  },
  { key: "strikeDate", label: "Date de strike", type: "date", required: true },
  { key: "maturityDate", label: "Date de maturité", type: "date", required: true },
  { key: "capitalProtection", label: "Protection du capital", type: "number", required: true, unit: "%", min: 0, max: 1 },
  { key: "barrierLevel", label: "Niveau de barrière", type: "number", required: true, unit: "%", min: 0, max: 1.5 },
  {
    key: "barrierType",
    label: "Type de barrière",
    type: "enum",
    required: true,
    enumValues: ["EUROPEAN", "AMERICAN", "DAILY_CLOSE"],
  },
  { key: "couponRate", label: "Taux de coupon", type: "number", required: true, unit: "%", min: 0, max: 0.25 },
  {
    key: "couponType",
    label: "Type de coupon",
    type: "enum",
    required: true,
    enumValues: ["GUARANTEED", "CONDITIONAL", "MEMORY"],
  },
  { key: "couponTriggerLevel", label: "Niveau de déclenchement du coupon", type: "number", required: true, unit: "%", min: 0, max: 1.5 },
  { key: "feesEntry", label: "Frais d'entrée", type: "number", required: true, unit: "%", min: 0, max: 0.10 },
  { key: "feesOngoing", label: "Frais courants", type: "number", required: true, unit: "%", min: 0, max: 0.05 },
  { key: "payoffDescription", label: "Description du payoff", type: "string", required: true },
];
