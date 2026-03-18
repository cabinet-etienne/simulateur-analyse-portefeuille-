import { Card, CardHeader } from "@repo/ui";

export default function ObligationsModulePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1>Module Obligations</h1>
      <p className="mt-2 mb-8 text-brand-500">
        Analyse obligataire : rendement, sensibilité, crédit et scénarios de taux
      </p>
      <Card>
        <CardHeader title="En construction" description="Ce module sera disponible en V2" />
      </Card>
    </main>
  );
}
