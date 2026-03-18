import type { ParsedRow } from "@repo/core-domain";

/**
 * Parse un contenu CSV en lignes structurées.
 * Gère les séparateurs courants (;, ,) et les guillemets.
 *
 * Scaffold : implémentation basique.
 * En production, utiliser une librairie comme papaparse.
 */
export function parseCsv(content: string, separator = ";"): ParsedRow[] {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headerLine = lines[0];
  if (!headerLine) return [];
  const headers = headerLine.split(separator).map((h) => h.trim().replace(/^"|"$/g, ""));

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = line.split(separator).map((v) => v.trim().replace(/^"|"$/g, ""));

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (header) {
        row[header] = values[j] ?? "";
      }
    }

    rows.push({ rowIndex: i, values: row });
  }

  return rows;
}
