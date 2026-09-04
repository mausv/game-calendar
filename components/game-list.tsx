import { formatGameDate } from "@/lib/dates";
import type { Game } from "@/lib/espn";
import { gameTitle } from "@/lib/ics";

const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const weekLabel = (g: Game) =>
  g.seasonType === 1 ? `Preseason week ${g.week}` : g.seasonType === 2 ? `Week ${g.week}` : null;

export function GameList({ games }: { games: Game[] }) {
  const byMonth = new Map<string, Game[]>();
  for (const g of games) {
    const key = formatGameDate(g, { month: "long", year: "numeric" });
    byMonth.set(key, [...(byMonth.get(key) ?? []), g]);
  }

  return (
    <div className="flex flex-col gap-8">
      {[...byMonth].map(([label, monthGames]) => (
        <section key={label}>
          <h3 className="font-condensed text-xl">{label}</h3>
          <ol className="mt-2 divide-y border-y">
            {monthGames.map((g) => (
              <li
                key={g.id}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 py-3 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:items-baseline"
              >
                <div className="row-span-2 sm:row-span-1">
                  <span className="block font-condensed text-3xl leading-none tabular-nums">
                    {formatGameDate(g, { day: "numeric" })}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatGameDate(g, { weekday: "short" })}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium">{gameTitle(g)}</div>
                  <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                    {weekLabel(g) && <span>{weekLabel(g)}</span>}
                    {g.broadcasts.length > 0 && <span>{g.broadcasts.join(", ")}</span>}
                    {g.venue && <span className="truncate">{g.venue}</span>}
                  </div>
                </div>
                <div className="font-condensed text-lg tabular-nums sm:text-right">
                  {g.timeTbd ? "TBD" : time.format(new Date(g.start))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
