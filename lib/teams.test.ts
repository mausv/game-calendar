import { describe, expect, it } from "vitest";
import { TEAMS, textOn } from "./teams";

describe("TEAMS", () => {
  it("lists 32 unique teams, four per division", () => {
    expect(TEAMS).toHaveLength(32);
    expect(new Set(TEAMS.map((t) => t.abbr)).size).toBe(32);
    expect(new Set(TEAMS.map((t) => t.id)).size).toBe(32);
    const perDivision = new Map<string, number>();
    for (const t of TEAMS) {
      const key = `${t.conference} ${t.division}`;
      perDivision.set(key, (perDivision.get(key) ?? 0) + 1);
    }
    expect([...perDivision.values()]).toEqual(Array(8).fill(4));
  });
});

describe("textOn", () => {
  it("uses ink on light colors and white on dark ones", () => {
    expect(textOn("#d3bc8d")).toBe("#14171c");
    expect(textOn("#ffffff")).toBe("#14171c");
    expect(textOn("#002a5c")).toBe("#ffffff");
    expect(textOn("#e31837")).toBe("#ffffff");
  });
});
