import type { RuleSet } from "./types";

/**
 * Règles de commentaires automatiques pour les ETF.
 * Implémente la section 3.2 de la spec ETF V1.
 *
 * Convention de nommage des variables dans les templates :
 * - Les valeurs sont pré-formatées avant injection par prepareContext()
 * - Les champs group-relatifs (is_ter_min, is_ter_max, is_return1y_max)
 *   sont pré-calculés avant l'évaluation des règles
 */
export const etfRuleSet: RuleSet = {
  assetClass: "ETF",
  version: "1.0.0",
  rules: [
    // ─── Coûts ────────────────────────────────────────────────────
    {
      id: "cost-champion",
      category: "costs",
      severity: "POSITIVE",
      condition: { field: "is_ter_min", operator: "eq", value: true },
      template:
        "{{name}} affiche le TER le plus bas du comparatif ({{ter_pct}}%), ce qui constitue un avantage structurel sur le long terme.",
      priority: 1,
    },
    {
      id: "cost-very-low",
      category: "costs",
      severity: "POSITIVE",
      condition: { field: "ter", operator: "lte", value: 0.001 },
      template:
        "Avec un TER de {{ter_pct}}%, les frais sont parmi les plus bas du marché pour cette classe d'actifs.",
      priority: 2,
    },
    {
      id: "cost-high",
      category: "costs",
      severity: "WARNING",
      condition: { field: "ter", operator: "gt", value: 0.004 },
      template:
        "Le TER de {{ter_pct}}% est élevé. Sur un horizon de 10 ans et un capital de 100 000 €, cela représente environ {{cost_10y_eur}} € de frais cumulés.",
      priority: 3,
    },
    {
      id: "cost-highest",
      category: "costs",
      severity: "NEGATIVE",
      condition: { field: "is_ter_max", operator: "eq", value: true },
      template:
        "{{name}} présente les frais les plus élevés du comparatif. L'écart de TER avec le moins cher est de {{ter_spread_pct}} points.",
      priority: 4,
    },

    // ─── Tracking ─────────────────────────────────────────────────
    {
      id: "track-excellent",
      category: "tracking",
      severity: "POSITIVE",
      condition: { field: "trackingError", operator: "lte", value: 0.0005 },
      template:
        "Tracking error de {{te_pct}}% : la réplication de l'indice est excellente.",
      priority: 10,
    },
    {
      id: "track-poor",
      category: "tracking",
      severity: "NEGATIVE",
      condition: { field: "trackingError", operator: "gt", value: 0.005 },
      template:
        "Tracking error de {{te_pct}}% : écart significatif avec l'indice. La réplication pourrait ne pas refléter fidèlement la performance du sous-jacent.",
      priority: 11,
    },
    {
      id: "track-diff-neg",
      category: "tracking",
      severity: "WARNING",
      condition: { field: "trackingDifference", operator: "lt", value: -0.002 },
      template:
        "La tracking difference de {{td_pct}}% indique que l'ETF sous-performe son indice au-delà des frais affichés.",
      priority: 12,
    },

    // ─── Liquidité ────────────────────────────────────────────────
    {
      id: "liq-excellent",
      category: "liquidity",
      severity: "POSITIVE",
      condition: { field: "aum", operator: "gte", value: 1_000_000_000 },
      template:
        "Avec {{aum_formatted}} d'encours, cet ETF offre une liquidité excellente et un spread réduit.",
      priority: 20,
    },
    {
      id: "liq-risk",
      category: "liquidity",
      severity: "NEGATIVE",
      condition: { field: "aum", operator: "lt", value: 50_000_000 },
      template:
        "Encours de seulement {{aum_formatted}}. Risque de spread élevé, de liquidité limitée, et de fermeture potentielle du fonds.",
      priority: 21,
    },
    {
      id: "liq-low-volume",
      category: "liquidity",
      severity: "WARNING",
      condition: { field: "avgDailyVolume", operator: "lt", value: 10_000 },
      template:
        "Volume quotidien moyen de {{volume}} parts : la liquidité pourrait être insuffisante pour des ordres importants.",
      priority: 22,
    },

    // ─── Risque ───────────────────────────────────────────────────
    {
      id: "risk-sharpe-good",
      category: "risk",
      severity: "POSITIVE",
      condition: { field: "sharpeRatio", operator: "gte", value: 1.0 },
      template:
        "Ratio de Sharpe de {{sharpe}} : le rendement ajusté du risque est favorable et supérieur à la moyenne de marché.",
      priority: 30,
    },
    {
      id: "risk-sharpe-poor",
      category: "risk",
      severity: "NEGATIVE",
      condition: { field: "sharpeRatio", operator: "lt", value: 0.3 },
      template:
        "Ratio de Sharpe de {{sharpe}} : le rendement ne compense que faiblement le risque supporté.",
      priority: 31,
    },
    {
      id: "risk-drawdown",
      category: "risk",
      severity: "WARNING",
      condition: { field: "maxDrawdown", operator: "lt", value: -0.25 },
      template:
        "Perte maximale historique de {{maxdd_pct}}% : à mettre en perspective avec le profil de risque du client.",
      priority: 32,
    },
    {
      id: "risk-vol-high",
      category: "risk",
      severity: "WARNING",
      condition: { field: "volatility1y", operator: "gt", value: 0.25 },
      template:
        "Volatilité annualisée de {{vol_pct}}% : cet ETF présente des fluctuations marquées à court terme.",
      priority: 33,
    },

    // ─── Performance ──────────────────────────────────────────────
    {
      id: "perf-best-group",
      category: "performance",
      severity: "POSITIVE",
      condition: { field: "is_return1y_max", operator: "eq", value: true },
      template:
        "{{name}} affiche la meilleure performance 1 an du comparatif ({{ret1y_pct}}%).",
      priority: 40,
    },
    {
      id: "perf-vs-index-neg",
      category: "performance",
      severity: "WARNING",
      condition: { field: "return1yVsIndex", operator: "lt", value: -0.02 },
      template:
        "Sous-performance de {{gap_pct}}% par rapport à l'indice sur 1 an, au-delà de l'impact des frais.",
      priority: 41,
    },
    {
      id: "perf-no-history",
      category: "performance",
      severity: "INFO",
      condition: { field: "return3y", operator: "eq", value: null },
      template:
        "Historique de performance limité (< 3 ans). L'analyse à moyen terme n'est pas disponible.",
      priority: 42,
    },

    // ─── Structure ────────────────────────────────────────────────
    {
      id: "struct-synthetic",
      category: "structure",
      severity: "INFO",
      condition: { field: "replication", operator: "eq", value: "SYNTHETIC" },
      template:
        "Réplication synthétique via swap : vérifier le risque de contrepartie et la qualité du collatéral.",
      priority: 50,
    },
    {
      id: "struct-young",
      category: "structure",
      severity: "WARNING",
      condition: { field: "anciennete_annees", operator: "lt", value: 2 },
      template:
        "ETF récent (lancé il y a moins de 2 ans). L'historique est insuffisant pour une analyse complète.",
      priority: 51,
    },
    {
      id: "struct-pea",
      category: "structure",
      severity: "POSITIVE",
      condition: { field: "pea", operator: "eq", value: true },
      template:
        "Éligible au PEA : avantage fiscal significatif pour un investisseur résident fiscal français.",
      priority: 52,
    },
  ],
};
