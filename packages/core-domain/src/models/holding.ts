import type { DataSource } from "../enums";

/**
 * Position détenue — lien entre un instrument, un support et un portefeuille.
 *
 * Remplace l'ancien `PortfolioAllocation` en ajoutant :
 * - le support de détention (wrapper/contrat)
 * - la quantité en parts (pas juste un poids)
 * - la traçabilité de la saisie
 *
 * Un Holding appartient à un PortfolioVersion, ce qui permet
 * de comparer actuel vs cible.
 */
export interface Holding {
  id: string;
  versionId: string; // PortfolioVersion
  instrumentId: string; // L'instrument financier (ex-Product)
  wrapperId: string | null; // Support de détention (null si non précisé)
  contractId: string | null; // Contrat spécifique (null si CTO simple)
  // Position
  quantity: number | null; // Nombre de parts/unités
  unitPrice: number | null; // Prix unitaire au moment de la saisie
  amount: number; // Montant total en devise du portefeuille
  weight: number; // Poids dans la version (0-1)
  // Contexte
  rationale: string; // Justification du choix
  entryDate: Date | null; // Date d'achat/entrée effective
  source: DataSource; // Comment cette position a été saisie
  // Méta
  addedAt: Date;
  updatedAt: Date;
}
