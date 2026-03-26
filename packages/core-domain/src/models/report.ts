import type { ReportStatus } from "../enums";

/**
 * Rapport généré — remplace et étend l'ancien SharedReport.
 *
 * Un rapport est lié à une version de portefeuille et capture
 * un snapshot complet de l'analyse à un instant T.
 */
export interface Report {
  id: string;
  portfolioVersionId: string;
  title: string;
  status: ReportStatus;
  // Contenu
  generatedAt: Date | null;
  snapshotData: ReportSnapshot | null; // Données figées au moment de la génération
  pdfUrl: string | null; // URL du PDF stocké
  // Partage
  shareToken: string | null; // Token cryptographique pour lien de partage
  shareExpiresAt: Date | null;
  accessedCount: number;
  // Branding
  cabinetName: string;
  logoUrl: string | null;
  // Méta
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Snapshot figé des données au moment de la génération du rapport.
 * Permet de reconsulter un rapport même si les données ont évolué depuis.
 */
export interface ReportSnapshot {
  generatedAt: Date;
  portfolioName: string;
  clientName: string;
  totalAmount: number;
  versionType: string;
  holdingsCount: number;
  // Les résultats d'analyse sont sérialisés en JSON
  analysisResult: Record<string, unknown>;
}
