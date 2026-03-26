"use client";

import { Card, CardHeader, Button, VerdictBadge, Badge } from "@repo/ui";
import type { EtfSelection } from "@repo/core-domain";

import type { EtfAction } from "@/lib/etf-store";

interface EtfSelectionStepProps {
  selections: EtfSelection[];
  dispatch: (action: EtfAction) => void;
}

export function EtfSelectionStep({ selections, dispatch }: EtfSelectionStepProps) {
  if (selections.length === 0) {
    return (
      <Card>
        <CardHeader title="Aucun ETF retenu" description="Retournez au comparatif pour sélectionner des ETF" />
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "SET_STEP", step: "comparison" })}
        >
          ← Retour au comparatif
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card elevated>
        <CardHeader
          title="ETF retenus pour le portefeuille"
          description={`${selections.length} ETF sélectionné${selections.length > 1 ? "s" : ""}`}
        />

        <div className="space-y-4">
          {selections.map((selection) => (
            <div
              key={selection.productId}
              className="flex items-center justify-between rounded border border-surface-200 p-4"
            >
              <div className="flex items-center gap-4">
                <Badge variant="positive">✓</Badge>
                <div>
                  <p className="font-medium text-brand-900">{selection.name}</p>
                  <p className="text-xs text-brand-400">{selection.isin}</p>
                </div>
                <VerdictBadge verdict={selection.verdict} score={selection.score} />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "REMOVE_SELECTION", productId: selection.productId })}
              >
                Retirer
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-generated justification */}
      <Card>
        <CardHeader title="Justification automatique" />
        <p className="text-sm leading-relaxed text-brand-700">
          {generateSelectionJustification(selections)}
        </p>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "SET_STEP", step: "comparison" })}
        >
          ← Nouvelle comparaison
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            // Transmission au module portefeuille
            // Stocke les sélections dans le localStorage pour le module portefeuille
            const payload = {
              source: "etf-module",
              selections: selections.map((s) => ({
                productId: s.productId,
                name: s.name,
                isin: s.isin,
                score: s.score,
                verdict: s.verdict,
                assetClass: "ETF",
              })),
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem("patrimoine-etf-selections", JSON.stringify(payload));
            window.location.href = "/dashboard/portefeuille";
          }}
        >
          Transmettre au portefeuille →
        </Button>
      </div>
    </div>
  );
}

function generateSelectionJustification(selections: EtfSelection[]): string {
  if (selections.length === 0) return "";

  const parts = selections.map((s) => {
    const strengths: string[] = [];
    if (s.score >= 85) strengths.push("son excellent rapport qualité/prix");
    else if (s.score >= 70) strengths.push("son bon profil global");
    else strengths.push("des caractéristiques spécifiques intéressantes");

    return `${s.name} retenu pour ${strengths.join(" et ")} (score ${Math.round(s.score)}/100).`;
  });

  return parts.join(" ");
}
