// ─── Classes d'actifs ───────────────────────────────────────────────

export type AssetClass = "ETF" | "BOND" | "STRUCTURED" | "SCPI" | "PRIVATE_EQUITY";

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  ETF: "ETF",
  BOND: "Obligation",
  STRUCTURED: "Produit Structuré",
  SCPI: "SCPI",
  PRIVATE_EQUITY: "Private Equity",
};

// ─── Statuts ────────────────────────────────────────────────────────

export type ProductStatus = "DRAFT" | "VALIDATED" | "ARCHIVED";

export type PortfolioStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

// ─── Profils de risque ──────────────────────────────────────────────

export type RiskProfile = "PRUDENT" | "EQUILIBRE" | "DYNAMIQUE" | "OFFENSIF";

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  PRUDENT: "Prudent",
  EQUILIBRE: "Équilibré",
  DYNAMIQUE: "Dynamique",
  OFFENSIF: "Offensif",
};

// ─── Devises ────────────────────────────────────────────────────────

export type Currency = "EUR" | "USD" | "GBP" | "CHF";

// ─── Rôles ──────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

// ─── Sources de données ─────────────────────────────────────────────

export type DataSource = "MANUAL" | "IMPORT" | "COMPUTED" | "ADMIN";

// ─── ETF ────────────────────────────────────────────────────────────

export type ReplicationMethod = "PHYSICAL" | "SYNTHETIC" | "SAMPLING";

export type DistributionPolicy = "CAPITALIZING" | "DISTRIBUTING";

// ─── Obligations ────────────────────────────────────────────────────

export type IssuerType = "SOVEREIGN" | "CORPORATE" | "FINANCIAL" | "SUPRANATIONAL";

export type CouponFrequency = "ANNUAL" | "SEMI_ANNUAL" | "QUARTERLY" | "ZERO_COUPON";

export type CreditRatingAgency = "SP" | "MOODYS" | "FITCH";

export type BondSeniority = "SENIOR" | "SUBORDINATED" | "HYBRID";

// ─── Produits Structurés ────────────────────────────────────────────

export type UnderlyingType = "INDEX" | "STOCK" | "BASKET" | "RATE" | "FUND";

export type StructuredProductSubtype =
  | "AUTOCALL"
  | "PHOENIX"
  | "REVERSE_CONVERTIBLE"
  | "CAPITAL_PROTECTED"
  | "OTHER";

export type BarrierType = "EUROPEAN" | "AMERICAN" | "DAILY_CLOSE";

export type CouponType = "GUARANTEED" | "CONDITIONAL" | "MEMORY";

export type ObservationFrequency = "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";

// ─── SCPI ───────────────────────────────────────────────────────────

export type ScpiType = "YIELD" | "FISCAL" | "VALORISATION" | "DIVERSIFIED";

export type CapitalType = "FIXED" | "VARIABLE";
