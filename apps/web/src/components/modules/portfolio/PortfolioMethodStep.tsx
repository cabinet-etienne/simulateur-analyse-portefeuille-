"use client";

import type { PortfolioAction, PortfolioMeta, EntryMethod } from "@/lib/portfolio-store";

interface Props {
  meta: PortfolioMeta;
  dispatch: React.Dispatch<PortfolioAction>;
}

const METHODS: Array<{
  key: EntryMethod;
  title: string;
  description: string;
  icon: string;
  detail: string;
}> = [
  {
    key: "manual",
    title: "Saisie manuelle",
    description: "Ajoutez les lignes une par une",
    icon: "✏️",
    detail: "Idéal quand le client a quelques positions à renseigner. Recherche par ISIN avec enrichissement automatique.",
  },
  {
    key: "csv",
    title: "Import CSV / Excel",
    description: "Déposez un fichier exporté",
    icon: "📄",
    detail: "Importez un relevé de portefeuille. Mapping automatique des colonnes avec correction manuelle.",
  },
  {
    key: "mixed",
    title: "Import + compléments",
    description: "Importez puis complétez manuellement",
    icon: "🔄",
    detail: "Commencez par un import CSV puis ajoutez ou corrigez des lignes manuellement.",
  },
];

export function PortfolioMethodStep({ meta, dispatch }: Props) {
  return (
    <div className="space-y-8">
      {/* Informations client */}
      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-surface-900">
          Informations du portefeuille
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-600">
              Nom du client
            </label>
            <input
              type="text"
              value={meta.clientName}
              onChange={(e) => dispatch({ type: "SET_META", meta: { clientName: e.target.value } })}
              placeholder="ex: M. Dupont"
              className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-600">
              Nom du portefeuille
            </label>
            <input
              type="text"
              value={meta.portfolioName}
              onChange={(e) => dispatch({ type: "SET_META", meta: { portfolioName: e.target.value } })}
              placeholder="ex: Portefeuille principal"
              className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-600">
              Date de référence
            </label>
            <input
              type="date"
              value={meta.referenceDate}
              onChange={(e) => dispatch({ type: "SET_META", meta: { referenceDate: e.target.value } })}
              className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Choix de la méthode */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-surface-900">
          Comment souhaitez-vous renseigner le portefeuille ?
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {METHODS.map((method) => (
            <button
              key={method.key}
              onClick={() => dispatch({ type: "SET_METHOD", method: method.key })}
              className="group rounded-xl border-2 border-surface-200 bg-white p-6 text-left shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
            >
              <div className="mb-3 text-3xl">{method.icon}</div>
              <h4 className="mb-1 text-base font-semibold text-surface-900 group-hover:text-brand-700">
                {method.title}
              </h4>
              <p className="mb-3 text-sm text-surface-500">{method.description}</p>
              <p className="text-xs text-surface-400">{method.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
