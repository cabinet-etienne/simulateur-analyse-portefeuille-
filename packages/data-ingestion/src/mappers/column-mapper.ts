import type { ColumnMapping, MappedProduct, ParsedRow } from "@repo/core-domain";

/**
 * Mappe les colonnes d'un fichier importé vers les champs du modèle de données.
 * Le mapping est défini par l'utilisateur via l'interface d'import.
 */
export function mapColumns(
  rows: ParsedRow[],
  mapping: ColumnMapping,
): MappedProduct[] {
  return rows.map((row) => {
    const data: Record<string, unknown> = {};

    for (const m of mapping.mappings) {
      const rawValue = row.values[m.sourceColumn];
      if (rawValue !== undefined && rawValue !== "") {
        data[m.targetField] = rawValue;
      }
    }

    return { rowIndex: row.rowIndex, data };
  });
}

/**
 * Détecte automatiquement les colonnes d'un fichier
 * et suggère un mapping basé sur la similarité des noms.
 * Scaffold : retourne les headers bruts pour le moment.
 */
export function detectColumns(rows: ParsedRow[]): string[] {
  if (rows.length === 0) return [];
  const firstRow = rows[0];
  if (!firstRow) return [];
  return Object.keys(firstRow.values);
}
