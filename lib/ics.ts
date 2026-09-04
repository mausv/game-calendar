import { SEASON_LABEL, type Game } from "./espn";

const GAME_DURATION_MS = (3 * 60 + 15) * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const easternDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateStamp = (d: Date) => easternDate.format(d).replaceAll("-", "");

const nextDay = (yyyymmdd: string) => {
  const n = new Date(
    Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8) + 1),
  );
  return `${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}`;
};

const escape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// RFC 5545 §3.1: lines are at most 75 octets; continuations start with a space.
export function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function gameTitle(game: Game): string {
  const matchup = game.neutralSite
    ? `${game.away.name} vs ${game.home.name}`
    : `${game.away.name} @ ${game.home.name}`;
  const tag =
    game.seasonType === 1
      ? " (Preseason)"
      : game.seasonType === 3 && game.note
        ? ` (${game.note})`
        : "";
  return game.timeTbd ? `${matchup}${tag} - time TBD` : `${matchup}${tag}`;
}

function gameDescription(game: Game): string {
  const lines = [`Week ${game.week} · ${SEASON_LABEL[game.seasonType]}`];
  if (game.broadcasts.length) lines.push(`TV: ${game.broadcasts.join(", ")}`);
  if (game.note) lines.push(game.note);
  return lines.join("\n");
}

function event(game: Game, stamp: string): string[] {
  const start = new Date(game.start);
  const when = game.timeTbd
    ? [`DTSTART;VALUE=DATE:${dateStamp(start)}`, `DTEND;VALUE=DATE:${nextDay(dateStamp(start))}`]
    : [
        `DTSTART:${utcStamp(start)}`,
        `DTEND:${utcStamp(new Date(start.getTime() + GAME_DURATION_MS))}`,
      ];
  return [
    "BEGIN:VEVENT",
    `UID:${game.id}@game-calendar`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${escape(gameTitle(game))}`,
    ...(game.venue ? [`LOCATION:${escape(game.venue)}`] : []),
    `DESCRIPTION:${escape(gameDescription(game))}`,
    "END:VEVENT",
  ];
}

export function buildCalendar(
  games: Game[],
  { name, now = new Date() }: { name: string; now?: Date },
): string {
  const stamp = utcStamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//game-calendar//NFL//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escape(name)}`,
    "X-PUBLISHED-TTL:PT1H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    ...games.flatMap((g) => event(g, stamp)),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
