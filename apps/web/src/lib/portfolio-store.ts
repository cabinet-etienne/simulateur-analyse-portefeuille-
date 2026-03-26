/**
 * State management pour le flux d'entrée du portefeuille actuel.
 *
 * Flux : Méthode → Saisie → Validation → Récapitulatif
 */
import type {
  AssetClass,
  InstrumentSubType,
  WrapperType,
  DataConfidence,
} from "@repo/core-domain";

// ─── Types ─────────────────────────────────────────────────────────

export type PortfolioStep = "method" | "input" | "review" | "summary";

export type EntryMethod = "manual" | "csv" | "mixed";

export type HoldingConfidence = "VERIFIED" | "DECLARED" | "INCOMPLETE" | "ERROR";

export interface HoldingDraft {
  id: string;
  // Identification
  isin: string;
  productName: string;
  assetClass: AssetClass | null;
  subType: InstrumentSubType | null;
  // Support
  wrapperType: WrapperType | null;
  wrapperLabel: string;
  contractName: string;
  // Position
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
  currentValuation: number | null;
  averageCostPrice: number | null;
  // Frais du support
  wrapperFeePercent: number | null;
  // Libre
  comment: string;
  // Métadonnées
  source: "MANUAL" | "IMPORT";
  confidence: HoldingConfidence;
  enriched: boolean;
  matchedProductId: string | null;
  errors: HoldingError[];
  warnings: string[];
}

export interface HoldingError {
  field: string;
  message: string;
}

export interface PortfolioMeta {
  clientName: string;
  portfolioName: string;
  referenceDate: string; // ISO date string
}

export interface PortfolioState {
  currentStep: PortfolioStep;
  entryMethod: EntryMethod | null;
  meta: PortfolioMeta;
  holdings: HoldingDraft[];
  // CSV-specific
  csvRawContent: string | null;
  csvColumnMapping: Record<string, string>; // sourceCol → targetField
  csvDetectedColumns: string[];
  // UI
  editingHoldingId: string | null;
}

// ─── Actions ───────────────────────────────────────────────────────

export type PortfolioAction =
  | { type: "SET_STEP"; step: PortfolioStep }
  | { type: "SET_METHOD"; method: EntryMethod }
  | { type: "SET_META"; meta: Partial<PortfolioMeta> }
  | { type: "ADD_HOLDING"; holding: HoldingDraft }
  | { type: "UPDATE_HOLDING"; id: string; updates: Partial<HoldingDraft> }
  | { type: "REMOVE_HOLDING"; id: string }
  | { type: "SET_HOLDINGS"; holdings: HoldingDraft[] }
  | { type: "ENRICH_HOLDING"; id: string; data: EnrichmentPayload }
  | { type: "SET_CSV_RAW"; content: string; columns: string[] }
  | { type: "SET_CSV_MAPPING"; mapping: Record<string, string> }
  | { type: "SET_EDITING"; id: string | null }
  | { type: "VALIDATE_ALL" }
  | { type: "RESET" };

export interface EnrichmentPayload {
  productName: string;
  assetClass: AssetClass;
  subType: InstrumentSubType | null;
  matchedProductId: string;
  currentValuation?: number;
}

// ─── Reducer ───────────────────────────────────────────────────────

export function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction,
): PortfolioState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "SET_METHOD":
      return { ...state, entryMethod: action.method, currentStep: "input" };

    case "SET_META":
      return { ...state, meta: { ...state.meta, ...action.meta } };

    case "ADD_HOLDING":
      return { ...state, holdings: [...state.holdings, action.holding] };

    case "UPDATE_HOLDING":
      return {
        ...state,
        holdings: state.holdings.map((h) =>
          h.id === action.id ? { ...h, ...action.updates } : h,
        ),
      };

    case "REMOVE_HOLDING":
      return {
        ...state,
        holdings: state.holdings.filter((h) => h.id !== action.id),
      };

    case "SET_HOLDINGS":
      return { ...state, holdings: action.holdings };

    case "ENRICH_HOLDING":
      return {
        ...state,
        holdings: state.holdings.map((h) =>
          h.id === action.id
            ? {
                ...h,
                productName: action.data.productName,
                assetClass: action.data.assetClass,
                subType: action.data.subType,
                matchedProductId: action.data.matchedProductId,
                enriched: true,
                confidence: computeConfidence({
                  ...h,
                  productName: action.data.productName,
                  assetClass: action.data.assetClass,
                  enriched: true,
                }),
                currentValuation: action.data.currentValuation ?? h.currentValuation,
              }
            : h,
        ),
      };

    case "SET_CSV_RAW":
      return {
        ...state,
        csvRawContent: action.content,
        csvDetectedColumns: action.columns,
      };

    case "SET_CSV_MAPPING":
      return { ...state, csvColumnMapping: action.mapping };

    case "SET_EDITING":
      return { ...state, editingHoldingId: action.id };

    case "VALIDATE_ALL":
      return {
        ...state,
        holdings: state.holdings.map((h) => validateHolding(h)),
      };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

// ─── Initial State ─────────────────────────────────────────────────

export function createInitialState(): PortfolioState {
  return {
    currentStep: "method",
    entryMethod: null,
    meta: {
      clientName: "",
      portfolioName: "",
      referenceDate: new Date().toISOString().slice(0, 10),
    },
    holdings: [],
    csvRawContent: null,
    csvColumnMapping: {},
    csvDetectedColumns: [],
    editingHoldingId: null,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

let holdingCounter = 0;

export function createEmptyHolding(source: "MANUAL" | "IMPORT" = "MANUAL"): HoldingDraft {
  holdingCounter += 1;
  return {
    id: `draft-${Date.now()}-${holdingCounter}`,
    isin: "",
    productName: "",
    assetClass: null,
    subType: null,
    wrapperType: null,
    wrapperLabel: "",
    contractName: "",
    quantity: null,
    unitPrice: null,
    amount: null,
    currentValuation: null,
    averageCostPrice: null,
    wrapperFeePercent: null,
    comment: "",
    source,
    confidence: "INCOMPLETE",
    enriched: false,
    matchedProductId: null,
    errors: [],
    warnings: [],
  };
}

export function validateHolding(h: HoldingDraft): HoldingDraft {
  const errors: HoldingError[] = [];
  const warnings: string[] = [];

  // Au minimum il faut un nom ou un ISIN
  if (!h.isin && !h.productName) {
    errors.push({ field: "isin", message: "ISIN ou nom du produit requis" });
  }

  // ISIN format si fourni
  if (h.isin && !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(h.isin)) {
    errors.push({ field: "isin", message: "Format ISIN invalide (12 caractères)" });
  }

  // Il faut au moins un montant ou une quantité
  if (h.amount == null && h.quantity == null && h.currentValuation == null) {
    errors.push({ field: "amount", message: "Montant, quantité ou valorisation requis" });
  }

  // Warnings non bloquants
  if (!h.wrapperType) {
    warnings.push("Support de détention non renseigné");
  }
  if (!h.assetClass) {
    warnings.push("Type de produit non renseigné");
  }
  if (h.averageCostPrice == null) {
    warnings.push("Prix de revient moyen non renseigné");
  }

  const confidence = errors.length > 0
    ? "ERROR"
    : computeConfidence({ ...h, errors, warnings });

  return { ...h, errors, warnings, confidence };
}

function computeConfidence(h: Partial<HoldingDraft>): HoldingConfidence {
  if (h.errors && h.errors.length > 0) return "ERROR";
  if (h.enriched) return "VERIFIED";

  const hasBasicData = (h.isin || h.productName) &&
    (h.amount != null || h.quantity != null || h.currentValuation != null);

  if (!hasBasicData) return "INCOMPLETE";

  const hasMissingOptional = !h.wrapperType || !h.assetClass || h.averageCostPrice == null;
  if (hasMissingOptional) return "DECLARED";

  return "DECLARED";
}

export function getConfidenceLabel(c: HoldingConfidence): string {
  switch (c) {
    case "VERIFIED": return "Vérifié";
    case "DECLARED": return "Déclaré";
    case "INCOMPLETE": return "Incomplet";
    case "ERROR": return "Erreur";
  }
}

export function getConfidenceColor(c: HoldingConfidence): string {
  switch (c) {
    case "VERIFIED": return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "DECLARED": return "text-blue-700 bg-blue-50 border-blue-200";
    case "INCOMPLETE": return "text-amber-700 bg-amber-50 border-amber-200";
    case "ERROR": return "text-red-700 bg-red-50 border-red-200";
  }
}

export function getHoldingAmount(h: HoldingDraft): number | null {
  if (h.currentValuation != null) return h.currentValuation;
  if (h.amount != null) return h.amount;
  if (h.quantity != null && h.unitPrice != null) return h.quantity * h.unitPrice;
  return null;
}

export function getTotalValuation(holdings: HoldingDraft[]): number {
  return holdings.reduce((sum, h) => sum + (getHoldingAmount(h) ?? 0), 0);
}

export function getQualityStats(holdings: HoldingDraft[]) {
  const total = holdings.length;
  const verified = holdings.filter((h) => h.confidence === "VERIFIED").length;
  const declared = holdings.filter((h) => h.confidence === "DECLARED").length;
  const incomplete = holdings.filter((h) => h.confidence === "INCOMPLETE").length;
  const errors = holdings.filter((h) => h.confidence === "ERROR").length;
  const qualityScore = total > 0 ? Math.round(((verified * 3 + declared * 2 + incomplete) / (total * 3)) * 100) : 0;
  return { total, verified, declared, incomplete, errors, qualityScore };
}
