import { describe, expect, it } from "vitest";
import type { Game } from "./espn";
import { formatGameDate } from "./dates";

const game = (extra: Partial<Game>): Game => ({
  id: "1",
  start: "2027-01-10T05:00Z",
  timeTbd: false,
  seasonType: 2,
  week: 18,
  home: { abbr: "WSH", name: "Commanders" },
  away: { abbr: "DAL", name: "Cowboys" },
  neutralSite: false,
  venue: "",
  broadcasts: [],
  ...extra,
});

describe("formatGameDate", () => {
  it("dates flex games by the Eastern calendar regardless of the requested zone", () => {
    expect(formatGameDate(game({ timeTbd: true }), { day: "numeric", timeZone: "Pacific/Honolulu" })).toBe("10");
  });

  it("respects the requested zone for real kickoffs", () => {
    expect(formatGameDate(game({}), { day: "numeric", timeZone: "Pacific/Honolulu" })).toBe("9");
    expect(formatGameDate(game({}), { day: "numeric", timeZone: "UTC" })).toBe("10");
  });
});
