import { describe, expect, it } from "vitest";

import { parseCsv } from "./csv-parser";

describe("parseCsv", () => {
  it("parse un CSV simple avec séparateur point-virgule", () => {
    const csv = `Nom;ISIN;TER
ETF World;IE00B4L5Y983;0.002
ETF Europe;FR0010296061;0.003`;

    const rows = parseCsv(csv, ";");

    expect(rows).toHaveLength(2);
    expect(rows[0]?.values["Nom"]).toBe("ETF World");
    expect(rows[0]?.values["ISIN"]).toBe("IE00B4L5Y983");
    expect(rows[0]?.values["TER"]).toBe("0.002");
  });

  it("parse un CSV avec séparateur virgule", () => {
    const csv = `Name,TER
Test ETF,0.005`;

    const rows = parseCsv(csv, ",");

    expect(rows).toHaveLength(1);
    expect(rows[0]?.values["Name"]).toBe("Test ETF");
  });

  it("ignore les lignes vides", () => {
    const csv = `Nom;ISIN

ETF World;IE00B4L5Y983

`;

    const rows = parseCsv(csv, ";");

    expect(rows).toHaveLength(1);
  });

  it("retourne un tableau vide si le CSV n'a qu'un header", () => {
    const csv = `Nom;ISIN`;

    const rows = parseCsv(csv, ";");

    expect(rows).toHaveLength(0);
  });

  it("retourne un tableau vide pour un CSV vide", () => {
    const rows = parseCsv("", ";");

    expect(rows).toHaveLength(0);
  });

  it("strip les guillemets des valeurs", () => {
    const csv = `"Nom";"ISIN"
"ETF World";"IE00B4L5Y983"`;

    const rows = parseCsv(csv, ";");

    expect(rows[0]?.values["Nom"]).toBe("ETF World");
  });
});
