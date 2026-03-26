import type {
  AssetClass,
  Currency,
  DataSource,
  InstrumentSubType,
  ProductStatus,
  PortfolioStatus,
  RiskProfile,
  UserRole,
} from "../enums";

// ─── Entités de base ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Instrument financier — un produit disponible sur le marché.
 *
 * Le type `Product` est conservé comme alias pour compatibilité,
 * mais le concept métier est désormais "Instrument".
 *
 * `subType` affine la classification au sein d'une AssetClass :
 * - AssetClass "ETF" → subType "ETF_UCITS"
 * - AssetClass "FUND" → subType "OPCVM_SICAV" | "OPCVM_FCP" | "FUND_OTHER"
 */
export interface Product {
  id: string;
  type: AssetClass;
  subType: InstrumentSubType | null; // null = pas encore classifié (rétrocompat)
  name: string;
  isin: string | null;
  currency: Currency;
  status: ProductStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dataSources: Record<string, FieldSource>;
  tags: string[];
}

/** Alias sémantique — Instrument = Product dans le modèle de données */
export type Instrument = Product;

export interface FieldSource {
  source: DataSource;
  updatedAt: Date;
  updatedBy: string;
}

export interface Portfolio {
  id: string;
  name: string;
  clientName: string;
  riskProfile: RiskProfile;
  investmentHorizonMonths: number;
  objectives: string[];
  constraints: Record<string, unknown>;
  status: PortfolioStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioAllocation {
  id: string;
  portfolioId: string;
  productId: string;
  weight: number;
  amount: number;
  rationale: string;
  addedAt: Date;
}

export interface SharedReport {
  id: string;
  portfolioId: string;
  token: string;
  expiresAt: Date;
  createdBy: string;
  accessedCount: number;
  createdAt: Date;
}

export interface DataAuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  source: DataSource;
  changedBy: string;
  changedAt: Date;
}
