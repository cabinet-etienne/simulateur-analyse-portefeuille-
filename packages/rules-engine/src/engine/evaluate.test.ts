import { describe, expect, it } from "vitest";

import type { CommentRule } from "../rules/types";

import { evaluateRules } from "./evaluate";

const testRules: CommentRule[] = [
  {
    id: "test-high-ter",
    category: "costs",
    severity: "WARNING",
    condition: { field: "ter", operator: "gt", value: 0.005 },
    template: "Le TER de {{ter_pct}}% est élevé.",
    priority: 1,
  },
  {
    id: "test-low-ter",
    category: "costs",
    severity: "POSITIVE",
    condition: { field: "ter", operator: "lte", value: 0.002 },
    template: "Le TER de {{ter_pct}}% est très compétitif.",
    priority: 1,
  },
  {
    id: "test-between",
    category: "risk",
    severity: "INFO",
    condition: { field: "volatility", operator: "between", value: [0.10, 0.20] },
    template: "Volatilité dans la fourchette normale ({{volatility}}).",
    priority: 2,
  },
];

describe("evaluateRules", () => {
  it("déclenche la règle WARNING quand le TER est élevé", () => {
    const data = { ter: 0.008, ter_pct: "0.80" };
    const comments = evaluateRules(testRules, data);

    expect(comments).toHaveLength(1);
    expect(comments[0]?.id).toBe("test-high-ter");
    expect(comments[0]?.severity).toBe("WARNING");
    expect(comments[0]?.text).toBe("Le TER de 0.80% est élevé.");
  });

  it("déclenche la règle POSITIVE quand le TER est bas", () => {
    const data = { ter: 0.001, ter_pct: "0.10" };
    const comments = evaluateRules(testRules, data);

    expect(comments).toHaveLength(1);
    expect(comments[0]?.id).toBe("test-low-ter");
    expect(comments[0]?.severity).toBe("POSITIVE");
  });

  it("ne déclenche aucune règle si les conditions ne sont pas remplies", () => {
    const data = { ter: 0.003 };
    const comments = evaluateRules(testRules, data);

    expect(comments).toHaveLength(0);
  });

  it("évalue l'opérateur between correctement", () => {
    const data = { volatility: 0.15 };
    const comments = evaluateRules(testRules, data);

    expect(comments).toHaveLength(1);
    expect(comments[0]?.id).toBe("test-between");
  });

  it("gère les champs absents sans erreur", () => {
    const data = {};
    const comments = evaluateRules(testRules, data);

    expect(comments).toHaveLength(0);
  });

  it("interpole les variables dans le template", () => {
    const data = { ter: 0.001, ter_pct: "0.10" };
    const comments = evaluateRules(testRules, data);

    expect(comments[0]?.text).toContain("0.10%");
  });

  it("affiche N/A pour les variables manquantes", () => {
    const rules: CommentRule[] = [
      {
        id: "test",
        category: "test",
        severity: "INFO",
        condition: { field: "x", operator: "eq", value: 1 },
        template: "Valeur: {{missing_var}}",
        priority: 1,
      },
    ];
    const comments = evaluateRules(rules, { x: 1 });

    expect(comments[0]?.text).toBe("Valeur: N/A");
  });
});
