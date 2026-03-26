"use client";

import { useState, useCallback, useRef } from "react";
import type { PortfolioAction, HoldingDraft } from "@/lib/portfolio-store";
import {
  parsePortfolioCsv,
  autoDetectMapping,
  csvRowsToHoldings,
  generateTemplateCsv,
  TARGET_FIELDS,
} from "@/lib/portfolio-import";

interface Props {
  csvDetectedColumns: string[];
  csvColumnMapping: Record<string, string>;
  dispatch: React.Dispatch<PortfolioAction>;
  onImported: (holdings: HoldingDraft[]) => void;
}

export function PortfolioCsvStep({ csvDetectedColumns, csvColumnMapping, dispatch, onImported }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      if (!file.name.match(/\.(csv|txt|tsv)$/i)) {
        setError("Format non supporté. Utilisez un fichier .csv, .tsv ou .txt");
        return;
      }

      try {
        const content = await file.text();
        const { columns, rows } = parsePortfolioCsv(content);

        if (rows.length === 0) {
          setError("Le fichier ne contient aucune donnée.");
          return;
        }

        setParsedRows(rows);
        const mapping = autoDetectMapping(columns);
        dispatch({ type: "SET_CSV_RAW", content, columns });
        dispatch({ type: "SET_CSV_MAPPING", mapping });
      } catch {
        setError("Erreur lors de la lecture du fichier.");
      }
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleMappingChange = (sourceCol: string, targetField: string) => {
    const newMapping = { ...csvColumnMapping };
    // Remove any existing mapping to this target
    for (const [key, val] of Object.entries(newMapping)) {
      if (val === targetField && key !== sourceCol) {
        delete newMapping[key];
      }
    }
    if (targetField) {
      newMapping[sourceCol] = targetField;
    } else {
      delete newMapping[sourceCol];
    }
    dispatch({ type: "SET_CSV_MAPPING", mapping: newMapping });
  };

  const handleImport = () => {
    const holdings = csvRowsToHoldings(parsedRows, csvColumnMapping);
    onImported(holdings);
  };

  const downloadTemplate = () => {
    const csv = generateTemplateCsv();
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-portefeuille.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const mappedCount = Object.keys(csvColumnMapping).length;
  const hasNameOrIsin = Object.values(csvColumnMapping).includes("productName") ||
    Object.values(csvColumnMapping).includes("isin");

  return (
    <div className="space-y-6">
      {/* Zone de drop */}
      {parsedRows.length === 0 && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              dragOver
                ? "border-brand-400 bg-brand-50"
                : "border-surface-300 bg-surface-50 hover:border-brand-300"
            }`}
          >
            <div className="mb-4 text-4xl">📄</div>
            <p className="mb-2 text-base font-medium text-surface-700">
              Glissez-déposez votre fichier CSV ici
            </p>
            <p className="mb-4 text-sm text-surface-500">
              ou cliquez pour sélectionner un fichier
            </p>
            <p className="text-xs text-surface-400">
              Formats acceptés : .csv, .tsv, .txt — Séparateurs : point-virgule, virgule, tabulation
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="text-center">
            <button
              onClick={downloadTemplate}
              className="text-sm text-brand-600 underline hover:text-brand-700"
            >
              Télécharger un modèle CSV
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Mapping des colonnes */}
      {parsedRows.length > 0 && (
        <>
          <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-surface-900">
                  Mapping des colonnes
                </h3>
                <p className="text-sm text-surface-500">
                  {fileName} — {parsedRows.length} lignes détectées — {mappedCount} colonnes mappées
                </p>
              </div>
              <button
                onClick={() => {
                  setParsedRows([]);
                  setFileName(null);
                  dispatch({ type: "SET_CSV_RAW", content: "", columns: [] });
                }}
                className="text-sm text-surface-500 hover:text-red-500"
              >
                Changer de fichier
              </button>
            </div>

            <div className="space-y-2">
              {csvDetectedColumns.map((col) => (
                <div key={col} className="flex items-center gap-4">
                  <span className="w-48 shrink-0 truncate rounded bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-700">
                    {col}
                  </span>
                  <span className="text-surface-400">→</span>
                  <select
                    value={csvColumnMapping[col] ?? ""}
                    onChange={(e) => handleMappingChange(col, e.target.value)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                      csvColumnMapping[col] ? "border-brand-300 bg-brand-50" : "border-surface-300"
                    }`}
                  >
                    <option value="">— Ignorer cette colonne —</option>
                    {TARGET_FIELDS.map((f) => {
                      const isUsed = Object.entries(csvColumnMapping).some(
                        ([k, v]) => v === f.key && k !== col,
                      );
                      return (
                        <option key={f.key} value={f.key} disabled={isUsed}>
                          {f.label} {isUsed ? "(déjà mappé)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu des premières lignes */}
          <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-surface-900">
              Aperçu des données ({Math.min(3, parsedRows.length)} premières lignes)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200">
                    {csvDetectedColumns.map((col) => (
                      <th key={col} className="px-3 py-2 font-medium text-surface-500">
                        {col}
                        {csvColumnMapping[col] && (
                          <span className="ml-1 text-brand-600">
                            → {TARGET_FIELDS.find((f) => f.key === csvColumnMapping[col])?.label}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-surface-100">
                      {csvDetectedColumns.map((col) => (
                        <td key={col} className="px-3 py-1.5 text-surface-700">
                          {row[col] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bouton import */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-500">
              {hasNameOrIsin
                ? `Prêt à importer ${parsedRows.length} lignes`
                : "Mappez au moins le nom du produit ou l'ISIN pour continuer"}
            </p>
            <button
              onClick={handleImport}
              disabled={!hasNameOrIsin}
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Importer {parsedRows.length} lignes →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
