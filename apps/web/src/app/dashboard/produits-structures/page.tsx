import { Card, CardHeader } from "@repo/ui";

export default function StructuredModulePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1>Module Produits Structurés</h1>
      <p className="mt-2 mb-8 text-brand-500">
        Analyse de payoff, scénarios, barrières et coûts des produits structurés
      </p>
      <Card>
        <CardHeader title="En construction" description="Ce module sera disponible en V2" />
      </Card>
    </main>
  );
}
