import { describe, expect, it } from "vitest";
import type { Game } from "./espn";
import { buildCalendar, fold, gameTitle } from "./ics";

const game = (extra: Partial<Game> = {}): Game => ({
  id: "401872930",
  start: "2026-09-14T00:20Z",
  timeTbd: false,
  seasonType: 2,
  week: 1,
  home: { abbr: "NYG", name: "Giants" },
  away: { abbr: "DAL", name: "Cowboys" },
  neutralSite: false,
  venue: "MetLife Stadium, East Rutherford, NJ",
  broadcasts: ["NBC"],
  ...extra,
});

const now = new Date("2026-09-03T12:00:00Z");

describe("buildCalendar", () => {
  it("emits a timed event with a 3h15m duration", () => {
    const ics = buildCalendar([game()], { name: "Cowboys 2026", now });
    const lines = ics.split("\r\n");
    expect(lines).toContain("BEGIN:VCALENDAR");
    expect(lines).toContain("X-WR-CALNAME:Cowboys 2026");
    expect(lines).toContain("UID:401872930@game-calendar");
    expect(lines).toContain("DTSTAMP:20260903T120000Z");
    expect(lines).toContain("DTSTART:20260914T002000Z");
    expect(lines).toContain("DTEND:20260914T033500Z");
    expect(lines).toContain("SUMMARY:Cowboys @ Giants");
    expect(lines).toContain("LOCATION:MetLife Stadium\\, East Rutherford\\, NJ");
    expect(lines).toContain("DESCRIPTION:Week 1 · Regular Season\\nTV: NBC");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("emits an all-day event on the Eastern date for TBD kickoffs", () => {
    const ics = buildCalendar(
      [game({ start: "2027-01-10T05:00Z", timeTbd: true, note: "Flex Game: 1/9 or 1/10" })],
      { name: "x", now },
    );
    const lines = ics.split("\r\n");
    expect(lines).toContain("DTSTART;VALUE=DATE:20270110");
    expect(lines).toContain("DTEND;VALUE=DATE:20270111");
    expect(lines).toContain("SUMMARY:Cowboys @ Giants - time TBD");
    expect(lines).toContain("DESCRIPTION:Week 1 · Regular Season\\nTV: NBC\\nFlex Game: 1/9 or 1/10");
  });

  it("omits LOCATION when the venue is unknown", () => {
    const ics = buildCalendar([game({ venue: "" })], { name: "x", now });
    expect(ics).not.toContain("LOCATION:");
  });
});

describe("gameTitle", () => {
  it("uses vs for neutral sites and tags preseason and playoff games", () => {
    expect(gameTitle(game({ neutralSite: true }))).toBe("Cowboys vs Giants");
    expect(gameTitle(game({ seasonType: 1 }))).toBe("Cowboys @ Giants (Preseason)");
    expect(gameTitle(game({ seasonType: 3, note: "NFC Wild Card Playoffs" }))).toBe(
      "Cowboys @ Giants (NFC Wild Card Playoffs)",
    );
  });
});

describe("fold", () => {
  it("keeps every physical line within 75 octets and unfolds losslessly", () => {
    const line = "DESCRIPTION:" + "é".repeat(120);
    const folded = fold(line);
    const physical = folded.split("\r\n");
    expect(physical.length).toBeGreaterThan(1);
    for (const p of physical) expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
    for (const p of physical.slice(1)) expect(p.startsWith(" ")).toBe(true);
    expect(folded.replaceAll("\r\n ", "")).toBe(line);
  });

  it("leaves short lines alone", () => {
    expect(fold("SUMMARY:Cowboys @ Giants")).toBe("SUMMARY:Cowboys @ Giants");
  });
});
