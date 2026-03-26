import type { EtfData, Product } from "@repo/core-domain";
import { ETF_REFERENCE_DB, type EtfReferenceEntry } from "./reference-data";

export interface EnrichmentResult {
  found: boolean;
  product: Partial<Product> | null;
  data: Partial<EtfData> | null;
  enrichedFields: string[];
}

/**
 * Look up an ISIN in the local reference database.
 * Returns pre-filled product and data if found.
 */
export function enrichByIsin(isin: string): EnrichmentResult {
  const normalized = isin.trim().toUpperCase();
  const entry: EtfReferenceEntry | undefined = ETF_REFERENCE_DB[normalized];

  if (!entry) {
    return { found: false, product: null, data: null, enrichedFields: [] };
  }

  const enrichedFields: string[] = [];

  // Collect product fields that are populated
  for (const [key, value] of Object.entries(entry.product)) {
    if (value !== null && value !== undefined) {
      enrichedFields.push(`product.${key}`);
    }
  }

  // Collect data fields that are populated
  for (const [key, value] of Object.entries(entry.data)) {
    if (value !== null && value !== undefined) {
      enrichedFields.push(`data.${key}`);
    }
  }

  return {
    found: true,
    product: entry.product as Partial<Product>,
    data: entry.data as Partial<EtfData>,
    enrichedFields,
  };
}

/**
 * Search reference database by name (partial match, case insensitive).
 * Returns matching entries for autocomplete.
 */
export function searchEtfByName(
  query: string,
  limit: number = 10,
): Array<{ isin: string; name: string; provider: string | null }> {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const results: Array<{ isin: string; name: string; provider: string | null }> = [];

  for (const [isin, entry] of Object.entries(ETF_REFERENCE_DB)) {
    const nameMatch = entry.product.name.toLowerCase().includes(normalizedQuery);
    const tickerMatch =
      entry.data.ticker?.toLowerCase().includes(normalizedQuery) ?? false;
    const providerMatch =
      entry.data.provider?.toLowerCase().includes(normalizedQuery) ?? false;
    const indexMatch =
      entry.data.indexTracked.toLowerCase().includes(normalizedQuery);

    if (nameMatch || tickerMatch || providerMatch || indexMatch) {
      results.push({
        isin,
        name: entry.product.name,
        provider: entry.data.provider,
      });
    }

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

/**
 * Get list of all available ISINs in the reference database.
 */
export function getAvailableIsins(): string[] {
  return Object.keys(ETF_REFERENCE_DB);
}
