import type { Comment } from "@repo/core-domain";

/**
 * Règle déclarative de commentaire.
 *
 * Une règle décrit :
 * - une condition à évaluer sur les données du produit/analyse
 * - un template de commentaire avec variables interpolées
 * - un niveau de sévérité et une catégorie
 */
export interface CommentRule {
  /** Identifiant unique de la règle */
  id: string;
  /** Catégorie métier (coûts, risque, performance, liquidité...) */
  category: string;
  /** Sévérité du commentaire produit */
  severity: Comment["severity"];
  /** Condition d'activation */
  condition: RuleCondition;
  /** Template de texte avec variables {{xxx}} */
  template: string;
  /** Priorité d'affichage (plus petit = plus prioritaire) */
  priority: number;
}

export interface RuleCondition {
  /** Champ à évaluer dans les données */
  field: string;
  /** Opérateur de comparaison */
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "neq" | "between" | "in";
  /** Valeur de comparaison */
  value: unknown;
}

/**
 * Ensemble de règles pour une classe d'actifs.
 */
export interface RuleSet {
  assetClass: string;
  version: string;
  rules: CommentRule[];
}
