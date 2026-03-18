import type { FieldDefinition } from "@repo/core-domain";

/**
 * Définition des champs de saisie pour une SCPI.
 * Utilisé par le formulaire de saisie et la validation.
 */
export const scpiFieldDefinitions: FieldDefinition[] = [
  { key: "managementCompany", label: "Société de gestion", type: "string", required: true },
  {
    key: "scpiType",
    label: "Type de SCPI",
    type: "enum",
    required: true,
    enumValues: ["YIELD", "FISCAL", "VALORISATION", "DIVERSIFIED"],
  },
  {
    key: "capitalType",
    label: "Type de capital",
    type: "enum",
    required: true,
    enumValues: ["FIXED", "VARIABLE"],
  },
  { key: "sharePrice", label: "Prix de la part", type: "number", required: true, unit: "€", min: 0 },
  { key: "subscriptionFee", label: "Frais de souscription", type: "number", required: true, unit: "%", min: 0, max: 0.15 },
  { key: "managementFee", label: "Frais de gestion", type: "number", required: true, unit: "%", min: 0, max: 0.03 },
  { key: "withdrawalFee", label: "Frais de retrait", type: "number", required: false, unit: "%", min: 0, max: 0.10 },
  { key: "distributionRate", label: "Taux de distribution", type: "number", required: true, unit: "%", min: 0, max: 0.15 },
  { key: "revaluationRate", label: "Taux de revalorisation", type: "number", required: true, unit: "%" },
  { key: "occupancyRate", label: "Taux d'occupation", type: "number", required: true, unit: "%", min: 0, max: 1 },
  { key: "capitalization", label: "Capitalisation", type: "number", required: true, unit: "€", min: 0 },
  { key: "nbProperties", label: "Nombre d'immeubles", type: "number", required: true, min: 0 },
  { key: "nbTenants", label: "Nombre de locataires", type: "number", required: true, min: 0 },
  { key: "debtRatio", label: "Ratio d'endettement", type: "number", required: true, unit: "%", min: 0, max: 1 },
  { key: "minimumSubscription", label: "Souscription minimale", type: "number", required: true, unit: "€", min: 0 },
  { key: "dismembermentAvailable", label: "Démembrement disponible", type: "boolean", required: true },
  { key: "lifeInsuranceEligible", label: "Éligible assurance-vie", type: "boolean", required: true },
];
