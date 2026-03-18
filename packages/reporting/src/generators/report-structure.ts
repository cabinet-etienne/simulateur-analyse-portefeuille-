import type { ReportData } from "@repo/core-domain";

/**
 * Structure du rapport client PDF.
 *
 * Le rapport suit un plan fixe :
 * 1. Page de garde
 * 2. Synthèse exécutive
 * 3. Profil investisseur
 * 4. Allocation globale
 * 5. Détail par produit
 * 6. Analyse des coûts
 * 7. Analyse des risques
 * 8. Commentaires et recommandations
 * 9. Annexes
 */
export interface ReportSection {
  id: string;
  title: string;
  type: "cover" | "summary" | "chart" | "table" | "text" | "product-card";
  pageBreakBefore?: boolean;
}

export function getReportStructure(_data: ReportData): ReportSection[] {
  return [
    { id: "cover", title: "Page de garde", type: "cover", pageBreakBefore: false },
    { id: "executive-summary", title: "Synthèse", type: "summary", pageBreakBefore: true },
    { id: "investor-profile", title: "Profil investisseur", type: "text", pageBreakBefore: true },
    { id: "allocation", title: "Allocation globale", type: "chart", pageBreakBefore: true },
    { id: "products", title: "Détail des produits", type: "product-card", pageBreakBefore: true },
    { id: "costs", title: "Analyse des coûts", type: "table", pageBreakBefore: true },
    { id: "risks", title: "Analyse des risques", type: "chart", pageBreakBefore: true },
    { id: "comments", title: "Commentaires", type: "text", pageBreakBefore: true },
    { id: "appendix", title: "Annexes", type: "text", pageBreakBefore: true },
  ];
}
