"use client";

import { useState } from "react";
import { Card, CardHeader, Button, Badge } from "@repo/ui";
import type { EtfData, EtfScoringWeights, Product } from "@repo/core-domain";
import { DEFAULT_ETF_WEIGHTS } from "@repo/core-domain";
import { enrichByIsin, searchEtfByName } from "@repo/adapters-etf";

import type { EtfAction, EtfEntry } from "@/lib/etf-store";

interface EtfInputStepProps {
  entries: EtfEntry[];
  weights: EtfScoringWeights;
  canCompare: boolean;
  dispatch: (action: EtfAction) => void;
  validEntries: Array<{ product: Product; data: EtfData }>;
}

export function EtfInputStep({ entries, weights, canCompare, dispatch, validEntries }: EtfInputStepProps) {
  const [showWeights, setShowWeights] = useState(false);

  return (
    <div className="space-y-6">
      {/* ETF Input Cards */}
      {entries.map((entry, index) => (
        <EtfInputCard
          key={entry.id}
          entry={entry}
          index={index}
          canRemove={entries.length > 3}
          dispatch={dispatch}
        />
      ))}

      {/* Add ETF button */}
      {entries.length < 5 && (
        <button
          onClick={() => dispatch({ type: "ADD_ENTRY" })}
          className="w-full rounded border-2 border-dashed border-surface-300 py-4 text-sm text-brand-400 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          + Ajouter un ETF (max 5)
        </button>
      )}

      {/* Weights configuration */}
      <Card>
        <button
          onClick={() => setShowWeights(!showWeights)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h3 className="text-sm font-medium text-brand-700">Pondérations du scoring</h3>
            <p className="text-xs text-brand-400">
              Coûts {Math.round(weights.costs * 100)}% · Perf {Math.round(weights.performance * 100)}% ·
              Tracking {Math.round(weights.tracking * 100)}% · Risque {Math.round(weights.risk * 100)}% ·
              Liquidité {Math.round(weights.liquidity * 100)}% · Maturité {Math.round(weights.maturity * 100)}%
            </p>
          </div>
          <span className="text-brand-400">{showWeights ? "▲" : "▼"}</span>
        </button>

        {showWeights && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {(Object.keys(DEFAULT_ETF_WEIGHTS) as Array<keyof EtfScoringWeights>).map((key) => (
              <WeightSlider
                key={key}
                label={WEIGHT_LABELS[key]}
                value={weights[key]}
                onChange={(val) =>
                  dispatch({
                    type: "SET_WEIGHTS",
                    weights: { ...weights, [key]: val },
                  })
                }
              />
            ))}
          </div>
        )}
      </Card>

      {/* Launch comparison */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-400">
          {validEntries.length} ETF prêts sur {entries.length} saisis
          {validEntries.length < 3 && " — minimum 3 requis"}
        </p>
        <Button
          variant="primary"
          size="lg"
          disabled={!canCompare}
          onClick={() => {
            // Scoring will be computed by the comparison engine
            // For now we dispatch a placeholder — real implementation connects to scoreEtfGroup
            dispatch({ type: "SET_STEP", step: "comparison" });
          }}
        >
          Lancer la comparaison →
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function EtfInputCard({
  entry,
  index,
  canRemove,
  dispatch,
}: {
  entry: EtfEntry;
  index: number;
  canRemove: boolean;
  dispatch: (action: EtfAction) => void;
}) {
  const [searchResults, setSearchResults] = useState<
    Array<{ isin: string; name: string; provider: string | null }>
  >([]);
  const [inputValue, setInputValue] = useState(entry.isin);

  function handleInputChange(value: string) {
    setInputValue(value);
    dispatch({ type: "SET_ISIN", entryId: entry.id, isin: value });

    // Try enrichment if looks like ISIN
    if (value.length === 12) {
      const result = enrichByIsin(value.toUpperCase());
      if (result.found && result.product && result.data) {
        dispatch({
          type: "SET_ENRICHED",
          entryId: entry.id,
          product: result.product as Product,
          data: result.data as EtfData,
        });
        setSearchResults([]);
        return;
      }
    }

    // Otherwise search by name
    if (value.length >= 2) {
      const results = searchEtfByName(value, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }

  function handleSelectResult(isin: string) {
    setInputValue(isin);
    dispatch({ type: "SET_ISIN", entryId: entry.id, isin });

    const result = enrichByIsin(isin);
    if (result.found && result.product && result.data) {
      dispatch({
        type: "SET_ENRICHED",
        entryId: entry.id,
        product: result.product as Product,
        data: result.data as EtfData,
      });
    }
    setSearchResults([]);
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Entrez un ISIN (ex: IE00B4L5Y983) ou un nom d'ETF"
              className="w-full rounded border border-surface-300 px-4 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded border border-surface-200 bg-surface-0 shadow-elevated">
                {searchResults.map((r) => (
                  <button
                    key={r.isin}
                    onClick={() => handleSelectResult(r.isin)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surface-50"
                  >
                    <span className="text-brand-800">{r.name}</span>
                    <span className="text-xs text-brand-400">{r.isin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enriched data preview */}
          {entry.isEnriched && entry.product && entry.data && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="positive">Enrichi</Badge>
              <span className="text-sm font-medium text-brand-800">{entry.product.name}</span>
              <span className="text-xs text-brand-400">
                TER {(entry.data.ter * 100).toFixed(2)}% · AUM{" "}
                {entry.data.aum >= 1_000_000_000
                  ? `${(entry.data.aum / 1_000_000_000).toFixed(1)}B€`
                  : `${(entry.data.aum / 1_000_000).toFixed(0)}M€`}
                {" · "}
                {entry.data.replicationMethod === "PHYSICAL" ? "Physique" : entry.data.replicationMethod === "SYNTHETIC" ? "Synthétique" : "Échantillonnage"}
                {entry.data.peaEligible && " · PEA"}
              </span>
            </div>
          )}
        </div>

        {canRemove && (
          <button
            onClick={() => dispatch({ type: "REMOVE_ENTRY", entryId: entry.id })}
            className="shrink-0 text-brand-300 hover:text-semantic-error"
            title="Retirer"
          >
            ✕
          </button>
        )}
      </div>
    </Card>
  );
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-brand-600">{label}</label>
        <span className="text-xs font-medium text-brand-800">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="50"
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1 w-full accent-brand-700"
      />
    </div>
  );
}

const WEIGHT_LABELS: Record<keyof EtfScoringWeights, string> = {
  costs: "Coûts",
  performance: "Performance",
  tracking: "Tracking",
  risk: "Risque",
  liquidity: "Liquidité",
  maturity: "Maturité",
};
