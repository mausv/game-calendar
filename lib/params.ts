import { currentSeason } from "./espn";
import { teamByAbbr, type Team } from "./teams";

export type FeedParams = { teams: Team[]; season: number; preseason: boolean };

export function parseFeedParams(url: string): FeedParams | null {
  const params = new URL(url).searchParams;
  const abbrs = new Set(
    (params.get("teams") ?? "").split(",").map((s) => s.trim().toUpperCase()),
  );
  const teams = [...abbrs]
    .map((a) => teamByAbbr.get(a))
    .filter((t): t is Team => t !== undefined);
  if (teams.length === 0) return null;
  return {
    teams,
    season: Number(params.get("season")) || currentSeason(),
    preseason: params.get("pre") === "1",
  };
}

export const missingTeams = () =>
  new Response("Pass at least one valid team, e.g. ?teams=DAL,KC", { status: 400 });
