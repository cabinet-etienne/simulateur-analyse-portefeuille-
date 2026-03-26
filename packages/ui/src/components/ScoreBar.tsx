import { cn } from "./cn";

interface ScoreBarProps {
  score: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-600";
  if (score >= 70) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function ScoreBar({ score, max = 100, label, showValue = true, size = "md", className }: ScoreBarProps) {
  const percentage = Math.min((score / max) * 100, 100);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-brand-600">{label}</span>}
          {showValue && (
            <span className={cn("text-sm font-semibold", getScoreTextColor(score))}>
              {Math.round(score)}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-200", heights[size])}>
        <div
          className={cn("rounded-full transition-all duration-500", heights[size], getScoreColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold text-white",
        getScoreColor(score),
        className,
      )}
    >
      {Math.round(score)}
    </span>
  );
}

export { getScoreColor, getScoreTextColor };
