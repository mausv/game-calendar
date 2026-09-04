import { fetchGames } from "@/lib/espn";
import { missingTeams, parseFeedParams } from "@/lib/params";

export async function GET(request: Request) {
  const params = parseFeedParams(request.url);
  if (!params) return missingTeams();
  const games = await fetchGames(params.teams, params.season, params.preseason);
  return Response.json(games, { headers: { "Cache-Control": "public, max-age=3600" } });
}
