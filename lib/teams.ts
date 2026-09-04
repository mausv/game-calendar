export type Conference = "AFC" | "NFC";
export type Division = "East" | "North" | "South" | "West";

export type Team = {
  id: number;
  abbr: string;
  location: string;
  name: string;
  conference: Conference;
  division: Division;
  color: string;
};

const team = (
  id: number,
  abbr: string,
  location: string,
  name: string,
  conference: Conference,
  division: Division,
  color: string,
): Team => ({ id, abbr, location, name, conference, division, color });

export const TEAMS: Team[] = [
  team(2, "BUF", "Buffalo", "Bills", "AFC", "East", "#00338d"),
  team(15, "MIA", "Miami", "Dolphins", "AFC", "East", "#008e97"),
  team(17, "NE", "New England", "Patriots", "AFC", "East", "#002a5c"),
  team(20, "NYJ", "New York", "Jets", "AFC", "East", "#115740"),
  team(33, "BAL", "Baltimore", "Ravens", "AFC", "North", "#29126f"),
  team(4, "CIN", "Cincinnati", "Bengals", "AFC", "North", "#fb4f14"),
  team(5, "CLE", "Cleveland", "Browns", "AFC", "North", "#472a08"),
  team(23, "PIT", "Pittsburgh", "Steelers", "AFC", "North", "#000000"),
  team(34, "HOU", "Houston", "Texans", "AFC", "South", "#021018"),
  team(11, "IND", "Indianapolis", "Colts", "AFC", "South", "#003b75"),
  team(30, "JAX", "Jacksonville", "Jaguars", "AFC", "South", "#007487"),
  team(10, "TEN", "Tennessee", "Titans", "AFC", "South", "#4495d2"),
  team(7, "DEN", "Denver", "Broncos", "AFC", "West", "#0a2343"),
  team(12, "KC", "Kansas City", "Chiefs", "AFC", "West", "#e31837"),
  team(13, "LV", "Las Vegas", "Raiders", "AFC", "West", "#000000"),
  team(24, "LAC", "Los Angeles", "Chargers", "AFC", "West", "#0080c6"),
  team(6, "DAL", "Dallas", "Cowboys", "NFC", "East", "#002a5c"),
  team(19, "NYG", "New York", "Giants", "NFC", "East", "#003c7f"),
  team(21, "PHI", "Philadelphia", "Eagles", "NFC", "East", "#06424d"),
  team(28, "WSH", "Washington", "Commanders", "NFC", "East", "#5a1414"),
  team(3, "CHI", "Chicago", "Bears", "NFC", "North", "#0b1c3a"),
  team(8, "DET", "Detroit", "Lions", "NFC", "North", "#0076b6"),
  team(9, "GB", "Green Bay", "Packers", "NFC", "North", "#204e32"),
  team(16, "MIN", "Minnesota", "Vikings", "NFC", "North", "#4f2683"),
  team(1, "ATL", "Atlanta", "Falcons", "NFC", "South", "#a71930"),
  team(29, "CAR", "Carolina", "Panthers", "NFC", "South", "#0085ca"),
  team(18, "NO", "New Orleans", "Saints", "NFC", "South", "#d3bc8d"),
  team(27, "TB", "Tampa Bay", "Buccaneers", "NFC", "South", "#bd1c36"),
  team(22, "ARI", "Arizona", "Cardinals", "NFC", "West", "#a40227"),
  team(14, "LAR", "Los Angeles", "Rams", "NFC", "West", "#003594"),
  team(25, "SF", "San Francisco", "49ers", "NFC", "West", "#aa0000"),
  team(26, "SEA", "Seattle", "Seahawks", "NFC", "West", "#002a5c"),
];

export const teamByAbbr = new Map(TEAMS.map((t) => [t.abbr, t]));

export const logoUrl = (abbr: string) =>
  `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

// Ink or white, whichever reads better on a team color (WCAG relative luminance).
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luminance =
    0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
  return luminance > 0.35 ? "#14171c" : "#ffffff";
}
