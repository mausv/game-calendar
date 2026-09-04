import { fetchGames } from "@/lib/espn";
import { buildCalendar } from "@/lib/ics";
import { missingTeams, parseFeedParams } from "@/lib/params";

export async function GET(request: Request) {
  const params = parseFeedParams(request.url);
  if (!params) return missingTeams();
  const { teams, season, preseason } = params;

  const games = await fetchGames(teams, season, preseason);
  const name =
    teams.length <= 3
      ? `${teams.map((t) => t.name).join(" + ")} ${season}`
      : `NFL ${season} (${teams.length} teams)`;
  const slug = teams.map((t) => t.abbr.toLowerCase()).join("-");

  return new Response(buildCalendar(games, { name }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}-${season}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
