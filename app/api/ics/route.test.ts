import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const event = (id: string, date: string, home: string, away: string) => ({
  id,
  date,
  week: { number: 1 },
  competitions: [
    {
      timeValid: true,
      neutralSite: false,
      competitors: [
        { homeAway: "home", team: { abbreviation: home, nickname: home } },
        { homeAway: "away", team: { abbreviation: away, nickname: away } },
      ],
    },
  ],
});

const shared = event("100", "2026-11-26T21:30Z", "DAL", "KC");
const schedules: Record<string, unknown[]> = {
  "6/2": [event("101", "2026-09-14T00:20Z", "NYG", "DAL"), shared],
  "6/3": [],
  "6/1": [event("102", "2026-08-16T00:00Z", "SEA", "DAL")],
  "12/2": [shared],
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
      return Response.json({ events: schedules[key] ?? [] });
    }),
  );
  return calls;
};

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/ics", () => {
  it("rejects requests without a valid team", async () => {
    expect((await GET(new Request("http://x/api/ics"))).status).toBe(400);
    expect((await GET(new Request("http://x/api/ics?teams=XXX"))).status).toBe(400);
  });

  it("returns a merged calendar for the selected teams", async () => {
    stubFetch();
    const res = await GET(new Request("http://x/api/ics?teams=dal,%20KC,DAL&season=2026"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("Content-Disposition")).toBe('inline; filename="dal-kc-2026.ics"');
    const body = await res.text();
    expect(body).toContain("X-WR-CALNAME:Cowboys + Chiefs 2026");
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(body).toContain("UID:100@game-calendar");
    expect(body).toContain("UID:101@game-calendar");
  });

  it("includes preseason only with pre=1", async () => {
    const calls = stubFetch();
    const without = await (await GET(new Request("http://x/api/ics?teams=DAL&season=2026"))).text();
    expect(without).not.toContain("UID:102@");
    const withPre = await (await GET(new Request("http://x/api/ics?teams=DAL&season=2026&pre=1"))).text();
    expect(withPre).toContain("UID:102@");
    expect(calls.every((u) => u.includes("season=2026"))).toBe(true);
  });
});
