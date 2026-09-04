import { describe, expect, it } from "vitest";
import { currentSeason } from "./espn";
import { parseFeedParams } from "./params";

describe("parseFeedParams", () => {
  it("normalizes, dedupes, and drops unknown teams", () => {
    const p = parseFeedParams("http://x/api/ics?teams=dal,%20KC,DAL,XXX&season=2026&pre=1");
    expect(p?.teams.map((t) => t.abbr)).toEqual(["DAL", "KC"]);
    expect(p?.season).toBe(2026);
    expect(p?.preseason).toBe(true);
  });

  it("defaults the season and excludes preseason", () => {
    const p = parseFeedParams("http://x/api/ics?teams=KC&season=abc");
    expect(p?.season).toBe(currentSeason());
    expect(p?.preseason).toBe(false);
  });

  it("returns null without a valid team", () => {
    expect(parseFeedParams("http://x/api/ics")).toBeNull();
    expect(parseFeedParams("http://x/api/ics?teams=XXX")).toBeNull();
  });
});
