/**
 * Schémas de validation Zod pour les nouveaux modèles du domaine.
 *
 * Ces schémas sont utilisés côté serveur (tRPC) pour valider
 * les entrées utilisateur avant traitement métier.
 *
 * Note : zod est une dépendance optionnelle de core-domain.
 * Si zod n'est pas installé, ce module ne doit pas être importé.
 */
import { z } from "zod";

// ─── Enums ─────────────────────────────────────────────────────────

export const assetClassSchema = z.enum(["ETF", "FUND", "BOND", "STRUCTURED", "SCPI", "PRIVATE_EQUITY"]);

export const instrumentSubTypeSchema = z.enum([
  "ETF_UCITS", "OPCVM_SICAV", "OPCVM_FCP", "FUND_OTHER",
  "BOND_SOVEREIGN", "BOND_CORPORATE", "BOND_HIGH_YIELD",
  "STRUCTURED_AUTOCALL", "STRUCTURED_CAPITAL_PROTECTED", "STRUCTURED_OTHER",
  "SCPI_YIELD", "SCPI_FISCAL", "SCPI_DIVERSIFIED",
  "PE_FCPR", "PE_FPCI",
]);

export const wrapperTypeSchema = z.enum([
  "CTO", "PEA", "PEA_PME", "ASSURANCE_VIE", "PER", "PER_INDIVIDUEL", "PER_ENTREPRISE",
]);

export const versionTypeSchema = z.enum(["CURRENT", "TARGET", "SCENARIO"]);

export const dataConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW", "STALE"]);

export const reportStatusSchema = z.enum(["DRAFT", "GENERATED", "SHARED", "EXPIRED"]);

export const currencySchema = z.enum(["EUR", "USD", "GBP", "CHF"]);

export const riskProfileSchema = z.enum(["PRUDENT", "EQUILIBRE", "DYNAMIQUE", "OFFENSIF"]);

// ─── Instrument (Product) ──────────────────────────────────────────

export const createInstrumentSchema = z.object({
  type: assetClassSchema,
  subType: instrumentSubTypeSchema.nullable().optional(),
  name: z.string().min(1).max(255),
  isin: z.string().regex(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/, "ISIN invalide").nullable().optional(),
  currency: currencySchema.default("EUR"),
  tags: z.array(z.string()).default([]),
});

// ─── Wrapper ───────────────────────────────────────────────────────

export const createWrapperSchema = z.object({
  type: wrapperTypeSchema,
  label: z.string().min(1).max(255),
  provider: z.string().min(1).max(255),
  accountNumber: z.string().max(100).nullable().optional(),
  maxInvestment: z.number().positive().nullable().optional(),
  eligibleAssetClasses: z.array(assetClassSchema).default([]),
});

// ─── Contract ──────────────────────────────────────────────────────

export const createContractSchema = z.object({
  wrapperId: z.string().uuid(),
  provider: z.string().min(1).max(255),
  contractName: z.string().min(1).max(255),
  contractNumber: z.string().max(100).nullable().optional(),
  managementFeePercent: z.number().min(0).max(1),
  entryFeePercent: z.number().min(0).max(1).default(0),
  arbitrageFeePercent: z.number().min(0).max(1).default(0),
  minInvestment: z.number().positive().nullable().optional(),
  availableFundsCount: z.number().int().positive().nullable().optional(),
});

// ─── Portfolio ─────────────────────────────────────────────────────

export const createPortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  clientName: z.string().min(1).max(255),
  riskProfile: riskProfileSchema,
  investmentHorizonMonths: z.number().int().min(1).max(600),
  objectives: z.array(z.string()).default([]),
  constraints: z.record(z.unknown()).default({}),
});

// ─── PortfolioVersion ──────────────────────────────────────────────

export const createPortfolioVersionSchema = z.object({
  portfolioId: z.string().uuid(),
  versionType: versionTypeSchema,
  label: z.string().min(1).max(255),
  totalAmount: z.number().positive(),
});

// ─── Holding ───────────────────────────────────────────────────────

export const createHoldingSchema = z.object({
  versionId: z.string().uuid(),
  instrumentId: z.string().uuid(),
  wrapperId: z.string().uuid().nullable().optional(),
  contractId: z.string().uuid().nullable().optional(),
  quantity: z.number().positive().nullable().optional(),
  unitPrice: z.number().positive().nullable().optional(),
  amount: z.number().positive(),
  weight: z.number().min(0).max(1),
  rationale: z.string().default(""),
  entryDate: z.coerce.date().nullable().optional(),
});

// ─── ScenarioSet ───────────────────────────────────────────────────

export const scenarioDefinitionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(["RATE_SHOCK", "EQUITY_SHOCK", "CREDIT_SPREAD", "INFLATION", "CUSTOM"]),
  parameters: z.record(z.number()),
});

export const createScenarioSetSchema = z.object({
  portfolioVersionId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().default(""),
  scenarios: z.array(scenarioDefinitionSchema).min(1),
});

// ─── Report ────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  portfolioVersionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  cabinetName: z.string().min(1).max(255),
  logoUrl: z.string().url().nullable().optional(),
});
