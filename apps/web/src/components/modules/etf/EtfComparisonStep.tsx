"use client";

import {
  Card,
  CardHeader,
  Button,
  RadarChart,
  ComparisonTable,
  ScoreBar,
  VerdictBadge,
  CommentBlock,
} from "@repo/ui";
import type { EtfComparisonResult, EtfSelection, EtfAxisScores, Comment } from "@repo/core-domain";
import { ETF_VERDICT_LABELS } from "@repo/core-domain";

import type { EtfAction, EtfEntry } from "@/lib/etf-store";

interface EtfComparisonStepProps {
  comparison: EtfComparisonResult;
  entries: EtfEntry[];
  selections: EtfSelection[];
  dispatch: (action: EtfAction) => void;
}

const RADAR_COLORS = ["#102a43", "#d4981c", "#2d6a4f", "#9b2c2c", "#627d98"];

const AXIS_LABELS: Record<keyof EtfAxisScores, string> = {
  costs: "Coûts",
  performance: "Performance",
  tracking: "Tracking",
  risk: "Risque",
  liquidity: "Liquidité",
  maturity: "Maturité",
};

export function EtfComparisonStep({ comparison, entries, selections, dispatch }: EtfComparisonStepProps) {
  const radarAxes = Object.entries(AXIS_LABELS).map(([key, label]) => ({
    key,
    label,
    max: 100,
  }));

  const radarDatasets = comparison.etfs.map((etf, i) => {
    const entry = entries.find((e) => e.product?.id === etf.productId);
    const scores = etf.scoring.scores;
    return {
      label: entry?.product?.name ?? `ETF ${i + 1}`,
      values: {
        costs: scores.costs,
        performance: scores.performance ?? 0,
        tracking: scores.tracking ?? 0,
        risk: scores.risk ?? 0,
        liquidity: scores.liquidity,
        maturity: scores.maturity,
      },
      color: RADAR_COLORS[i] ?? "#627d98",
    };
  });

  // Build comparison table rows
  const tableColumns = comparison.ranking.map((r) => ({
    id: r.productId,
    header: r.name,
    highlight: r.rank === 1,
  }));

  const tableRows = buildComparisonRows(comparison, entries);

  return (
    <div className="space-y-6">
      {/* Ranking */}
      <Card elevated>
        <CardHeader title="Classement" description={`${comparison.ranking.length} ETF comparés`} />
        <div className="space-y-3">
          {comparison.ranking.map((ranked, i) => {
            const etfResult = comparison.etfs.find((e) => e.productId === ranked.productId);
            const isSelected = selections.some((s) => s.productId === ranked.productId);

            return (
              <div
                key={ranked.productId}
                className={`flex items-center justify-between rounded p-4 ${
                  i === 0 ? "bg-brand-50 ring-1 ring-brand-200" : "bg-surface-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${i === 0 ? "text-accent-500" : "text-brand-400"}`}>
                    {i === 0 ? "1er" : `${i + 1}e`}
                  </span>
                  <div>
                    <button
                      onClick={() => dispatch({ type: "SET_DETAIL", productId: ranked.productId })}
                      className="font-medium text-brand-900 hover:text-brand-700 hover:underline"
                    >
                      {ranked.name}
                    </button>
                    {etfResult && (
                      <VerdictBadge
                        verdict={etfResult.scoring.verdict}
                        score={etfResult.scoring.globalScore}
                        className="ml-3"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreBar
                    score={ranked.score}
                    size="sm"
                    showValue={false}
                    className="w-32"
                  />
                  <Button
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      const entry = entries.find((e) => e.product?.id === ranked.productId);
                      if (entry?.product && etfResult) {
                        dispatch({
                          type: "TOGGLE_SELECTION",
                          selection: {
                            productId: ranked.productId,
                            name: ranked.name,
                            isin: entry.product.isin ?? "",
                            score: ranked.score,
                            verdict: etfResult.scoring.verdict,
                            selectionRationale: "",
                          },
                        });
                      }
                    }}
                  >
                    {isSelected ? "✓ Retenu" : "Retenir"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader title="Profil multi-critères" description="Score par axe d'analyse" />
        <div className="flex justify-center">
          <RadarChart datasets={radarDatasets} axes={radarAxes} size={380} />
        </div>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader
          title="Tableau comparatif"
          description="★ = meilleur du groupe pour ce critère"
        />
        <ComparisonTable columns={tableColumns} rows={tableRows} />
      </Card>

      {/* Comparative Summary */}
      <Card>
        <CardHeader title="Synthèse comparative" />
        <p className="text-sm leading-relaxed text-brand-700">{comparison.comparativeSummary}</p>
      </Card>

      {/* Comments per ETF */}
      {comparison.etfs.map((etf) => {
        const entry = entries.find((e) => e.product?.id === etf.productId);
        return (
          <Card key={etf.productId}>
            <CardHeader
              title={`Commentaires — ${entry?.product?.name ?? "ETF"}`}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "SET_DETAIL", productId: etf.productId })}
                >
                  Voir la fiche →
                </Button>
              }
            />
            <CommentBlock comments={etf.comments} />
          </Card>
        );
      })}
    </div>
  );
}

// ─── Table row builder ──────────────────────────────────────

function buildComparisonRows(
  comparison: EtfComparisonResult,
  entries: EtfEntry[],
): Array<{
  label: string;
  unit?: string;
  values: Record<string, { display: string; isBest?: boolean }>;
}> {
  const rows: Array<{
    label: string;
    unit?: string;
    values: Record<string, { display: string; isBest?: boolean }>;
  }> = [];

  // Helper to find best value
  function addRow(
    label: string,
    unit: string,
    getter: (entry: EtfEntry) => string | null,
    comparator: "min" | "max" | "none" = "none",
  ) {
    const values: Record<string, { display: string; isBest?: boolean }> = {};
    const numericValues: Array<{ id: string; val: number }> = [];

    for (const entry of entries) {
      if (!entry.product || !entry.data) continue;
      const display = getter(entry);
      if (display !== null) {
        values[entry.product.id] = { display };
        const parsed = parseFloat(display.replace(/[^0-9.-]/g, ""));
        if (!isNaN(parsed)) {
          numericValues.push({ id: entry.product.id, val: parsed });
        }
      }
    }

    // Mark best
    if (comparator !== "none" && numericValues.length > 0) {
      const best = comparator === "min"
        ? numericValues.reduce((a, b) => (a.val < b.val ? a : b))
        : numericValues.reduce((a, b) => (a.val > b.val ? a : b));
      const cell = values[best.id];
      if (cell) {
        cell.isBest = true;
      }
    }

    rows.push({ label, unit, values });
  }

  addRow("TER", "%", (e) => e.data ? `${(e.data.ter * 100).toFixed(2)}` : null, "min");
  addRow("AUM", "€", (e) => {
    if (!e.data) return null;
    return e.data.aum >= 1_000_000_000
      ? `${(e.data.aum / 1_000_000_000).toFixed(1)}B`
      : `${(e.data.aum / 1_000_000).toFixed(0)}M`;
  }, "max");
  addRow("Tracking Error", "%", (e) => e.data?.trackingError != null ? `${(e.data.trackingError * 100).toFixed(2)}` : null, "min");
  addRow("Perf 1 an", "%", (e) => e.data?.return1y != null ? `${(e.data.return1y * 100).toFixed(1)}` : null, "max");
  addRow("Perf 3 ans", "%", (e) => e.data?.return3y != null ? `${(e.data.return3y * 100).toFixed(1)}` : null, "max");
  addRow("Volatilité 1 an", "%", (e) => e.data?.volatility1y != null ? `${(e.data.volatility1y * 100).toFixed(1)}` : null, "min");
  addRow("Sharpe", "", (e) => e.data?.sharpeRatio != null ? `${e.data.sharpeRatio.toFixed(2)}` : null, "max");
  addRow("Max Drawdown", "%", (e) => e.data?.maxDrawdown != null ? `${(e.data.maxDrawdown * 100).toFixed(1)}` : null, "max");
  addRow("Réplication", "", (e) => {
    if (!e.data) return null;
    return e.data.replicationMethod === "PHYSICAL" ? "Physique" : e.data.replicationMethod === "SYNTHETIC" ? "Synthétique" : "Échantillonnage";
  });
  addRow("PEA", "", (e) => e.data?.peaEligible ? "Oui" : "Non");

  // Score row
  const scoreValues: Record<string, { display: string; isBest?: boolean }> = {};
  let bestScore = -1;
  let bestId = "";
  for (const etf of comparison.etfs) {
    scoreValues[etf.productId] = { display: `${Math.round(etf.scoring.globalScore)}/100` };
    if (etf.scoring.globalScore > bestScore) {
      bestScore = etf.scoring.globalScore;
      bestId = etf.productId;
    }
  }
  const bestCell = scoreValues[bestId];
  if (bestCell) {
    bestCell.isBest = true;
  }
  rows.push({ label: "Score global", values: scoreValues });

  return rows;
}
