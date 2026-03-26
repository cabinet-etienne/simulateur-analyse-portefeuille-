"use client";

import { useReducer, useCallback } from "react";
import { Card, CardHeader, Button } from "@repo/ui";
import { DEFAULT_ETF_WEIGHTS } from "@repo/core-domain";

import { EtfInputStep } from "@/components/modules/etf/EtfInputStep";
import { EtfComparisonStep } from "@/components/modules/etf/EtfComparisonStep";
import { EtfDetailStep } from "@/components/modules/etf/EtfDetailStep";
import { EtfSelectionStep } from "@/components/modules/etf/EtfSelectionStep";
import {
  etfReducer,
  createInitialState,
  canCompare,
  getValidEntries,
  type EtfAction,
} from "@/lib/etf-store";

const STEP_LABELS = {
  input: "Saisie des ETF",
  comparison: "Résultats de la comparaison",
  detail: "Fiche détaillée",
  selection: "Sélection pour le portefeuille",
} as const;

export default function EtfModulePage() {
  const [state, dispatch] = useReducer(etfReducer, undefined, createInitialState);

  const handleDispatch = useCallback((action: EtfAction) => {
    dispatch(action);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
            Comparateur ETF
          </h1>
          <p className="mt-1 text-brand-500">
            Comparez de 3 à 5 ETF et identifiez les meilleurs choix
          </p>
        </div>

        {/* Step navigation */}
        <div className="flex items-center gap-2">
          {state.currentStep !== "input" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "SET_STEP", step: "input" })}
            >
              ← Modifier la saisie
            </Button>
          )}
          {state.currentStep === "detail" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "SET_DETAIL", productId: null })}
            >
              ← Retour au comparatif
            </Button>
          )}
          {(state.currentStep === "comparison" || state.currentStep === "detail") &&
            state.selections.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => dispatch({ type: "SET_STEP", step: "selection" })}
              >
                Voir la sélection ({state.selections.length})
              </Button>
            )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6 flex gap-2">
        {(["input", "comparison", "selection"] as const).map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              state.currentStep === step || (step === "detail" && state.currentStep === "detail")
                ? "bg-brand-900 text-white"
                : i < ["input", "comparison", "selection"].indexOf(state.currentStep)
                  ? "bg-brand-100 text-brand-700"
                  : "bg-surface-200 text-brand-400"
            }`}
          >
            {i + 1}. {STEP_LABELS[step]}
          </div>
        ))}
      </div>

      {/* Current step content */}
      {state.currentStep === "input" && (
        <EtfInputStep
          entries={state.entries}
          weights={state.weights}
          canCompare={canCompare(state)}
          dispatch={handleDispatch}
          validEntries={getValidEntries(state)}
        />
      )}

      {state.currentStep === "comparison" && state.comparison && (
        <EtfComparisonStep
          comparison={state.comparison}
          entries={state.entries}
          selections={state.selections}
          dispatch={handleDispatch}
        />
      )}

      {state.currentStep === "detail" && state.detailProductId && state.comparison && (
        <EtfDetailStep
          productId={state.detailProductId}
          comparison={state.comparison}
          entries={state.entries}
          isSelected={state.selections.some((s) => s.productId === state.detailProductId)}
          dispatch={handleDispatch}
        />
      )}

      {state.currentStep === "selection" && (
        <EtfSelectionStep
          selections={state.selections}
          dispatch={handleDispatch}
        />
      )}
    </main>
  );
}
