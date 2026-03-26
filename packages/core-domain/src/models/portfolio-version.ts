import type { VersionType } from "../enums";

/**
 * Version d'un portefeuille — permet la comparaison actuel vs cible.
 *
 * Chaque Portfolio a au moins une version CURRENT.
 * On peut créer des versions TARGET pour proposer une réallocation,
 * ou SCENARIO pour simuler un choc de marché.
 *
 * Les Holdings sont rattachés à une version, pas directement au portfolio.
 */
export interface PortfolioVersion {
  id: string;
  portfolioId: string;
  versionType: VersionType;
  label: string; // ex: "Portefeuille actuel", "Proposition mars 2026"
  totalAmount: number; // Montant total de la version
  isActive: boolean; // Une seule version CURRENT active à la fois
  // Méta
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}
