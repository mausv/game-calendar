import { afterEach, describe, expect, it, vi } from "vitest";
import { currentSeason, fetchGames, parseSchedule, type EspnSchedule } from "./espn";
import { teamByAbbr } from "./teams";

type Event = EspnSchedule["events"][number];
type Competition = Event["competitions"][number];

const competitor = (homeAway: "home" | "away", abbr: string) => ({
  homeAway,
  team: { abbreviation: abbr, nickname: teamByAbbr.get(abbr)?.name ?? abbr },
});

const event = (
  id: string,
  date: string,
  week: number,
  home: string,
  away: string,
  extra: Partial<Competition> = {},
): Event => ({
  id,
  date,
  week: { number: week },
  competitions: [
    {
      timeValid: true,
      neutralSite: false,
      competitors: [competitor("home", home), competitor("away", away)],
      venue: {
        fullName: "AT&T Stadium",
        address: { city: "Arlington", state: "TX", country: "USA" },
      },
      broadcasts: [{ media: { shortName: "FOX" } }],
      ...extra,
    },
  ],
});

describe("parseSchedule", () => {
  it("maps an event to a game", () => {
    const [game] = parseSchedule({ events: [event("1", "2026-09-20T20:25Z", 2, "DAL", "WSH")] }, 2);
    expect(game).toEqual({
      id: "1",
      start: "2026-09-20T20:25Z",
      timeTbd: false,
      seasonType: 2,
      week: 2,
      home: { abbr: "DAL", name: "Cowboys" },
      away: { abbr: "WSH", name: "Commanders" },
      neutralSite: false,
      venue: "AT&T Stadium, Arlington, TX",
      broadcasts: ["FOX"],
      note: undefined,
    });
  });

  it("handles flex games, neutral sites, and international venues", () => {
    const [game] = parseSchedule(
      {
        events: [
          event("2", "2026-09-27T20:25Z", 3, "BAL", "DAL", {
            timeValid: false,
            neutralSite: true,
            venue: { fullName: "Maracanã Stadium", address: { city: "Rio De Janeiro", country: "Brazil" } },
            broadcasts: [],
            notes: [{ headline: "NFL Rio Game" }],
          }),
        ],
      },
      2,
    );
    expect(game.timeTbd).toBe(true);
    expect(game.neutralSite).toBe(true);
    expect(game.venue).toBe("Maracanã Stadium, Rio De Janeiro, Brazil");
    expect(game.broadcasts).toEqual([]);
    expect(game.note).toBe("NFL Rio Game");
  });

  it("shifts preseason weeks so the Hall of Fame game is week 0", () => {
    const [game] = parseSchedule({ events: [event("3", "2026-08-16T00:00Z", 2, "SEA", "DAL")] }, 1);
    expect(game.week).toBe(1);
  });
});

describe("currentSeason", () => {
  it("belongs to the previous year through February", () => {
    expect(currentSeason(new Date("2027-01-15T12:00Z"))).toBe(2026);
    expect(currentSeason(new Date("2027-02-28T12:00Z"))).toBe(2026);
    expect(currentSeason(new Date("2027-03-01T12:00Z"))).toBe(2027);
    expect(currentSeason(new Date("2026-09-03T12:00Z"))).toBe(2026);
  });
});

describe("fetchGames", () => {
  const dal = teamByAbbr.get("DAL")!;
  const kc = teamByAbbr.get("KC")!;
  const shared = event("100", "2026-11-26T21:30Z", 12, "DAL", "KC");

  const schedules: Record<string, Event[]> = {
    "6/2": [event("101", "2026-09-14T00:20Z", 1, "NYG", "DAL"), shared],
    "6/3": [],
    "6/1": [event("102", "2026-08-16T00:00Z", 2, "SEA", "DAL")],
    "12/2": [shared, event("103", "2026-09-10T00:20Z", 1, "KC", "LAC")],
    "12/3": [],
    "12/1": [],
  };

  const stubFetch = () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(input.toString());
        calls.push(url.toString());
        const key = `${url.pathname.split("/").at(-2)}/${url.searchParams.get("seasontype")}`;
        const events = schedules[key];
        if (!events) return new Response("", { status: 500 });
        return Response.json({ events });
      }),
    );
    return calls;
  };

  afterEach(() => vi.unstubAllGlobals());

  it("merges, dedupes, and sorts games across teams", async () => {
    stubFetch();
    const games = await fetchGames([dal, kc], 2026, false);
    expect(games.map((g) => g.id)).toEqual(["103", "101", "100"]);
  });

  it("only requests preseason when asked", async () => {
    const calls = stubFetch();
    await fetchGames([dal], 2026, false);
    expect(calls.some((u) => u.includes("seasontype=1"))).toBe(false);

    const games = await fetchGames([dal], 2026, true);
    expect(calls.some((u) => u.includes("seasontype=1"))).toBe(true);
    expect(games[0].id).toBe("102");
  });

  it("throws when ESPN fails", async () => {
    stubFetch();
    await expect(fetchGames([{ ...dal, id: 999 }], 2026, false)).rejects.toThrow("ESPN returned 500");
  });
});
