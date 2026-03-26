"use client";

import { cn } from "./cn";

interface RadarChartProps {
  datasets: Array<{
    label: string;
    values: Record<string, number>;
    color: string;
  }>;
  axes: Array<{ key: string; label: string; max: number }>;
  size?: number;
  className?: string;
}

/**
 * Radar chart SVG pour la comparaison multi-critères.
 * Rendu purement SVG, sans dépendance externe.
 */
export function RadarChart({ datasets, axes, size = 300, className }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const angleStep = (2 * Math.PI) / axes.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  function getPoint(axisIndex: number, value: number, max: number): { x: number; y: number } {
    const angle = axisIndex * angleStep - Math.PI / 2;
    const r = (value / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function getPolygonPoints(values: Record<string, number>): string {
    return axes
      .map((axis, i) => {
        const val = values[axis.key] ?? 0;
        const pt = getPoint(i, val, axis.max);
        return `${pt.x},${pt.y}`;
      })
      .join(" ");
  }

  return (
    <div className={cn("inline-block", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid levels */}
        {levels.map((level) => (
          <polygon
            key={level}
            points={axes
              .map((_, i) => {
                const pt = getPoint(i, level * 100, 100);
                return `${pt.x},${pt.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#dee2e6"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const pt = getPoint(i, 100, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="#dee2e6"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygons */}
        {datasets.map((dataset) => (
          <polygon
            key={dataset.label}
            points={getPolygonPoints(dataset.values)}
            fill={dataset.color}
            fillOpacity="0.15"
            stroke={dataset.color}
            strokeWidth="2"
          />
        ))}

        {/* Data points */}
        {datasets.map((dataset) =>
          axes.map((axis, i) => {
            const val = dataset.values[axis.key] ?? 0;
            const pt = getPoint(i, val, axis.max);
            return (
              <circle
                key={`${dataset.label}-${axis.key}`}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill={dataset.color}
              />
            );
          }),
        )}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const pt = getPoint(i, 115, 100);
          return (
            <text
              key={axis.key}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-brand-600 text-[11px]"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {datasets.map((dataset) => (
          <div key={dataset.label} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: dataset.color }}
            />
            <span className="text-xs text-brand-600">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
