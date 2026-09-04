"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { CalendarPanel } from "@/components/calendar-panel";
import { GameList } from "@/components/game-list";
import { TeamBoard } from "@/components/team-board";
import type { Game } from "@/lib/espn";
import { teamByAbbr, type Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

const feedPath = (teams: string[], preseason: boolean) =>
  `/api/ics?teams=${teams.join(",")}${preseason ? "&pre=1" : ""}`;

export function TeamPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [preseason, setPreseason] = useState(false);
  const [games, setGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);

  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  const teams = selected
    .map((abbr) => teamByAbbr.get(abbr))
    .filter((t): t is Team => t !== undefined);
  const path = selected.length ? feedPath(selected, preseason) : "";
  const url = path && origin + path;

  const load = async (abbrs: string[], pre: boolean) => {
    const id = ++requestId.current;
    if (!abbrs.length) {
      setGames(null);
      setFailed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data: Game[] | null = await fetch(
      `/api/games?teams=${abbrs.join(",")}${pre ? "&pre=1" : ""}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
    if (id !== requestId.current) return;
    setGames(data);
    setFailed(data === null);
    setLoading(false);
  };

  const changeTeams = (abbrs: string[]) => {
    setSelected(abbrs);
    load(abbrs, preseason);
  };

  const changePreseason = (pre: boolean) => {
    setPreseason(pre);
    load(selected, pre);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <TeamBoard selected={selected} onChange={changeTeams} />
        <div className="lg:sticky lg:top-6">
          <CalendarPanel
            teams={teams}
            games={games}
            loading={loading}
            failed={failed}
            preseason={preseason}
            onPreseasonChange={changePreseason}
            path={path}
            url={url}
          />
        </div>
      </div>

      {games && games.length > 0 && (
        <section className={cn("flex flex-col gap-4", loading && "opacity-60")}>
          <h2 className="font-condensed text-2xl">What lands on your calendar</h2>
          <GameList games={games} />
        </section>
      )}
    </div>
  );
}
