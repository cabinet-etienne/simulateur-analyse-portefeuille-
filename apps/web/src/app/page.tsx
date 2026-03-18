import { Card, CardHeader, Button } from "@repo/ui";
import { ASSET_CLASS_LABELS } from "@repo/core-domain";

const modules = [
  { key: "ETF" as const, href: "/dashboard/etf", description: "Analyse et comparaison d'ETF" },
  { key: "BOND" as const, href: "/dashboard/obligations", description: "Analyse obligataire" },
  { key: "STRUCTURED" as const, href: "/dashboard/produits-structures", description: "Analyse de produits structurés" },
  { key: "SCPI" as const, href: "/dashboard/scpi", description: "Analyse de SCPI" },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
          Patrimoine Platform
        </h1>
        <p className="mt-2 text-lg text-brand-500">
          Plateforme d&apos;analyse patrimoniale modulaire
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modules.map((mod) => (
          <Card key={mod.key}>
            <CardHeader
              title={ASSET_CLASS_LABELS[mod.key]}
              description={mod.description}
            />
            <Button variant="outline" size="sm">
              Accéder au module
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card elevated>
          <CardHeader
            title="Consolidation Portefeuille"
            description="Agrégez vos produits retenus et générez un rapport client"
          />
          <Button variant="primary" size="md">
            Construire un portefeuille
          </Button>
        </Card>
      </div>
    </main>
  );
}
