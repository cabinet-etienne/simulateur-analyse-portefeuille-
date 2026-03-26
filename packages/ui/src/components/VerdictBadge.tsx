import type { EtfVerdict } from "@repo/core-domain";
import { ETF_VERDICT_LABELS } from "@repo/core-domain";

import { cn } from "./cn";

const verdictStyles: Record<EtfVerdict, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-800",
  BON: "bg-green-100 text-green-800",
  CORRECT: "bg-amber-100 text-amber-800",
  PASSABLE: "bg-orange-100 text-orange-800",
  A_EVITER: "bg-red-100 text-red-800",
};

interface VerdictBadgeProps {
  verdict: EtfVerdict;
  score: number;
  className?: string;
}

export function VerdictBadge({ verdict, score, className }: VerdictBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        verdictStyles[verdict],
        className,
      )}
    >
      {Math.round(score)}/100
      <span className="font-medium">{ETF_VERDICT_LABELS[verdict]}</span>
    </span>
  );
}
