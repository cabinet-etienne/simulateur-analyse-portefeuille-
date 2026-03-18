import type { RuleSet } from "./types";

/**
 * Règles de commentaires automatiques pour les ETF.
 * Ces règles sont évaluées par le moteur contre les données d'analyse.
 *
 * Convention de nommage des variables dans les templates :
 * - Utiliser le nom du champ tel qu'il apparaît dans les données
 * - Les valeurs sont pré-formatées avant injection (ex: ter_pct = ter * 100)
 */
export const etfRuleSet: RuleSet = {
  assetClass: "ETF",
  version: "1.0.0",
  rules: [
    // ─── Coûts ────────────────────────────────────────────────
    {
      id: "etf-ter-low",
      category: "costs",
      severity: "POSITIVE",
      condition: { field: "ter", operator: "lte", value: 0.002 },
      template: "Le TER de {{ter_pct}}% place cet ETF parmi les moins chers de sa catégorie.",
      priority: 1,
    },
    {
      id: "etf-ter-high",
      category: "costs",
      severity: "WARNING",
      condition: { field: "ter", operator: "gt", value: 0.005 },
      template:
        "Le TER de {{ter_pct}}% est supérieur à la moyenne de la catégorie. À considérer dans l'analyse du coût total.",
      priority: 1,
    },

    // ─── Tracking ─────────────────────────────────────────────
    {
      id: "etf-tracking-excellent",
      category: "tracking",
      severity: "POSITIVE",
      condition: { field: "trackingError", operator: "lte", value: 0.001 },
      template: "Tracking error de {{tracking_error_pct}}% : réplication excellente de l'indice.",
      priority: 2,
    },
    {
      id: "etf-tracking-poor",
      category: "tracking",
      severity: "NEGATIVE",
      condition: { field: "trackingError", operator: "gt", value: 0.01 },
      template:
        "Attention : tracking error de {{tracking_error_pct}}%, supérieur à la moyenne de la catégorie. La réplication de l'indice pourrait être améliorée.",
      priority: 2,
    },

    // ─── Liquidité ────────────────────────────────────────────
    {
      id: "etf-aum-low",
      category: "liquidity",
      severity: "WARNING",
      condition: { field: "aum", operator: "lt", value: 100_000_000 },
      template:
        "Encours de {{aum_formatted}} : liquidité limitée. Le spread bid-ask pourrait être plus élevé que la moyenne.",
      priority: 3,
    },
    {
      id: "etf-aum-high",
      category: "liquidity",
      severity: "POSITIVE",
      condition: { field: "aum", operator: "gte", value: 1_000_000_000 },
      template: "Encours de {{aum_formatted}} : excellente liquidité et spread bid-ask réduit.",
      priority: 3,
    },

    // ─── Risque ───────────────────────────────────────────────
    {
      id: "etf-sharpe-good",
      category: "risk",
      severity: "POSITIVE",
      condition: { field: "sharpeRatio", operator: "gte", value: 1 },
      template:
        "Ratio de Sharpe de {{sharpeRatio}} : le rendement ajusté du risque est favorable.",
      priority: 4,
    },
    {
      id: "etf-sharpe-poor",
      category: "risk",
      severity: "NEGATIVE",
      condition: { field: "sharpeRatio", operator: "lt", value: 0.3 },
      template:
        "Ratio de Sharpe de {{sharpeRatio}} : le rendement ne compense que faiblement le risque pris.",
      priority: 4,
    },
  ],
};
