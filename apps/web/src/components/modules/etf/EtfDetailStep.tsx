"use client";

import { Card, CardHeader, Button, ScoreBar, VerdictBadge, CommentBlock, DataField } from "@repo/ui";
import type { EtfComparisonResult, EtfAxisScores } from "@repo/core-domain";
import { ETF_VERDICT_LABELS } from "@repo/core-domain";

import type { EtfAction, EtfEntry } from "@/lib/etf-store";

interface EtfDetailStepProps {
  productId: string;
  comparison: EtfComparisonResult;
  entries: EtfEntry[];
  isSelected: boolean;
  dispatch: (action: EtfAction) => void;
}

const AXIS_LABELS: Record<keyof EtfAxisScores, string> = {
  costs: "Coûts",
  performance: "Performance",
  tracking: "Tracking",
  risk: "Risque",
  liquidity: "Liquidité",
  maturity: "Maturité",
};

export function EtfDetailStep({ productId, comparison, entries, isSelected, dispatch }: EtfDetailStepProps) {
  const etfResult = comparison.etfs.find((e) => e.productId === productId);
  const entry = entries.find((e) => e.product?.id === productId);

  if (!etfResult || !entry?.product || !entry.data) {
    return (
      <Card>
        <p className="text-brand-400">Données non disponibles pour cet ETF.</p>
      </Card>
    );
  }

  const { product, data } = entry;
  const { scoring, comments, summary } = etfResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card elevated>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-900">{product.name}</h2>
            <p className="mt-1 text-sm text-brand-500">
              {product.isin} · {data.ticker ?? ""} · {product.currency} ·{" "}
              {data.replicationMethod === "PHYSICAL" ? "Physique" : data.replicationMethod === "SYNTHETIC" ? "Synthétique" : "Échantillonnage"} ·{" "}
              {data.distributionPolicy === "CAPITALIZING" ? "Capitalisant" : "Distribuant"}
            </p>
          </div>
          <VerdictBadge verdict={scoring.verdict} score={scoring.globalScore} />
        </div>
      </Card>

      {/* Score breakdown */}
      <Card>
        <CardHeader title="Scores détaillés" description={`Score global : ${Math.round(scoring.globalScore)}/100`} />
        <div className="space-y-4">
          {(Object.entries(scoring.scores) as Array<[keyof EtfAxisScores, number | null]>).map(
            ([axis, score]) => (
              <ScoreBar
                key={axis}
                label={AXIS_LABELS[axis]}
                score={score ?? 0}
                size="md"
              />
            ),
          )}
        </div>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader title="Commentaires automatiques" />
        {summary && (
          <p className="mb-4 rounded bg-surface-50 p-3 text-sm italic text-brand-600">
            {summary}
          </p>
        )}
        <CommentBlock comments={comments} />
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Coûts et performance" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="TER" value={`${(data.ter * 100).toFixed(2)}%`} />
            <DataField label="Indice répliqué" value={data.indexTracked} />
            <DataField label="Perf. YTD" value={data.returnYtd != null ? `${(data.returnYtd * 100).toFixed(1)}%` : "—"} />
            <DataField label="Perf. 1 an" value={data.return1y != null ? `${(data.return1y * 100).toFixed(1)}%` : "—"} />
            <DataField label="Perf. 3 ans" value={data.return3y != null ? `${(data.return3y * 100).toFixed(1)}%` : "—"} />
            <DataField label="Perf. 5 ans" value={data.return5y != null ? `${(data.return5y * 100).toFixed(1)}%` : "—"} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Risque et liquidité" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="Volatilité 1Y" value={data.volatility1y != null ? `${(data.volatility1y * 100).toFixed(1)}%` : "—"} />
            <DataField label="Sharpe Ratio" value={data.sharpeRatio != null ? data.sharpeRatio.toFixed(2) : "—"} />
            <DataField label="Max Drawdown" value={data.maxDrawdown != null ? `${(data.maxDrawdown * 100).toFixed(1)}%` : "—"} />
            <DataField label="Tracking Error" value={data.trackingError != null ? `${(data.trackingError * 100).toFixed(2)}%` : "—"} />
            <DataField
              label="AUM"
              value={
                data.aum >= 1_000_000_000
                  ? `${(data.aum / 1_000_000_000).toFixed(1)}B€`
                  : `${(data.aum / 1_000_000).toFixed(0)}M€`
              }
            />
            <DataField label="PEA" value={data.peaEligible ? "Oui" : "Non"} />
          </div>
        </Card>
      </div>

      {/* Expositions */}
      {(Object.keys(data.sectorExposure).length > 0 || Object.keys(data.geoExposure).length > 0) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Object.keys(data.sectorExposure).length > 0 && (
            <Card>
              <CardHeader title="Exposition sectorielle" />
              <div className="space-y-2">
                {Object.entries(data.sectorExposure)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([sector, weight]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-brand-700">{sector.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-surface-200">
                          <div
                            className="h-2 rounded-full bg-brand-500"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-brand-500">
                          {(weight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {Object.keys(data.geoExposure).length > 0 && (
            <Card>
              <CardHeader title="Exposition géographique" />
              <div className="space-y-2">
                {Object.entries(data.geoExposure)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([geo, weight]) => (
                    <div key={geo} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-brand-700">{geo.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-surface-200">
                          <div
                            className="h-2 rounded-full bg-accent-500"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-brand-500">
                          {(weight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top Holdings */}
      {data.topHoldings.length > 0 && (
        <Card>
          <CardHeader title="Principales positions" />
          <div className="space-y-2">
            {data.topHoldings.slice(0, 10).map((holding, i) => (
              <div key={i} className="flex items-center justify-between border-b border-surface-100 py-2 last:border-0">
                <span className="text-sm text-brand-800">{holding.name}</span>
                <span className="text-sm font-medium text-brand-600">{(holding.weight * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action */}
      <div className="flex justify-center">
        <Button
          variant={isSelected ? "secondary" : "accent"}
          size="lg"
          onClick={() => {
            dispatch({
              type: "TOGGLE_SELECTION",
              selection: {
                productId,
                name: product.name,
                isin: product.isin ?? "",
                score: scoring.globalScore,
                verdict: scoring.verdict,
                selectionRationale: "",
              },
            });
          }}
        >
          {isSelected ? "✓ Retenu — Retirer de la sélection" : "Retenir cet ETF pour le portefeuille"}
        </Button>
      </div>
    </div>
  );
}
