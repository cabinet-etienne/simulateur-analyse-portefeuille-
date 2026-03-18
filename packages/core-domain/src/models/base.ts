import type {
  AssetClass,
  Currency,
  DataSource,
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

export interface Product {
  id: string;
  type: AssetClass;
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
