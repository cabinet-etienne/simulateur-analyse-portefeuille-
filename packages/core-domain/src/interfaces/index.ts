import type { AssetClass } from "../enums";
import type { Product } from "../models/base";
import type { BondAnalysisResult, BondData } from "../models/bond";
import type { EtfAnalysisResult, EtfData } from "../models/etf";
import type { FundAnalysisResult, FundData } from "../models/fund";
import type { PortfolioAnalysisResult } from "../models/portfolio";
import type { ScpiAnalysisResult, ScpiData } from "../models/scpi";
import type { StructuredAnalysisResult, StructuredProductData } from "../models/structured";

// ─── Contrat générique pour un adapter de classe d'actifs ───────────

export interface AssetAdapter<TData, TAnalysis> {
  readonly assetClass: AssetClass;
  analyze(product: Product, data: TData): TAnalysis;
  validate(data: Partial<TData>): ValidationResult;
  getRequiredFields(): FieldDefinition[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: "number" | "string" | "date" | "boolean" | "enum" | "json";
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  enumValues?: string[];
}

// ─── Contrat pour le moteur de commentaires ─────────────────────────

export interface CommentaryEngine {
  generate(context: CommentaryContext): CommentaryResult;
}

export interface CommentaryContext {
  assetClass: AssetClass;
  product: Product;
  analysisResult: EtfAnalysisResult | FundAnalysisResult | BondAnalysisResult | StructuredAnalysisResult | ScpiAnalysisResult;
}

export interface CommentaryResult {
  comments: Comment[];
  summary: string;
}

export interface Comment {
  id: string;
  severity: "INFO" | "WARNING" | "POSITIVE" | "NEGATIVE";
  category: string;
  text: string;
}

// ─── Contrat pour le moteur de consolidation ────────────────────────

/** Données spécifiques à un instrument, union de tous les types possibles */
export type InstrumentData = EtfData | FundData | BondData | StructuredProductData | ScpiData;

export interface PortfolioEngine {
  consolidate(
    allocations: Array<{
      product: Product;
      data: InstrumentData;
      weight: number;
      amount: number;
    }>,
    riskProfile: string,
    investmentHorizonMonths: number,
  ): PortfolioAnalysisResult;
}

// ─── Contrat pour la génération de rapports ─────────────────────────

export interface ReportGenerator {
  generatePdf(reportData: ReportData): Promise<Uint8Array>;
}

export interface ReportData {
  portfolio: {
    name: string;
    clientName: string;
    date: Date;
  };
  analysis: PortfolioAnalysisResult;
  products: Array<{
    product: Product;
    analysis: EtfAnalysisResult | FundAnalysisResult | BondAnalysisResult | StructuredAnalysisResult | ScpiAnalysisResult;
  }>;
  branding: {
    cabinetName: string;
    logoUrl?: string;
  };
}

// ─── Contrat pour l'ingestion de données ────────────────────────────

export interface DataIngestionService {
  parseFile(file: ArrayBuffer, format: "csv" | "xlsx"): Promise<ParsedRow[]>;
  mapToProduct(rows: ParsedRow[], mapping: ColumnMapping): MappedProduct[];
  validate(mapped: MappedProduct[]): ValidationResult;
}

export interface ParsedRow {
  rowIndex: number;
  values: Record<string, string>;
}

export interface ColumnMapping {
  mappings: Array<{
    sourceColumn: string;
    targetField: string;
  }>;
}

export interface MappedProduct {
  rowIndex: number;
  data: Record<string, unknown>;
}
