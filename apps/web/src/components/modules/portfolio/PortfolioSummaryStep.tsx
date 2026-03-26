"use client";

import { useMemo } from "react";
import { ASSET_CLASS_LABELS, WRAPPER_TYPE_LABELS } from "@repo/core-domain";

import type { PortfolioAction, HoldingDraft, PortfolioMeta } from "@/lib/portfolio-store";
import {
  getHoldingAmount,
  getTotalValuation,
  getQualityStats,
  getConfidenceLabel,
  getConfidenceColor,
} from "@/lib/portfolio-store";

interface Props {
  holdings: HoldingDraft[];
  meta: PortfolioMeta;
  dispatch: React.Dispatch<PortfolioAction>;
  onBack: () => void;
}

export function PortfolioSummaryStep({ holdings, meta, dispatch, onBack }: Props) {
  const stats = useMemo(() => getQualityStats(holdings), [holdings]);
  const totalValuation = useMemo(() => getTotalValuation(holdings), [holdings]);

  // Répartition par classe d'actifs
  const byAssetClass = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    for (const h of holdings) {
      const key = h.assetClass ?? "NON_CLASSE";
      if (!map[key]) map[key] = { count: 0, amount: 0 };
      map[key].count += 1;
      map[key].amount += getHoldingAmount(h) ?? 0;
    }
    return Object.entries(map)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([key, val]) => ({
        label: key === "NON_CLASSE" ? "Non classé" : (ASSET_CLASS_LABELS as Record<string, string>)[key] ?? key,
        ...val,
        weight: totalValuation > 0 ? val.amount / totalValuation : 0,
      }));
  }, [holdings, totalValuation]);

  // Répartition par support
  const byWrapper = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    for (const h of holdings) {
      const key = h.wrapperType ?? "NON_RENSEIGNE";
      if (!map[key]) map[key] = { count: 0, amount: 0 };
      map[key].count += 1;
      map[key].amount += getHoldingAmount(h) ?? 0;
    }
    return Object.entries(map)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([key, val]) => ({
        label: key === "NON_RENSEIGNE" ? "Non renseigné" : (WRAPPER_TYPE_LABELS as Record<string, string>)[key] ?? key,
        ...val,
        weight: totalValuation > 0 ? val.amount / totalValuation : 0,
      }));
  }, [holdings, totalValuation]);

  const handleCreateVersion = () => {
    // Sauvegarder dans localStorage pour transmission au module consolidation
    const payload = {
      source: "portfolio-input",
      meta,
      holdings: holdings.map((h) => ({
        id: h.id,
        isin: h.isin,
        productName: h.productName,
        assetClass: h.assetClass,
        subType: h.subType,
        wrapperType: h.wrapperType,
        wrapperLabel: h.wrapperLabel,
        contractName: h.contractName,
        quantity: h.quantity,
        amount: h.amount,
        currentValuation: h.currentValuation,
        averageCostPrice: h.averageCostPrice,
        wrapperFeePercent: h.wrapperFeePercent,
        confidence: h.confidence,
        enriched: h.enriched,
        comment: h.comment,
      })),
      totalValuation,
      qualityScore: stats.qualityScore,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("patrimoine-portfolio-current", JSON.stringify(payload));
    alert("Portefeuille actuel enregistré. Vous pouvez maintenant lancer l'analyse.");
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-surface-900">
          Récapitulatif du portefeuille
        </h3>
        <p className="text-sm text-surface-500">
          {meta.clientName && `${meta.clientName} — `}
          {meta.portfolioName || "Portefeuille actuel"} — Réf. {meta.referenceDate}
        </p>
      </div>

      {/* Chiffres clés */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KeyFigure
          label="Valorisation totale"
          value={totalValuation > 0 ? `${totalValuation.toLocaleString("fr-FR")} €` : "—"}
          emphasis
        />
        <KeyFigure label="Nombre de lignes" value={String(holdings.length)} />
        <KeyFigure label="Score qualité" value={`${stats.qualityScore}%`} />
        <KeyFigure
          label="Lignes vérifiées"
          value={`${stats.verified} / ${stats.total}`}
        />
      </div>

      {/* Répartitions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Par classe d'actifs */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-base font-semibold text-surface-900">
            Répartition par classe d'actifs
          </h4>
          <div className="space-y-3">
            {byAssetClass.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-surface-700">{item.label}</span>
                  <span className="text-surface-500">
                    {item.count} ligne{item.count > 1 ? "s" : ""} — {(item.weight * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${item.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Par support */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-base font-semibold text-surface-900">
            Répartition par support
          </h4>
          <div className="space-y-3">
            {byWrapper.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-surface-700">{item.label}</span>
                  <span className="text-surface-500">
                    {item.count} ligne{item.count > 1 ? "s" : ""} — {(item.weight * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-accent-500"
                    style={{ width: `${item.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Détail qualité par ligne */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-base font-semibold text-surface-900">
          Détail des positions
        </h4>
        <div className="space-y-2">
          {holdings.map((h, i) => {
            const amount = getHoldingAmount(h);
            const weight = totalValuation > 0 && amount != null ? amount / totalValuation : 0;
            return (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-lg border border-surface-100 px-4 py-2"
              >
                <span className="w-6 text-xs text-surface-400">{i + 1}</span>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${getConfidenceColor(h.confidence)}`}>
                  {getConfidenceLabel(h.confidence)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-surface-900">
                  {h.productName || h.isin || "—"}
                </span>
                {h.assetClass && (
                  <span className="shrink-0 text-xs text-surface-500">
                    {ASSET_CLASS_LABELS[h.assetClass]}
                  </span>
                )}
                {h.wrapperType && (
                  <span className="shrink-0 text-xs text-surface-400">
                    {WRAPPER_TYPE_LABELS[h.wrapperType]}
                  </span>
                )}
                <span className="shrink-0 text-right text-sm font-medium text-surface-900">
                  {amount != null ? `${amount.toLocaleString("fr-FR")} €` : "—"}
                </span>
                <span className="w-12 shrink-0 text-right text-xs text-surface-500">
                  {(weight * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes finales */}
      {stats.errors > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{stats.errors} ligne{stats.errors > 1 ? "s" : ""} en erreur</strong> —
          le portefeuille sera enregistré mais ces lignes seront marquées comme incomplètes.
        </div>
      )}

      {stats.incomplete > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>{stats.incomplete} ligne{stats.incomplete > 1 ? "s" : ""} incomplète{stats.incomplete > 1 ? "s" : ""}</strong> —
          vous pourrez les compléter ultérieurement.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-surface-300 px-4 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100"
        >
          ← Retour à la validation
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="rounded-lg border border-surface-300 px-4 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100"
          >
            Recommencer
          </button>
          <button
            onClick={handleCreateVersion}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Enregistrer le portefeuille actuel
          </button>
        </div>
      </div>
    </div>
  );
}

function KeyFigure({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm text-center">
      <div className={`${emphasis ? "text-2xl" : "text-xl"} font-bold text-surface-900`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-surface-500">{label}</div>
    </div>
  );
}
