"use client";

import { useState, useCallback } from "react";
import {
  ASSET_CLASS_LABELS,
  WRAPPER_TYPE_LABELS,
} from "@repo/core-domain";
import type { AssetClass, WrapperType } from "@repo/core-domain";
import { enrichByIsin, searchEtfByName } from "@repo/adapters-etf";

import type {
  PortfolioAction,
  HoldingDraft,
  PortfolioMeta,
} from "@/lib/portfolio-store";
import {
  createEmptyHolding,
  getConfidenceLabel,
  getConfidenceColor,
  getHoldingAmount,
  getTotalValuation,
} from "@/lib/portfolio-store";

interface Props {
  holdings: HoldingDraft[];
  meta: PortfolioMeta;
  dispatch: React.Dispatch<PortfolioAction>;
  onNext: () => void;
}

const ASSET_CLASSES: AssetClass[] = ["ETF", "FUND", "BOND", "STRUCTURED", "SCPI", "PRIVATE_EQUITY"];
const WRAPPER_TYPES: WrapperType[] = ["CTO", "PEA", "PEA_PME", "ASSURANCE_VIE", "PER", "PER_INDIVIDUEL", "PER_ENTREPRISE"];

export function PortfolioManualStep({ holdings, meta, dispatch, onNext }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddLine = () => {
    const h = createEmptyHolding("MANUAL");
    dispatch({ type: "ADD_HOLDING", holding: h });
    setExpandedId(h.id);
  };

  const totalValuation = getTotalValuation(holdings);

  return (
    <div className="space-y-6">
      {/* Header avec récap */}
      <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">
            {meta.clientName ? `Portefeuille de ${meta.clientName}` : "Saisie du portefeuille"}
          </h3>
          <p className="text-sm text-surface-500">
            {holdings.length} ligne{holdings.length !== 1 ? "s" : ""} — Valorisation totale :{" "}
            <span className="font-medium text-surface-900">
              {totalValuation > 0 ? `${totalValuation.toLocaleString("fr-FR")} €` : "—"}
            </span>
          </p>
        </div>
        <button
          onClick={handleAddLine}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          + Ajouter une ligne
        </button>
      </div>

      {/* Liste des holdings */}
      {holdings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 p-12 text-center">
          <p className="mb-4 text-surface-500">Aucune ligne saisie</p>
          <button
            onClick={handleAddLine}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Ajouter la première ligne
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map((holding, index) => (
            <HoldingCard
              key={holding.id}
              holding={holding}
              index={index}
              isExpanded={expandedId === holding.id}
              onToggle={() => setExpandedId(expandedId === holding.id ? null : holding.id)}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {holdings.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleAddLine}
            className="rounded-lg border border-dashed border-surface-400 px-4 py-2 text-sm text-surface-600 transition-colors hover:border-brand-400 hover:text-brand-600"
          >
            + Ajouter une ligne
          </button>
          <button
            onClick={onNext}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Vérifier et valider →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Composant ligne ───────────────────────────────────────────────

interface HoldingCardProps {
  holding: HoldingDraft;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  dispatch: React.Dispatch<PortfolioAction>;
}

function HoldingCard({ holding, index, isExpanded, onToggle, dispatch }: HoldingCardProps) {
  const [searchResults, setSearchResults] = useState<Array<{ isin: string; name: string }>>([]);
  const [showSearch, setShowSearch] = useState(false);

  const update = useCallback(
    (updates: Partial<HoldingDraft>) => {
      dispatch({ type: "UPDATE_HOLDING", id: holding.id, updates });
    },
    [dispatch, holding.id],
  );

  const handleIsinChange = (value: string) => {
    update({ isin: value.toUpperCase() });

    // Recherche si texte non-ISIN
    if (value.length >= 2 && !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(value)) {
      const results = searchEtfByName(value, 5);
      setSearchResults(results.map((r) => ({ isin: r.isin, name: r.name })));
      setShowSearch(results.length > 0);
    } else {
      setShowSearch(false);
    }

    // Auto-enrichir si ISIN complet
    if (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(value.toUpperCase())) {
      tryEnrich(value.toUpperCase());
    }
  };

  const tryEnrich = (isin: string) => {
    const result = enrichByIsin(isin);
    if (result.found && result.product && result.data) {
      dispatch({
        type: "ENRICH_HOLDING",
        id: holding.id,
        data: {
          productName: result.product.name ?? "",
          assetClass: (result.product.type as AssetClass) ?? "ETF",
          subType: null,
          matchedProductId: isin,
        },
      });
    }
    setShowSearch(false);
  };

  const selectSearchResult = (isin: string, name: string) => {
    update({ isin, productName: name });
    setShowSearch(false);
    tryEnrich(isin);
  };

  const amount = getHoldingAmount(holding);
  const confidenceClass = getConfidenceColor(holding.confidence);

  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-all ${
      holding.errors.length > 0 ? "border-red-300" : "border-surface-200"
    }`}>
      {/* Ligne compacte */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={onToggle}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-100 text-xs font-semibold text-surface-600">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-surface-900">
              {holding.productName || holding.isin || "Nouvelle ligne"}
            </span>
            {holding.isin && (
              <span className="shrink-0 text-xs text-surface-400">{holding.isin}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            {holding.assetClass && (
              <span>{ASSET_CLASS_LABELS[holding.assetClass]}</span>
            )}
            {holding.wrapperType && (
              <>
                <span>·</span>
                <span>{WRAPPER_TYPE_LABELS[holding.wrapperType]}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-surface-900">
            {amount != null ? `${amount.toLocaleString("fr-FR")} €` : "—"}
          </div>
        </div>

        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${confidenceClass}`}>
          {getConfidenceLabel(holding.confidence)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "REMOVE_HOLDING", id: holding.id });
          }}
          className="shrink-0 rounded p-1 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Supprimer"
        >
          ✕
        </button>
      </div>

      {/* Formulaire déplié */}
      {isExpanded && (
        <div className="border-t border-surface-100 px-4 pb-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* ISIN avec recherche */}
            <div className="relative">
              <label className="mb-1 block text-xs font-medium text-surface-500">
                ISIN ou recherche
              </label>
              <input
                type="text"
                value={holding.isin}
                onChange={(e) => handleIsinChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                placeholder="FR0010296061 ou nom..."
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {holding.enriched && (
                <span className="absolute right-2 top-7 text-xs text-emerald-600">✓ enrichi</span>
              )}
              {showSearch && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-surface-200 bg-white shadow-lg">
                  {searchResults.map((r) => (
                    <button
                      key={r.isin}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-50"
                      onMouseDown={() => selectSearchResult(r.isin, r.name)}
                    >
                      <span className="font-medium text-surface-900">{r.name}</span>
                      <span className="ml-2 text-xs text-surface-400">{r.isin}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nom du produit */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Nom du produit
              </label>
              <input
                type="text"
                value={holding.productName}
                onChange={(e) => update({ productName: e.target.value })}
                placeholder="ex: Amundi MSCI World"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Type de produit */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Type de produit
              </label>
              <select
                value={holding.assetClass ?? ""}
                onChange={(e) => update({ assetClass: (e.target.value || null) as AssetClass | null })}
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">— Non précisé —</option>
                {ASSET_CLASSES.map((ac) => (
                  <option key={ac} value={ac}>{ASSET_CLASS_LABELS[ac]}</option>
                ))}
              </select>
            </div>

            {/* Support */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Support de détention
              </label>
              <select
                value={holding.wrapperType ?? ""}
                onChange={(e) => update({ wrapperType: (e.target.value || null) as WrapperType | null })}
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">— Non précisé —</option>
                {WRAPPER_TYPES.map((wt) => (
                  <option key={wt} value={wt}>{WRAPPER_TYPE_LABELS[wt]}</option>
                ))}
              </select>
            </div>

            {/* Contrat */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Contrat (si applicable)
              </label>
              <input
                type="text"
                value={holding.contractName}
                onChange={(e) => update({ contractName: e.target.value })}
                placeholder="ex: Linxea Spirit 2"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Quantité */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Nombre de parts
              </label>
              <input
                type="number"
                value={holding.quantity ?? ""}
                onChange={(e) => update({ quantity: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="150"
                step="any"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Montant investi */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Montant investi (€)
              </label>
              <input
                type="number"
                value={holding.amount ?? ""}
                onChange={(e) => update({ amount: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="45 000"
                step="any"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Valorisation actuelle */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Valorisation actuelle (€)
              </label>
              <input
                type="number"
                value={holding.currentValuation ?? ""}
                onChange={(e) => update({ currentValuation: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="52 300"
                step="any"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* PRU */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Prix de revient moyen (€)
              </label>
              <input
                type="number"
                value={holding.averageCostPrice ?? ""}
                onChange={(e) => update({ averageCostPrice: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="300.00"
                step="any"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Frais support */}
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Frais du support (%)
              </label>
              <input
                type="number"
                value={holding.wrapperFeePercent != null ? holding.wrapperFeePercent * 100 : ""}
                onChange={(e) => update({ wrapperFeePercent: e.target.value ? parseFloat(e.target.value) / 100 : null })}
                placeholder="0.75"
                step="0.01"
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Commentaire */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-surface-500">
                Commentaire
              </label>
              <input
                type="text"
                value={holding.comment}
                onChange={(e) => update({ comment: e.target.value })}
                placeholder="Position core, à conserver..."
                className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Erreurs et warnings */}
          {(holding.errors.length > 0 || holding.warnings.length > 0) && (
            <div className="mt-3 space-y-1">
              {holding.errors.map((err, i) => (
                <p key={`e-${i}`} className="text-xs text-red-600">⚠ {err.message}</p>
              ))}
              {holding.warnings.map((w, i) => (
                <p key={`w-${i}`} className="text-xs text-amber-600">💡 {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
