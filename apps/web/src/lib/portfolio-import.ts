/**
 * Logique d'import CSV pour le portefeuille.
 *
 * Gère : parsing, détection de colonnes, mapping automatique,
 * et conversion en HoldingDraft[].
 */
import type { AssetClass, WrapperType } from "@repo/core-domain";
import { parseCsv } from "@repo/data-ingestion";
import type { HoldingDraft } from "./portfolio-store";
import { createEmptyHolding } from "./portfolio-store";

// ─── Colonnes cibles ───────────────────────────────────────────────

export const TARGET_FIELDS = [
  { key: "isin", label: "ISIN", required: false },
  { key: "productName", label: "Nom du produit", required: true },
  { key: "assetClass", label: "Type de produit", required: false },
  { key: "wrapperType", label: "Support (CTO/PEA/AV/PER)", required: false },
  { key: "wrapperLabel", label: "Libellé du support", required: false },
  { key: "contractName", label: "Contrat", required: false },
  { key: "quantity", label: "Nombre de parts", required: false },
  { key: "unitPrice", label: "Prix unitaire", required: false },
  { key: "amount", label: "Montant investi", required: false },
  { key: "currentValuation", label: "Valorisation actuelle", required: false },
  { key: "averageCostPrice", label: "Prix de revient moyen", required: false },
  { key: "wrapperFeePercent", label: "Frais du support (%)", required: false },
  { key: "comment", label: "Commentaire", required: false },
] as const;

export type TargetFieldKey = (typeof TARGET_FIELDS)[number]["key"];

// ─── Aliases pour détection automatique ────────────────────────────

const COLUMN_ALIASES: Record<TargetFieldKey, string[]> = {
  isin: ["isin", "code isin", "code_isin", "codeisin", "code"],
  productName: ["nom", "nom du produit", "product name", "name", "produit", "libelle", "libellé", "designation", "désignation"],
  assetClass: ["type", "classe", "classe d'actif", "asset class", "assetclass", "catégorie", "categorie"],
  wrapperType: ["support", "enveloppe", "wrapper", "compte", "type de compte"],
  wrapperLabel: ["libellé support", "libelle support", "nom support", "nom du support"],
  contractName: ["contrat", "contract", "nom du contrat", "assureur"],
  quantity: ["parts", "quantité", "quantite", "quantity", "nb parts", "nombre de parts", "qté", "qte"],
  unitPrice: ["prix unitaire", "prix", "unit price", "price", "cours"],
  amount: ["montant", "montant investi", "amount", "invested amount", "investissement"],
  currentValuation: ["valorisation", "valeur actuelle", "current value", "valeur", "val"],
  averageCostPrice: ["pru", "prix de revient", "average cost", "prix moyen", "coût moyen", "cout moyen", "pmp"],
  wrapperFeePercent: ["frais support", "frais", "wrapper fees", "frais enveloppe", "frais gestion support"],
  comment: ["commentaire", "comment", "note", "notes", "remarque"],
};

// ─── Asset class mapping ───────────────────────────────────────────

const ASSET_CLASS_MAP: Record<string, AssetClass> = {
  etf: "ETF",
  "etf ucits": "ETF",
  tracker: "ETF",
  opcvm: "FUND",
  sicav: "FUND",
  fcp: "FUND",
  fonds: "FUND",
  fund: "FUND",
  obligation: "BOND",
  bond: "BOND",
  "produit structuré": "STRUCTURED",
  structuré: "STRUCTURED",
  structured: "STRUCTURED",
  autocall: "STRUCTURED",
  scpi: "SCPI",
  "private equity": "PRIVATE_EQUITY",
  pe: "PRIVATE_EQUITY",
  fcpr: "PRIVATE_EQUITY",
};

const WRAPPER_TYPE_MAP: Record<string, WrapperType> = {
  cto: "CTO",
  "compte-titres": "CTO",
  "compte titres": "CTO",
  "compte titres ordinaire": "CTO",
  pea: "PEA",
  "pea-pme": "PEA_PME",
  "pea pme": "PEA_PME",
  av: "ASSURANCE_VIE",
  "assurance-vie": "ASSURANCE_VIE",
  "assurance vie": "ASSURANCE_VIE",
  "ass. vie": "ASSURANCE_VIE",
  per: "PER",
  "per individuel": "PER_INDIVIDUEL",
  "per entreprise": "PER_ENTREPRISE",
};

// ─── Fonctions publiques ───────────────────────────────────────────

/**
 * Parse un contenu CSV et retourne les colonnes détectées + les lignes brutes.
 */
export function parsePortfolioCsv(content: string): {
  columns: string[];
  rows: Array<Record<string, string>>;
  separator: string;
} {
  // Detect separator
  const firstLine = content.split("\n")[0] ?? "";
  const separator = firstLine.includes("\t") ? "\t"
    : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const parsed = parseCsv(content, separator);
  const columns = parsed.length > 0 ? Object.keys(parsed[0]!.values) : [];
  const rows = parsed.map((r) => r.values);

  return { columns, rows, separator };
}

/**
 * Tente de mapper automatiquement les colonnes du CSV aux champs cibles.
 * Retourne un mapping { sourceColumn → targetFieldKey }.
 */
export function autoDetectMapping(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedTargets = new Set<string>();

  for (const col of columns) {
    const normalized = col.toLowerCase().trim();
    for (const [targetKey, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (usedTargets.has(targetKey)) continue;
      if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
        mapping[col] = targetKey;
        usedTargets.add(targetKey);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Convertit les lignes CSV mappées en HoldingDraft[].
 */
export function csvRowsToHoldings(
  rows: Array<Record<string, string>>,
  mapping: Record<string, string>,
): HoldingDraft[] {
  return rows
    .filter((row) => {
      // Ignorer les lignes complètement vides
      const values = Object.values(row).filter(Boolean);
      return values.length > 0;
    })
    .map((row) => {
      const draft = createEmptyHolding("IMPORT");
      const mapped = applyMapping(row, mapping);

      draft.isin = cleanIsin(mapped.isin ?? "");
      draft.productName = (mapped.productName ?? "").trim();
      draft.assetClass = parseAssetClass(mapped.assetClass ?? "");
      draft.wrapperType = parseWrapperType(mapped.wrapperType ?? "");
      draft.wrapperLabel = (mapped.wrapperLabel ?? "").trim();
      draft.contractName = (mapped.contractName ?? "").trim();
      draft.quantity = parseNumber(mapped.quantity);
      draft.unitPrice = parseNumber(mapped.unitPrice);
      draft.amount = parseNumber(mapped.amount);
      draft.currentValuation = parseNumber(mapped.currentValuation);
      draft.averageCostPrice = parseNumber(mapped.averageCostPrice);
      draft.wrapperFeePercent = parsePercent(mapped.wrapperFeePercent);
      draft.comment = (mapped.comment ?? "").trim();

      return draft;
    });
}

// ─── Helpers internes ──────────────────────────────────────────────

function applyMapping(
  row: Record<string, string>,
  mapping: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [sourceCol, targetKey] of Object.entries(mapping)) {
    const value = row[sourceCol];
    if (value) {
      result[targetKey] = value;
    }
  }
  return result;
}

function cleanIsin(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase().slice(0, 12);
}

function parseAssetClass(raw: string): AssetClass | null {
  const normalized = raw.toLowerCase().trim();
  return ASSET_CLASS_MAP[normalized] ?? null;
}

function parseWrapperType(raw: string): WrapperType | null {
  const normalized = raw.toLowerCase().trim();
  return WRAPPER_TYPE_MAP[normalized] ?? null;
}

function parseNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  // Handle French number format: 1 234,56 → 1234.56
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parsePercent(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/%/g, "").replace(/,/g, ".").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  // Si > 1, c'est probablement en pourcentage (ex: 0.75 ou 75%)
  return num > 1 ? num / 100 : num;
}

/**
 * Détecte les doublons potentiels (même ISIN + même support).
 */
export function detectDuplicates(holdings: HoldingDraft[]): Array<[number, number]> {
  const duplicates: Array<[number, number]> = [];
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const a = holdings[i]!;
      const b = holdings[j]!;
      if (a.isin && b.isin && a.isin === b.isin && a.wrapperType === b.wrapperType) {
        duplicates.push([i, j]);
      }
    }
  }
  return duplicates;
}

/**
 * Génère un fichier CSV modèle que l'utilisateur peut télécharger.
 */
export function generateTemplateCsv(): string {
  const headers = [
    "ISIN", "Nom du produit", "Type", "Support", "Contrat",
    "Nombre de parts", "Montant investi", "Valorisation actuelle",
    "Prix de revient moyen", "Frais support (%)", "Commentaire",
  ];
  const exampleRow = [
    "IE00B4L5Y983", "iShares Core MSCI World", "ETF", "PEA", "",
    "150", "45000", "52300", "300.00", "", "Position core",
  ];
  return [headers.join(";"), exampleRow.join(";"), ""].join("\n");
}
