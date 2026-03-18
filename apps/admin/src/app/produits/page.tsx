import { Card, CardHeader, Button, Badge } from "@repo/ui";
import { ASSET_CLASS_LABELS } from "@repo/core-domain";

export default function AdminProductsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1>Gestion des produits</h1>
          <p className="mt-1 text-brand-500">
            Créez, éditez et validez les produits de toutes les classes d&apos;actifs
          </p>
        </div>
        <Button variant="primary">Nouveau produit</Button>
      </div>

      <Card>
        <CardHeader title="Liste des produits" description="Tous les produits enregistrés" />

        {/* Table scaffold — sera remplacée par un vrai composant DataTable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="px-4 py-3 font-medium text-brand-500">Nom</th>
                <th className="px-4 py-3 font-medium text-brand-500">Classe</th>
                <th className="px-4 py-3 font-medium text-brand-500">ISIN</th>
                <th className="px-4 py-3 font-medium text-brand-500">Statut</th>
                <th className="px-4 py-3 font-medium text-brand-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-surface-100">
                <td className="px-4 py-3 text-brand-400" colSpan={5}>
                  Aucun produit enregistré. Créez votre premier produit pour commencer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
