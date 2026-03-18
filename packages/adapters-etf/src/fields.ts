import type { FieldDefinition } from "@repo/core-domain";

/**
 * Définition des champs de saisie pour un ETF.
 * Utilisé par le formulaire de saisie et la validation.
 */
export const etfFieldDefinitions: FieldDefinition[] = [
  { key: "indexTracked", label: "Indice répliqué", type: "string", required: true },
  {
    key: "replicationMethod",
    label: "Méthode de réplication",
    type: "enum",
    required: true,
    enumValues: ["PHYSICAL", "SYNTHETIC", "SAMPLING"],
  },
  { key: "ter", label: "TER (Total Expense Ratio)", type: "number", required: true, unit: "%", min: 0, max: 0.05 },
  { key: "aum", label: "Encours sous gestion", type: "number", required: true, unit: "€", min: 0 },
  {
    key: "distributionPolicy",
    label: "Politique de distribution",
    type: "enum",
    required: true,
    enumValues: ["CAPITALIZING", "DISTRIBUTING"],
  },
  { key: "domicile", label: "Domicile", type: "string", required: true },
  { key: "inceptionDate", label: "Date de création", type: "date", required: true },
  { key: "trackingError", label: "Tracking error", type: "number", required: false, unit: "%", min: 0, max: 0.1 },
  { key: "volatility1y", label: "Volatilité 1 an", type: "number", required: false, unit: "%", min: 0, max: 1 },
  { key: "volatility3y", label: "Volatilité 3 ans", type: "number", required: false, unit: "%", min: 0, max: 1 },
  { key: "returnYtd", label: "Performance YTD", type: "number", required: false, unit: "%" },
  { key: "return1y", label: "Performance 1 an", type: "number", required: false, unit: "%" },
  { key: "return3y", label: "Performance 3 ans", type: "number", required: false, unit: "%" },
  { key: "return5y", label: "Performance 5 ans", type: "number", required: false, unit: "%" },
  { key: "sharpeRatio", label: "Ratio de Sharpe", type: "number", required: false, min: -5, max: 10 },
  { key: "peaEligible", label: "Éligible PEA", type: "boolean", required: true },
  { key: "sriLabel", label: "Label ISR", type: "string", required: false },
];
