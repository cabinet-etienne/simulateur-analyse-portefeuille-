"use client";

import { useMemo } from "react";
import { ASSET_CLASS_LABELS, WRAPPER_TYPE_LABELS } from "@repo/core-domain";
import { enrichByIsin } from "@repo/adapters-etf";
import type { AssetClass } from "@repo/core-domain";

import type { PortfolioAction, HoldingDraft } from "@/lib/portfolio-store";
import {
  getConfidenceLabel,
  getConfidenceColor,
  getHoldingAmount,
  getTotalValuation,
  getQualityStats,
} from "@/lib/portfolio-store";
import { detectDuplicates } from "@/lib/portfolio-import";

interface Props {
  holdings: HoldingDraft[];
  dispatch: React.Dispatch<PortfolioAction>;
  onNext: () => void;
  onBack: () => void;
}

export function PortfolioReviewStep({ holdings, dispatch, onNext, onBack }: Props) {
  const stats = useMemo(() => getQualityStats(holdings), [holdings]);
  const totalValuation = useMemo(() => getTotalValuation(holdings), [holdings]);
  const duplicates = useMemo(() => detectDuplicates(holdings), [holdings]);

  const handleEnrichAll = () => {
    for (const h of holdings) {
      if (h.isin && !h.enriched) {
        const result = enrichByIsin(h.isin);
        if (result.found && result.product) {
          dispatch({
            type: "ENRICH_HOLDING",
            id: h.id,
            data: {
              productName: result.product.name ?? h.productName,
              assetClass: (result.product.type as AssetClass) ?? h.assetClass ?? "ETF",
              subType: null,
              matchedProductId: h.isin,
            },
          });
        }
      }
    }
  };

  const handleValidateAll = () => {
    dispatch({ type: "VALIDATE_ALL" });
  };

  const hasBlockingErrors = holdings.some((h) => h.confidence === "ERROR");

  return (
    <div className="space-y-6">
      {/* Tableau de bord qualité */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900">Qualité des données</h3>
          <div className="flex gap-2">
            <button
              onClick={handleEnrichAll}
              className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
            >
              Enrichir automatiquement
            </button>
            <button
              onClick={handleValidateAll}
              className="rounded-lg border border-surface-300 px-3 py-1.5 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-100"
            >
              Revalider tout
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <StatCard label="Total lignes" value={stats.total} color="text-surface-900" />
          <StatCard label="Vérifiées" value={stats.verified} color="text-emerald-600" />
          <StatCard label="Déclarées" value={stats.declared} color="text-blue-600" />
          <StatCard label="Incomplètes" value={stats.incomplete} color="text-amber-600" />
          <StatCard label="En erreur" value={stats.errors} color="text-red-600" />
        </div>

        {/* Barre de qualité */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-surface-500">Score de qualité</span>
            <span className="font-semibold text-surface-900">{stats.qualityScore}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-100">
            <div
              className={`h-full rounded-full transition-all ${
                stats.qualityScore >= 80
                  ? "bg-emerald-500"
                  : stats.qualityScore >= 50
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${stats.qualityScore}%` }}
            />
          </div>
        </div>

        {/* Valorisation totale */}
        <div className="mt-4 rounded-lg bg-surface-50 px-4 py-3">
          <span className="text-sm text-surface-500">Valorisation totale estimée : </span>
          <span className="text-lg font-semibold text-surface-900">
            {totalValuation > 0 ? `${totalValuation.toLocaleString("fr-FR")} €` : "Non calculable"}
          </span>
        </div>
      </div>

      {/* Alertes */}
      {duplicates.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            {duplicates.length} doublon{duplicates.length > 1 ? "s" : ""} détecté{duplicates.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-amber-700">
            Même ISIN et même support. Vérifiez qu'il ne s'agit pas de doublons.
          </p>
        </div>
      )}

      {/* Tableau de review */}
      <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="px-4 py-3 text-xs font-medium text-surface-500">#</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Statut</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">ISIN</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Produit</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Support</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Valorisation</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500">Alertes</th>
                <th className="px-4 py-3 text-xs font-medium text-surface-500"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <ReviewRow key={h.id} holding={h} index={i} dispatch={dispatch} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-surface-300 px-4 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100"
        >
          ← Retour à la saisie
        </button>
        <div className="flex items-center gap-3">
          {hasBlockingErrors && (
            <span className="text-xs text-red-600">
              {stats.errors} ligne{stats.errors > 1 ? "s" : ""} en erreur — corrigez-les ou supprimez-les
            </span>
          )}
          <button
            onClick={onNext}
            disabled={holdings.length === 0}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasBlockingErrors ? "Continuer malgré les erreurs →" : "Valider le portefeuille →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants ───────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-surface-100 bg-surface-50 px-4 py-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-surface-500">{label}</div>
    </div>
  );
}

function ReviewRow({
  holding,
  index,
  dispatch,
}: {
  holding: HoldingDraft;
  index: number;
  dispatch: React.Dispatch<PortfolioAction>;
}) {
  const amount = getHoldingAmount(holding);
  const confidenceClass = getConfidenceColor(holding.confidence);
  const isDuplicate = false; // TODO: pass from parent if needed

  return (
    <tr className={`border-b border-surface-100 ${
      holding.confidence === "ERROR" ? "bg-red-50/50" : ""
    }`}>
      <td className="px-4 py-2.5 text-xs text-surface-400">{index + 1}</td>
      <td className="px-4 py-2.5">
        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${confidenceClass}`}>
          {getConfidenceLabel(holding.confidence)}
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono text-xs text-surface-600">
        {holding.isin || "—"}
      </td>
      <td className="max-w-[200px] truncate px-4 py-2.5 text-sm text-surface-900">
        {holding.productName || <span className="text-surface-400">Non renseigné</span>}
      </td>
      <td className="px-4 py-2.5 text-xs text-surface-600">
        {holding.assetClass ? ASSET_CLASS_LABELS[holding.assetClass] : "—"}
      </td>
      <td className="px-4 py-2.5 text-xs text-surface-600">
        {holding.wrapperType ? WRAPPER_TYPE_LABELS[holding.wrapperType] : "—"}
      </td>
      <td className="px-4 py-2.5 text-right text-sm font-medium text-surface-900">
        {amount != null ? `${amount.toLocaleString("fr-FR")} €` : "—"}
      </td>
      <td className="px-4 py-2.5">
        {holding.errors.length > 0 && (
          <span className="text-xs text-red-600" title={holding.errors.map((e) => e.message).join(", ")}>
            {holding.errors.length} erreur{holding.errors.length > 1 ? "s" : ""}
          </span>
        )}
        {holding.errors.length === 0 && holding.warnings.length > 0 && (
          <span className="text-xs text-amber-600" title={holding.warnings.join(", ")}>
            {holding.warnings.length} alerte{holding.warnings.length > 1 ? "s" : ""}
          </span>
        )}
      </td>
      <td className="px-4 py-2.5">
        <button
          onClick={() => dispatch({ type: "REMOVE_HOLDING", id: holding.id })}
          className="rounded p-1 text-surface-400 hover:bg-red-50 hover:text-red-500"
          title="Supprimer"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
