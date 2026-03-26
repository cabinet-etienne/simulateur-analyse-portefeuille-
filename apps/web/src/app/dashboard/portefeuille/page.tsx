"use client";

import { useReducer, useCallback } from "react";
import {
  portfolioReducer,
  createInitialState,
  validateHolding,
  createEmptyHolding,
} from "@/lib/portfolio-store";
import type { HoldingDraft, PortfolioStep } from "@/lib/portfolio-store";

import { PortfolioMethodStep } from "@/components/modules/portfolio/PortfolioMethodStep";
import { PortfolioManualStep } from "@/components/modules/portfolio/PortfolioManualStep";
import { PortfolioCsvStep } from "@/components/modules/portfolio/PortfolioCsvStep";
import { PortfolioReviewStep } from "@/components/modules/portfolio/PortfolioReviewStep";
import { PortfolioSummaryStep } from "@/components/modules/portfolio/PortfolioSummaryStep";

const STEP_LABELS: Record<PortfolioStep, string> = {
  method: "Méthode",
  input: "Saisie",
  review: "Validation",
  summary: "Récapitulatif",
};

const STEPS: PortfolioStep[] = ["method", "input", "review", "summary"];

export default function PortfolioModulePage() {
  const [state, dispatch] = useReducer(portfolioReducer, undefined, createInitialState);

  const goToReview = useCallback(() => {
    // Valider toutes les lignes avant de passer en review
    const validated = state.holdings.map(validateHolding);
    dispatch({ type: "SET_HOLDINGS", holdings: validated });
    dispatch({ type: "SET_STEP", step: "review" });
  }, [state.holdings]);

  const handleCsvImported = useCallback((imported: HoldingDraft[]) => {
    const validated = imported.map(validateHolding);
    dispatch({ type: "SET_HOLDINGS", holdings: [...state.holdings, ...validated] });
    // Si méthode mixte, rester sur input pour permettre ajouts manuels
    if (state.entryMethod === "mixed") {
      return;
    }
    dispatch({ type: "SET_STEP", step: "review" });
  }, [state.holdings, state.entryMethod]);

  const currentStepIndex = STEPS.indexOf(state.currentStep);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">
          Portefeuille actuel
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Reconstituez le portefeuille existant du client pour analyse
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <button
              onClick={() => {
                // Only allow going back, not forward
                if (i < currentStepIndex) {
                  dispatch({ type: "SET_STEP", step });
                }
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                step === state.currentStep
                  ? "bg-brand-600 text-white shadow-sm"
                  : i < currentStepIndex
                    ? "cursor-pointer bg-brand-100 text-brand-700 hover:bg-brand-200"
                    : "bg-surface-100 text-surface-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {i < currentStepIndex ? "✓" : i + 1}
              </span>
              {STEP_LABELS[step]}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < currentStepIndex ? "bg-brand-300" : "bg-surface-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {state.currentStep === "method" && (
        <PortfolioMethodStep meta={state.meta} dispatch={dispatch} />
      )}

      {state.currentStep === "input" && state.entryMethod === "manual" && (
        <PortfolioManualStep
          holdings={state.holdings}
          meta={state.meta}
          dispatch={dispatch}
          onNext={goToReview}
        />
      )}

      {state.currentStep === "input" && state.entryMethod === "csv" && (
        <PortfolioCsvStep
          csvDetectedColumns={state.csvDetectedColumns}
          csvColumnMapping={state.csvColumnMapping}
          dispatch={dispatch}
          onImported={handleCsvImported}
        />
      )}

      {state.currentStep === "input" && state.entryMethod === "mixed" && (
        <div className="space-y-6">
          {/* CSV import section */}
          {state.holdings.length === 0 && (
            <PortfolioCsvStep
              csvDetectedColumns={state.csvDetectedColumns}
              csvColumnMapping={state.csvColumnMapping}
              dispatch={dispatch}
              onImported={handleCsvImported}
            />
          )}

          {/* After import: show manual editor for additions/corrections */}
          {state.holdings.length > 0 && (
            <PortfolioManualStep
              holdings={state.holdings}
              meta={state.meta}
              dispatch={dispatch}
              onNext={goToReview}
            />
          )}
        </div>
      )}

      {state.currentStep === "review" && (
        <PortfolioReviewStep
          holdings={state.holdings}
          dispatch={dispatch}
          onNext={() => dispatch({ type: "SET_STEP", step: "summary" })}
          onBack={() => dispatch({ type: "SET_STEP", step: "input" })}
        />
      )}

      {state.currentStep === "summary" && (
        <PortfolioSummaryStep
          holdings={state.holdings}
          meta={state.meta}
          dispatch={dispatch}
          onBack={() => dispatch({ type: "SET_STEP", step: "review" })}
        />
      )}
    </main>
  );
}
