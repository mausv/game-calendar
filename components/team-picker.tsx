"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { GameList } from "@/components/game-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Game } from "@/lib/espn";
import { TEAMS, logoUrl, type Conference, type Division } from "@/lib/teams";
import { cn } from "@/lib/utils";

const CONFERENCES: Conference[] = ["AFC", "NFC"];
const DIVISIONS: Division[] = ["East", "North", "South", "West"];

const feedPath = (teams: string[], preseason: boolean) =>
  `/api/ics?teams=${teams.join(",")}${preseason ? "&pre=1" : ""}`;

export function TeamPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [preseason, setPreseason] = useState(false);
  const [copied, setCopied] = useState(false);
  const [games, setGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  const path = selected.length ? feedPath(selected, preseason) : "";
  const url = path && origin + path;
  const webcal = url.replace(/^https?/, "webcal");

  const load = async (teams: string[], pre: boolean) => {
    const id = ++requestId.current;
    if (!teams.length) {
      setGames(null);
      setFailed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data: Game[] | null = await fetch(`/api/games?teams=${teams.join(",")}${pre ? "&pre=1" : ""}`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
    if (id !== requestId.current) return;
    setGames(data);
    setFailed(data === null);
    setLoading(false);
  };

  const changeTeams = (teams: string[]) => {
    setSelected(teams);
    load(teams, preseason);
  };

  const changePreseason = (pre: boolean) => {
    setPreseason(pre);
    load(selected, pre);
  };

  const copy = async () => {
    inputRef.current?.select();
    // Clipboard access needs a secure context, which a plain-http home server isn't.
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <ToggleGroup
        multiple
        value={selected}
        onValueChange={changeTeams}
        variant="outline"
        className="grid w-full grid-cols-1 gap-6 md:grid-cols-2"
      >
        {CONFERENCES.map((conference) => (
          <div key={conference} className="flex flex-col gap-4">
            {DIVISIONS.map((division) => (
              <div key={division}>
                <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {conference} {division}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {TEAMS.filter(
                    (t) => t.conference === conference && t.division === division,
                  ).map((t) => (
                    <ToggleGroupItem
                      key={t.abbr}
                      value={t.abbr}
                      aria-label={`${t.location} ${t.name}`}
                      className="h-auto flex-col gap-1 py-2 aria-pressed:border-primary aria-pressed:bg-primary/10"
                    >
                      <Image src={logoUrl(t.abbr)} alt="" width={32} height={32} />
                      <span className="text-xs">{t.abbr}</span>
                    </ToggleGroupItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </ToggleGroup>

      <div className="flex items-center gap-3">
        <Switch id="preseason" checked={preseason} onCheckedChange={changePreseason} />
        <Label htmlFor="preseason">Include preseason games</Label>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <Label htmlFor="url">Calendar URL</Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="url"
            readOnly
            value={url}
            placeholder="Pick at least one team"
          />
          <Button onClick={copy} disabled={!url}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        {url && (
          <div className="flex gap-2">
            <a className={buttonVariants({ variant: "outline" })} href={webcal}>
              Subscribe
            </a>
            <a className={buttonVariants({ variant: "outline" })} href={path} download>
              Download .ics
            </a>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Paste the URL into Google Calendar (Other calendars → From URL), Apple Calendar
          (File → New Calendar Subscription), or Outlook. Your calendar re-fetches it on its
          own, so kickoff changes and playoff games show up automatically.
        </p>
      </div>

      {selected.length > 0 && (
        <section className={cn("flex flex-col gap-3", loading && "opacity-60")}>
          {failed ? (
            <p className="text-sm text-destructive">
              Couldn&apos;t load the schedule from ESPN. Try again in a minute.
            </p>
          ) : games ? (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-medium">
                  {games.length} games will be added to your calendar
                </h2>
                <span className="text-xs text-muted-foreground">Times in your local time zone</span>
              </div>
              <GameList games={games} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading games…</p>
          )}
        </section>
      )}
    </div>
  );
}
