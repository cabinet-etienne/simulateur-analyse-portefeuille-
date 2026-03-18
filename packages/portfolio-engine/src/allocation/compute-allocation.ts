import type { AllocationBreakdown, AssetClass, Product } from "@repo/core-domain";

interface AllocationInput {
  product: Product;
  weight: number;
  geoExposure?: Record<string, number>;
  sectorExposure?: Record<string, number>;
}

/**
 * Calcule la répartition consolidée du portefeuille.
 * Agrège les expositions géographiques et sectorielles pondérées par le poids de chaque produit.
 */
export function computeAllocation(inputs: AllocationInput[]): AllocationBreakdown {
  const byAssetClass = {} as Record<AssetClass, number>;
  const byGeography: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};

  for (const input of inputs) {
    // Allocation par classe d'actifs
    const assetClass = input.product.type;
    byAssetClass[assetClass] = (byAssetClass[assetClass] ?? 0) + input.weight;

    // Allocation par devise
    const currency = input.product.currency;
    byCurrency[currency] = (byCurrency[currency] ?? 0) + input.weight;

    // Allocation géographique pondérée
    if (input.geoExposure) {
      for (const [geo, exposure] of Object.entries(input.geoExposure)) {
        byGeography[geo] = (byGeography[geo] ?? 0) + exposure * input.weight;
      }
    }

    // Allocation sectorielle pondérée
    if (input.sectorExposure) {
      for (const [sector, exposure] of Object.entries(input.sectorExposure)) {
        bySector[sector] = (bySector[sector] ?? 0) + exposure * input.weight;
      }
    }
  }

  return { byAssetClass, byGeography, bySector, byCurrency };
}
