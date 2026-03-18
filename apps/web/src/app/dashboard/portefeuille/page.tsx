import { Card, CardHeader } from "@repo/ui";

export default function PortfolioModulePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1>Consolidation Portefeuille</h1>
      <p className="mt-2 mb-8 text-brand-500">
        Agrégez les produits retenus, analysez l&apos;allocation et générez un rapport client
      </p>
      <Card>
        <CardHeader title="En construction" description="Ce module sera disponible en V2" />
      </Card>
    </main>
  );
}
