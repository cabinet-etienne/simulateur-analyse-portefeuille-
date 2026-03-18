import { Card, CardHeader } from "@repo/ui";

export default function EtfModulePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1>Module ETF</h1>
        <p className="mt-2 text-brand-500">
          Analysez, comparez et sélectionnez des ETF pour vos portefeuilles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Saisie / Import"
            description="Ajoutez un ETF manuellement ou importez un fichier"
          />
          {/* Formulaire de saisie ETF — à implémenter en V1 */}
          <p className="text-sm text-brand-400">Module en cours de développement</p>
        </Card>

        <Card>
          <CardHeader
            title="Analyse"
            description="Analyse détaillée d'un ETF sélectionné"
          />
          <p className="text-sm text-brand-400">Sélectionnez un ETF pour lancer l&apos;analyse</p>
        </Card>

        <Card>
          <CardHeader
            title="Comparaison"
            description="Comparez jusqu'à 5 ETF côte à côte"
          />
          <p className="text-sm text-brand-400">Sélectionnez au moins 2 ETF à comparer</p>
        </Card>
      </div>
    </main>
  );
}
