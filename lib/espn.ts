import type { Team } from "./teams";

export type SeasonType = 1 | 2 | 3;

export const SEASON_LABEL: Record<SeasonType, string> = {
  1: "Preseason",
  2: "Regular Season",
  3: "Postseason",
};

export type Side = { abbr: string; name: string };

export type Game = {
  id: string;
  start: string;
  timeTbd: boolean;
  seasonType: SeasonType;
  week: number;
  home: Side;
  away: Side;
  neutralSite: boolean;
  venue: string;
  broadcasts: string[];
  note?: string;
};

type EspnCompetition = {
  timeValid: boolean;
  neutralSite: boolean;
  competitors: Array<{
    homeAway: "home" | "away";
    team: { abbreviation: string; nickname: string };
  }>;
  venue?: {
    fullName: string;
    address?: { city?: string; state?: string; country?: string };
  };
  broadcasts?: Array<{ media: { shortName: string } }>;
  notes?: Array<{ headline: string }>;
};

export type EspnSchedule = {
  events: Array<{
    id: string;
    date: string;
    week: { number: number };
    competitions: EspnCompetition[];
  }>;
};

const BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

// A season runs from August through the following February.
export const currentSeason = (now = new Date()) =>
  now.getUTCMonth() < 2 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();

function side(competition: EspnCompetition, homeAway: "home" | "away"): Side {
  const found = competition.competitors.find((c) => c.homeAway === homeAway);
  if (!found) throw new Error(`ESPN event is missing its ${homeAway} team`);
  return { abbr: found.team.abbreviation, name: found.team.nickname };
}

export function parseSchedule(json: EspnSchedule, seasonType: SeasonType): Game[] {
  return json.events.map((e) => {
    const c = e.competitions[0];
    const address = c.venue?.address;
    return {
      id: e.id,
      start: e.date,
      timeTbd: !c.timeValid,
      seasonType,
      // ESPN counts the Hall of Fame game as preseason week 1; the NFL doesn't.
      week: seasonType === 1 ? e.week.number - 1 : e.week.number,
      home: side(c, "home"),
      away: side(c, "away"),
      neutralSite: c.neutralSite,
      venue: [c.venue?.fullName, address?.city, address?.state ?? address?.country]
        .filter(Boolean)
        .join(", "),
      broadcasts: (c.broadcasts ?? []).map((b) => b.media.shortName),
      note: c.notes?.[0]?.headline,
    };
  });
}

async function fetchSchedule(teamId: number, season: number, seasonType: SeasonType) {
  const res = await fetch(
    `${BASE}/teams/${teamId}/schedule?season=${season}&seasontype=${seasonType}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`ESPN returned ${res.status} for team ${teamId}`);
  return parseSchedule(await res.json(), seasonType);
}

export async function fetchGames(teams: Team[], season: number, includePreseason: boolean) {
  const types: SeasonType[] = includePreseason ? [1, 2, 3] : [2, 3];
  const schedules = await Promise.all(
    teams.flatMap((t) => types.map((type) => fetchSchedule(t.id, season, type))),
  );
  const byId = new Map(schedules.flat().map((g) => [g.id, g]));
  return [...byId.values()].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
