/**
 * State management pour le module ETF.
 * Utilise un simple pattern store avec React context.
 *
 * Gère :
 * - La liste des ETF à comparer (3-5)
 * - Les résultats de scoring/comparaison
 * - La sélection pour le portefeuille
 * - Les pondérations personnalisées
 */

import type {
  EtfData,
  EtfComparisonResult,
  EtfSelection,
  EtfScoringWeights,
  Product,
} from "@repo/core-domain";
import { DEFAULT_ETF_WEIGHTS } from "@repo/core-domain";

// ─── Types d'état ───────────────────────────────────────────

export interface EtfEntry {
  id: string;
  isin: string;
  product: Product | null;
  data: EtfData | null;
  isEnriched: boolean;
  isManual: boolean;
}

export interface EtfModuleState {
  entries: EtfEntry[];
  weights: EtfScoringWeights;
  comparison: EtfComparisonResult | null;
  selections: EtfSelection[];
  currentStep: "input" | "comparison" | "detail" | "selection";
  detailProductId: string | null;
}

export function createInitialState(): EtfModuleState {
  return {
    entries: [
      createEmptyEntry("etf-1"),
      createEmptyEntry("etf-2"),
      createEmptyEntry("etf-3"),
    ],
    weights: { ...DEFAULT_ETF_WEIGHTS },
    comparison: null,
    selections: [],
    currentStep: "input",
    detailProductId: null,
  };
}

export function createEmptyEntry(id: string): EtfEntry {
  return {
    id,
    isin: "",
    product: null,
    data: null,
    isEnriched: false,
    isManual: false,
  };
}

// ─── Actions ────────────────────────────────────────────────

export type EtfAction =
  | { type: "SET_ISIN"; entryId: string; isin: string }
  | { type: "SET_ENRICHED"; entryId: string; product: Product; data: EtfData }
  | { type: "SET_MANUAL_DATA"; entryId: string; product: Product; data: EtfData }
  | { type: "ADD_ENTRY" }
  | { type: "REMOVE_ENTRY"; entryId: string }
  | { type: "SET_WEIGHTS"; weights: EtfScoringWeights }
  | { type: "SET_COMPARISON"; result: EtfComparisonResult }
  | { type: "TOGGLE_SELECTION"; selection: EtfSelection }
  | { type: "REMOVE_SELECTION"; productId: string }
  | { type: "SET_STEP"; step: EtfModuleState["currentStep"] }
  | { type: "SET_DETAIL"; productId: string | null }
  | { type: "RESET" };

export function etfReducer(state: EtfModuleState, action: EtfAction): EtfModuleState {
  switch (action.type) {
    case "SET_ISIN":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.entryId ? { ...e, isin: action.isin, product: null, data: null, isEnriched: false } : e,
        ),
      };

    case "SET_ENRICHED":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.entryId
            ? { ...e, product: action.product, data: action.data, isEnriched: true, isManual: false }
            : e,
        ),
      };

    case "SET_MANUAL_DATA":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.entryId
            ? { ...e, product: action.product, data: action.data, isEnriched: false, isManual: true }
            : e,
        ),
      };

    case "ADD_ENTRY":
      if (state.entries.length >= 5) return state;
      return {
        ...state,
        entries: [...state.entries, createEmptyEntry(`etf-${state.entries.length + 1}`)],
      };

    case "REMOVE_ENTRY":
      if (state.entries.length <= 3) return state;
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.entryId),
      };

    case "SET_WEIGHTS":
      return { ...state, weights: action.weights };

    case "SET_COMPARISON":
      return { ...state, comparison: action.result, currentStep: "comparison" };

    case "TOGGLE_SELECTION": {
      const exists = state.selections.find((s) => s.productId === action.selection.productId);
      return {
        ...state,
        selections: exists
          ? state.selections.filter((s) => s.productId !== action.selection.productId)
          : [...state.selections, action.selection],
      };
    }

    case "REMOVE_SELECTION":
      return {
        ...state,
        selections: state.selections.filter((s) => s.productId !== action.productId),
      };

    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "SET_DETAIL":
      return { ...state, detailProductId: action.productId, currentStep: action.productId ? "detail" : "comparison" };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

// ─── Helpers ────────────────────────────────────────────────

export function canCompare(state: EtfModuleState): boolean {
  const validEntries = state.entries.filter((e) => e.product !== null && e.data !== null);
  return validEntries.length >= 3;
}

export function getValidEntries(state: EtfModuleState): Array<{ product: Product; data: EtfData }> {
  return state.entries
    .filter((e): e is EtfEntry & { product: Product; data: EtfData } => e.product !== null && e.data !== null);
}
