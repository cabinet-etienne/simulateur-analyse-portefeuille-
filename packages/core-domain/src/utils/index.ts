/**
 * Arrondit un nombre à N décimales.
 * Utilisé systématiquement pour les affichages financiers.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convertit un taux décimal en pourcentage affiché.
 * Ex: 0.0345 → "3.45%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${roundTo(value * 100, decimals)}%`;
}

/**
 * Formate un montant avec séparateur de milliers.
 * Ex: 1234567.89 → "1 234 567,89 €"
 */
export function formatAmount(value: number, currency = "EUR", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calcule l'indice de concentration Herfindahl-Hirschman.
 * HHI = Σ(wi²) où wi est le poids de chaque composant.
 * Résultat entre 0 (diversifié) et 1 (concentré).
 */
export function computeHHI(weights: number[]): number {
  return weights.reduce((sum, w) => sum + w * w, 0);
}

/**
 * Vérifie qu'un code ISIN est syntaxiquement valide (12 caractères alphanumériques).
 */
export function isValidIsin(isin: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin);
}

/**
 * Calcule le nombre de jours entre deux dates.
 */
export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
