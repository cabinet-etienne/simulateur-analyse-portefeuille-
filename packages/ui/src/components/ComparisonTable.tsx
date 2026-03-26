"use client";

import { cn } from "./cn";

interface ComparisonColumn {
  id: string;
  header: string;
  highlight?: boolean;
}

interface ComparisonRow {
  label: string;
  unit?: string;
  values: Record<string, { display: string; isBest?: boolean }>;
}

interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

/**
 * Tableau comparatif multi-colonnes avec mise en valeur du meilleur par ligne.
 */
export function ComparisonTable({ columns, rows, className }: ComparisonTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-surface-0 px-4 py-3 text-left font-medium text-brand-500" />
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "px-4 py-3 text-center font-medium",
                  col.highlight
                    ? "bg-brand-50 text-brand-900"
                    : "text-brand-600",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={cn(
                "border-t border-surface-100",
                i % 2 === 0 ? "bg-surface-0" : "bg-surface-50",
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-medium text-brand-700">
                {row.label}
                {row.unit && (
                  <span className="ml-1 text-xs text-brand-400">({row.unit})</span>
                )}
              </td>
              {columns.map((col) => {
                const cell = row.values[col.id];
                return (
                  <td
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-center",
                      col.highlight ? "bg-brand-50/50" : "",
                      cell?.isBest
                        ? "font-semibold text-semantic-success"
                        : "text-brand-800",
                    )}
                  >
                    {cell?.display ?? "—"}
                    {cell?.isBest && (
                      <span className="ml-1 text-xs text-semantic-success">★</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
