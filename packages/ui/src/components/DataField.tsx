import type { ReactNode } from "react";

import { cn } from "./cn";

interface DataFieldProps {
  label: string;
  value: ReactNode;
  unit?: string;
  source?: string;
  className?: string;
}

/**
 * Champ de donnée avec label, valeur, unité et indicateur de source.
 * Composant de base pour l'affichage des métriques dans les fiches produit.
 */
export function DataField({ label, value, unit, source, className }: DataFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-sm text-brand-500">{label}</dt>
      <dd className="text-lg font-medium text-brand-900">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-brand-400">{unit}</span>}
      </dd>
      {source && (
        <span className="text-2xs text-brand-400">
          Source : {source}
        </span>
      )}
    </div>
  );
}
