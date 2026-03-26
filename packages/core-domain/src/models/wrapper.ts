import type { WrapperType } from "../enums";

/**
 * Support de détention — enveloppe fiscale dans laquelle un instrument est logé.
 * Un même instrument (ex: Amundi MSCI World) peut être détenu dans un PEA,
 * un CTO ou une assurance-vie, avec des implications fiscales différentes.
 */
export interface Wrapper {
  id: string;
  type: WrapperType;
  label: string; // ex: "PEA Boursorama", "AV Linxea Spirit 2"
  provider: string; // ex: "Boursorama", "Linxea"
  accountNumber: string | null;
  // Contraintes de l'enveloppe
  maxInvestment: number | null; // Plafond de versement (150k€ pour PEA)
  eligibleAssetClasses: string[]; // Classes d'actifs éligibles
  // Méta
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

/**
 * Contrat spécifique au sein d'un support.
 * Ex: un contrat Linxea Spirit 2 au sein de l'enveloppe Assurance-Vie.
 * Porte les frais propres au contrat (distincts des frais de l'instrument).
 */
export interface Contract {
  id: string;
  wrapperId: string;
  provider: string; // Assureur ou dépositaire
  contractName: string;
  contractNumber: string | null;
  // Frais du contrat (distincts des frais de l'instrument)
  managementFeePercent: number; // Frais de gestion annuels du contrat
  entryFeePercent: number; // Frais d'entrée
  arbitrageFeePercent: number; // Frais d'arbitrage
  // Contraintes
  minInvestment: number | null;
  availableFundsCount: number | null; // Nb d'UC disponibles
  // Méta
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}
