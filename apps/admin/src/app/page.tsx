import { Card, CardHeader } from "@repo/ui";

export default function AdminHomePage() {
  return (
    <div className="p-8">
      <h1 className="mb-2">Console d&apos;administration</h1>
      <p className="mb-8 text-brand-500">
        Gestion des produits, utilisateurs et référentiels
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader title="Produits" description="Créer, éditer, valider, archiver" />
          <p className="text-2xl font-semibold text-brand-900">—</p>
          <p className="text-sm text-brand-400">produits enregistrés</p>
        </Card>

        <Card>
          <CardHeader title="Utilisateurs" description="Gestion des comptes et rôles" />
          <p className="text-2xl font-semibold text-brand-900">—</p>
          <p className="text-sm text-brand-400">utilisateurs actifs</p>
        </Card>

        <Card>
          <CardHeader title="Audit Log" description="Historique des modifications" />
          <p className="text-2xl font-semibold text-brand-900">—</p>
          <p className="text-sm text-brand-400">entrées récentes</p>
        </Card>

        <Card>
          <CardHeader title="Rapports" description="Rapports générés" />
          <p className="text-2xl font-semibold text-brand-900">—</p>
          <p className="text-sm text-brand-400">rapports ce mois</p>
        </Card>
      </div>
    </div>
  );
}
