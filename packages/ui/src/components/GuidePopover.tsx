import type { ReactNode } from "react";

import type { GuideEntry } from "@repo/guides";

import { cn } from "./cn";

interface GuidePopoverProps {
  guide: GuideEntry;
  children: ReactNode;
  className?: string;
}

/**
 * Composant de guide contextuel.
 * Affiche une icône ? qui révèle le guide au clic/hover.
 *
 * Scaffold : rendu statique. L'interaction (popover/dialog) sera ajoutée en V1.
 */
export function GuidePopover({ guide, children, className }: GuidePopoverProps) {
  return (
    <div className={cn("relative inline-flex items-center gap-1.5", className)}>
      {children}
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-2xs text-brand-600 hover:bg-brand-200"
        aria-label="Aide contextuelle"
        title={guide.definition}
      >
        ?
      </button>
    </div>
  );
}

/**
 * Panneau de guide contextuel complet (pour affichage en sidebar ou modal).
 */
export function GuidePanel({ guide }: { guide: GuideEntry }) {
  return (
    <div className="space-y-4 rounded bg-surface-50 p-4">
      <div>
        <h4 className="text-sm font-medium text-brand-900">Définition</h4>
        <p className="mt-1 text-sm text-brand-700">{guide.definition}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-brand-900">Où trouver cette donnée</h4>
        <p className="mt-1 text-sm text-brand-700">{guide.source}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-brand-900">Interprétation</h4>
        <p className="mt-1 text-sm text-brand-700">{guide.interpretation}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-brand-900">Exemple</h4>
        <p className="mt-1 text-sm italic text-brand-600">{guide.example}</p>
      </div>
    </div>
  );
}
