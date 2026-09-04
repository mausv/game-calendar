import type { Game } from "./espn";

const EASTERN = "America/New_York";

// Flex games carry a placeholder kickoff, so they are dated by the league's own (Eastern) calendar.
export function formatGameDate(game: Game, options: Intl.DateTimeFormatOptions): string {
  const resolved = game.timeTbd ? { ...options, timeZone: EASTERN } : options;
  return new Intl.DateTimeFormat(undefined, resolved).format(new Date(game.start));
}
