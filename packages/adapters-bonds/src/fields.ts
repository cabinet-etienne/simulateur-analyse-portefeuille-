import type { FieldDefinition } from "@repo/core-domain";

/**
 * Définition des champs de saisie pour une obligation.
 * Utilisé par le formulaire de saisie et la validation.
 */
export const bondFieldDefinitions: FieldDefinition[] = [
  { key: "issuer", label: "Émetteur", type: "string", required: true },
  {
    key: "issuerType",
    label: "Type d'émetteur",
    type: "enum",
    required: true,
    enumValues: ["SOVEREIGN", "CORPORATE", "FINANCIAL", "SUPRANATIONAL"],
  },
  { key: "couponRate", label: "Taux de coupon", type: "number", required: true, unit: "%", min: 0, max: 0.20 },
  {
    key: "couponFrequency",
    label: "Fréquence du coupon",
    type: "enum",
    required: true,
    enumValues: ["ANNUAL", "SEMI_ANNUAL", "QUARTERLY", "ZERO_COUPON"],
  },
  { key: "maturityDate", label: "Date de maturité", type: "date", required: true },
  { key: "issueDate", label: "Date d'émission", type: "date", required: true },
  { key: "nominalValue", label: "Valeur nominale", type: "number", required: true, unit: "€", min: 0 },
  { key: "purchasePrice", label: "Prix d'achat", type: "number", required: true, unit: "%", min: 0, max: 200 },
  { key: "currentPrice", label: "Prix actuel", type: "number", required: true, unit: "%", min: 0, max: 200 },
  { key: "creditRating", label: "Notation crédit", type: "string", required: true },
  {
    key: "ratingAgency",
    label: "Agence de notation",
    type: "enum",
    required: true,
    enumValues: ["SP", "MOODYS", "FITCH"],
  },
  {
    key: "seniority",
    label: "Séniorité",
    type: "enum",
    required: true,
    enumValues: ["SENIOR", "SUBORDINATED", "HYBRID"],
  },
  { key: "callable", label: "Callable", type: "boolean", required: true },
];
