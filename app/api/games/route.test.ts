import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const event = {
  id: "101",
  date: "2026-09-14T00:20Z",
  week: { number: 1 },
  competitions: [
    {
      timeValid: true,
      neutralSite: false,
      competitors: [
        { homeAway: "home", team: { abbreviation: "NYG", nickname: "Giants" } },
        { homeAway: "away", team: { abbreviation: "DAL", nickname: "Cowboys" } },
      ],
      broadcasts: [{ media: { shortName: "NBC" } }],
    },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/games", () => {
  it("rejects requests without a valid team", async () => {
    expect((await GET(new Request("http://x/api/games"))).status).toBe(400);
  });

  it("returns normalized games as JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) =>
        Response.json({ events: input.toString().includes("seasontype=2") ? [event] : [] }),
      ),
    );
    const res = await GET(new Request("http://x/api/games?teams=DAL&season=2026"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.json()).toEqual([
      {
        id: "101",
        start: "2026-09-14T00:20Z",
        timeTbd: false,
        seasonType: 2,
        week: 1,
        home: { abbr: "NYG", name: "Giants" },
        away: { abbr: "DAL", name: "Cowboys" },
        neutralSite: false,
        venue: "",
        broadcasts: ["NBC"],
      },
    ]);
  });
});
