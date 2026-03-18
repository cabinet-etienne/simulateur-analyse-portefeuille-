export type { GuideEntry, GuideRegistry } from "./types";
export { etfGuides } from "./content/etf-guides";

/**
 * Récupère le guide contextuel pour un champ donné.
 * Retourne undefined si aucun guide n'existe pour ce champ.
 */
export function getGuide(
  registry: Record<string, import("./types").GuideEntry>,
  fieldKey: string,
): import("./types").GuideEntry | undefined {
  return registry[fieldKey];
}
