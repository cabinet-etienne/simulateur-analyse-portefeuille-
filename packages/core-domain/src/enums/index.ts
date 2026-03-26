// ─── Classes d'actifs ───────────────────────────────────────────────

export type AssetClass = "ETF" | "FUND" | "BOND" | "STRUCTURED" | "SCPI" | "PRIVATE_EQUITY";

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  ETF: "ETF",
  FUND: "Fonds (OPCVM)",
  BOND: "Obligation",
  STRUCTURED: "Produit Structuré",
  SCPI: "SCPI",
  PRIVATE_EQUITY: "Private Equity",
};

// ─── Sous-types d'instruments ──────────────────────────────────────

export type InstrumentSubType =
  // Fonds
  | "ETF_UCITS"
  | "OPCVM_SICAV"
  | "OPCVM_FCP"
  | "FUND_OTHER"
  // Obligations (futur V2)
  | "BOND_SOVEREIGN"
  | "BOND_CORPORATE"
  | "BOND_HIGH_YIELD"
  // Structurés (futur V2)
  | "STRUCTURED_AUTOCALL"
  | "STRUCTURED_CAPITAL_PROTECTED"
  | "STRUCTURED_OTHER"
  // Immobilier (futur V2)
  | "SCPI_YIELD"
  | "SCPI_FISCAL"
  | "SCPI_DIVERSIFIED"
  // PE (futur V3)
  | "PE_FCPR"
  | "PE_FPCI";

export const INSTRUMENT_SUB_TYPE_LABELS: Record<InstrumentSubType, string> = {
  ETF_UCITS: "ETF UCITS",
  OPCVM_SICAV: "OPCVM — SICAV",
  OPCVM_FCP: "OPCVM — FCP",
  FUND_OTHER: "Fonds autre",
  BOND_SOVEREIGN: "Obligation souveraine",
  BOND_CORPORATE: "Obligation corporate",
  BOND_HIGH_YIELD: "Obligation haut rendement",
  STRUCTURED_AUTOCALL: "Autocall",
  STRUCTURED_CAPITAL_PROTECTED: "Capital protégé",
  STRUCTURED_OTHER: "Structuré autre",
  SCPI_YIELD: "SCPI de rendement",
  SCPI_FISCAL: "SCPI fiscale",
  SCPI_DIVERSIFIED: "SCPI diversifiée",
  PE_FCPR: "FCPR",
  PE_FPCI: "FPCI",
};

// ─── Supports de détention (Wrappers) ──────────────────────────────

export type WrapperType =
  | "CTO"
  | "PEA"
  | "PEA_PME"
  | "ASSURANCE_VIE"
  | "PER"
  | "PER_INDIVIDUEL"
  | "PER_ENTREPRISE";

export const WRAPPER_TYPE_LABELS: Record<WrapperType, string> = {
  CTO: "Compte-Titres Ordinaire",
  PEA: "PEA",
  PEA_PME: "PEA-PME",
  ASSURANCE_VIE: "Assurance-Vie",
  PER: "PER",
  PER_INDIVIDUEL: "PER Individuel",
  PER_ENTREPRISE: "PER Entreprise",
};

// ─── Versions de portefeuille ──────────────────────────────────────

export type VersionType = "CURRENT" | "TARGET" | "SCENARIO";

// ─── Confiance / fraîcheur des données ─────────────────────────────

export type DataConfidence = "HIGH" | "MEDIUM" | "LOW" | "STALE";

// ─── Statuts de rapport ────────────────────────────────────────────

export type ReportStatus = "DRAFT" | "GENERATED" | "SHARED" | "EXPIRED";

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
