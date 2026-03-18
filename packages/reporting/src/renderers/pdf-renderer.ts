import type { ReportData, ReportGenerator } from "@repo/core-domain";

/**
 * Scaffold du générateur PDF.
 *
 * En production, ce module utilisera @react-pdf/renderer
 * pour générer un PDF à partir de composants React.
 *
 * Pour le moment, il expose le contrat et une implémentation stub.
 */
export class PdfReportGenerator implements ReportGenerator {
  async generatePdf(reportData: ReportData): Promise<Uint8Array> {
    // Scaffold : retourne un PDF vide (placeholder)
    // L'implémentation complète utilisera @react-pdf/renderer
    const placeholder = `%PDF-1.4 — Placeholder for ${reportData.portfolio.clientName}`;
    return new TextEncoder().encode(placeholder);
  }
}
