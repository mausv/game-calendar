export type Conference = "AFC" | "NFC";
export type Division = "East" | "North" | "South" | "West";

export type Team = {
  id: number;
  abbr: string;
  location: string;
  name: string;
  conference: Conference;
  division: Division;
};

const team = (
  id: number,
  abbr: string,
  location: string,
  name: string,
  conference: Conference,
  division: Division,
): Team => ({ id, abbr, location, name, conference, division });

export const TEAMS: Team[] = [
  team(2, "BUF", "Buffalo", "Bills", "AFC", "East"),
  team(15, "MIA", "Miami", "Dolphins", "AFC", "East"),
  team(17, "NE", "New England", "Patriots", "AFC", "East"),
  team(20, "NYJ", "New York", "Jets", "AFC", "East"),
  team(33, "BAL", "Baltimore", "Ravens", "AFC", "North"),
  team(4, "CIN", "Cincinnati", "Bengals", "AFC", "North"),
  team(5, "CLE", "Cleveland", "Browns", "AFC", "North"),
  team(23, "PIT", "Pittsburgh", "Steelers", "AFC", "North"),
  team(34, "HOU", "Houston", "Texans", "AFC", "South"),
  team(11, "IND", "Indianapolis", "Colts", "AFC", "South"),
  team(30, "JAX", "Jacksonville", "Jaguars", "AFC", "South"),
  team(10, "TEN", "Tennessee", "Titans", "AFC", "South"),
  team(7, "DEN", "Denver", "Broncos", "AFC", "West"),
  team(12, "KC", "Kansas City", "Chiefs", "AFC", "West"),
  team(13, "LV", "Las Vegas", "Raiders", "AFC", "West"),
  team(24, "LAC", "Los Angeles", "Chargers", "AFC", "West"),
  team(6, "DAL", "Dallas", "Cowboys", "NFC", "East"),
  team(19, "NYG", "New York", "Giants", "NFC", "East"),
  team(21, "PHI", "Philadelphia", "Eagles", "NFC", "East"),
  team(28, "WSH", "Washington", "Commanders", "NFC", "East"),
  team(3, "CHI", "Chicago", "Bears", "NFC", "North"),
  team(8, "DET", "Detroit", "Lions", "NFC", "North"),
  team(9, "GB", "Green Bay", "Packers", "NFC", "North"),
  team(16, "MIN", "Minnesota", "Vikings", "NFC", "North"),
  team(1, "ATL", "Atlanta", "Falcons", "NFC", "South"),
  team(29, "CAR", "Carolina", "Panthers", "NFC", "South"),
  team(18, "NO", "New Orleans", "Saints", "NFC", "South"),
  team(27, "TB", "Tampa Bay", "Buccaneers", "NFC", "South"),
  team(22, "ARI", "Arizona", "Cardinals", "NFC", "West"),
  team(14, "LAR", "Los Angeles", "Rams", "NFC", "West"),
  team(25, "SF", "San Francisco", "49ers", "NFC", "West"),
  team(26, "SEA", "Seattle", "Seahawks", "NFC", "West"),
];

export const teamByAbbr = new Map(TEAMS.map((t) => [t.abbr, t]));

export const logoUrl = (abbr: string) =>
  `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
