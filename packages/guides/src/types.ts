/**
 * Structure d'un guide contextuel pour un champ de saisie ou une métrique.
 */
export interface GuideEntry {
  /** Ce que représente la donnée */
  definition: string;
  /** Où trouver cette information (site, document, rubrique) */
  source: string;
  /** Comment interpréter la valeur (fourchettes, seuils, comparaisons) */
  interpretation: string;
  /** Valeur illustrative avec explication */
  example: string;
}

/**
 * Registre de guides par classe d'actifs.
 */
export type GuideRegistry = Record<string, Record<string, GuideEntry>>;
