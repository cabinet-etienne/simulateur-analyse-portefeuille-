import { Card, CardHeader } from "@repo/ui";

export default function ScpiModulePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1>Module SCPI</h1>
      <p className="mt-2 mb-8 text-brand-500">
        Analyse de rendement, qualité locative, diversification et coûts des SCPI
      </p>
      <Card>
        <CardHeader title="En construction" description="Ce module sera disponible en V3" />
      </Card>
    </main>
  );
}
