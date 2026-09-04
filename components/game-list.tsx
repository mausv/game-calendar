import { SEASON_LABEL, type Game } from "@/lib/espn";
import { gameTitle } from "@/lib/ics";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const tbdDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "America/New_York",
});
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function GameList({ games }: { games: Game[] }) {
  return (
    <ol className="divide-y rounded-xl border">
      {games.map((g) => {
        const start = new Date(g.start);
        const details = [
          `Week ${g.week} · ${SEASON_LABEL[g.seasonType]}`,
          g.broadcasts.join(", "),
          g.note,
          g.venue,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={g.id} className="flex gap-4 px-4 py-3">
            <div className="w-28 shrink-0 text-sm">
              <div>{(g.timeTbd ? tbdDateFormat : dateFormat).format(start)}</div>
              <div className="text-muted-foreground">
                {g.timeTbd ? "TBD" : timeFormat.format(start)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-medium">{gameTitle(g)}</div>
              <div className="truncate text-sm text-muted-foreground">{details}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
