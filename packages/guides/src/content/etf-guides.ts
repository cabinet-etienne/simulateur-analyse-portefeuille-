import type { GuideEntry } from "../types";

/**
 * Guides contextuels pour les champs ETF.
 * Chaque guide explique : ce que c'est, où le trouver, comment l'interpréter.
 */
export const etfGuides: Record<string, GuideEntry> = {
  ter: {
    definition:
      "Le Total Expense Ratio (TER) représente les frais annuels totaux prélevés par le gestionnaire de l'ETF. Il inclut les frais de gestion, les frais administratifs et les frais opérationnels.",
    source:
      "Disponible sur le DICI (Document d'Informations Clés pour l'Investisseur) de l'ETF, rubrique « Coûts ». Également affiché sur le site web de l'émetteur (iShares, Amundi, Vanguard, etc.).",
    interpretation:
      "Un TER < 0.20% est considéré comme faible pour un ETF actions. Entre 0.20% et 0.50%, il est dans la moyenne. Au-delà de 0.50%, il convient de vérifier que la valeur ajoutée justifie le surcoût.",
    example: "Un ETF MSCI World typique a un TER entre 0.12% et 0.30%. Le Vanguard FTSE All-World est à 0.22%.",
  },
  trackingError: {
    definition:
      "La tracking error mesure l'écart-type de la différence de performance entre l'ETF et son indice de référence. C'est un indicateur de la qualité de la réplication.",
    source:
      "Calculée à partir des performances historiques. Disponible dans le reporting mensuel de l'ETF ou sur des sites spécialisés (justETF, Morningstar).",
    interpretation:
      "Une tracking error < 0.10% est excellente. Entre 0.10% et 0.30%, elle est acceptable. Au-delà de 0.50%, la réplication est de qualité médiocre.",
    example: "Un bon ETF S&P 500 en réplication physique a une tracking error inférieure à 0.05%.",
  },
  aum: {
    definition:
      "Les actifs sous gestion (AUM - Assets Under Management) représentent le montant total investi dans l'ETF par l'ensemble des investisseurs.",
    source: "Affiché sur le site de l'émetteur et sur les plateformes de données financières (Bloomberg, Morningstar).",
    interpretation:
      "Un AUM > 500M€ assure une bonne liquidité. En dessous de 100M€, le risque de fermeture du fonds et de spreads élevés augmente.",
    example: "Le iShares Core MSCI World a un AUM de plus de 50 milliards de dollars.",
  },
  sharpeRatio: {
    definition:
      "Le ratio de Sharpe mesure la performance ajustée du risque. Il indique le rendement excédentaire (par rapport au taux sans risque) obtenu par unité de risque (volatilité).",
    source:
      "Calculé à partir des performances et de la volatilité historiques. Disponible sur Morningstar, Quantalys ou dans les rapports de gestion.",
    interpretation:
      "Un Sharpe > 1 est considéré comme bon. Entre 0.5 et 1, il est acceptable. En dessous de 0.5, le rendement ne compense que faiblement le risque pris.",
    example: "Sur longue période, le S&P 500 affiche un ratio de Sharpe d'environ 0.4 à 0.6.",
  },
  replicationMethod: {
    definition:
      "La méthode de réplication indique comment l'ETF reproduit la performance de son indice : physique (achat des titres), synthétique (via des swaps) ou échantillonnage (sous-ensemble de titres).",
    source: "Indiqué dans le DICI et sur le site de l'émetteur, rubrique « Méthodologie » ou « Structure du fonds ».",
    interpretation:
      "La réplication physique est la plus transparente. La réplication synthétique peut offrir un meilleur tracking mais introduit un risque de contrepartie. L'échantillonnage est un compromis.",
    example:
      "Les ETF iShares Core sont généralement en réplication physique. Les ETF Lyxor utilisaient historiquement la réplication synthétique.",
  },
};
