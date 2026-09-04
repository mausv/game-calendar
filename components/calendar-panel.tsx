"use client";

import { useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatGameDate } from "@/lib/dates";
import type { Game } from "@/lib/espn";
import type { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

const span = { month: "short", day: "numeric" } as const;

type Props = {
  teams: Team[];
  games: Game[] | null;
  loading: boolean;
  failed: boolean;
  preseason: boolean;
  onPreseasonChange: (on: boolean) => void;
  path: string;
  url: string;
};

function summary({ teams, games, loading, failed }: Props) {
  if (!teams.length) return "Pick a team to build your link.";
  if (failed) return "ESPN didn't answer. Try again in a minute.";
  if (!games) return loading ? "Loading games…" : "";
  if (!games.length) return "No games published yet for this season.";
  const first = formatGameDate(games[0], span);
  const last = formatGameDate(games[games.length - 1], span);
  return `${games.length} games, ${first} to ${last}`;
}

export function CalendarPanel(props: Props) {
  const { teams, preseason, onPreseasonChange, path, url } = props;
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const webcal = url.replace(/^https?/, "webcal");

  const copy = async () => {
    inputRef.current?.select();
    // Clipboard access needs a secure context, which a plain-http home server isn't.
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside className="flex flex-col">
      <div className="flex h-1.5 overflow-hidden rounded-t-sm">
        {teams.length ? (
          teams.map((t) => (
            <div key={t.abbr} className="flex-1" style={{ backgroundColor: t.color }} />
          ))
        ) : (
          <div className="flex-1 bg-border" />
        )}
      </div>
      <div className="flex flex-col gap-5 rounded-b-md border border-t-0 p-5">
        <div>
          <h2 className="font-condensed text-2xl">
            {teams.length ? teams.map((t) => t.name).join(" + ") : "Your calendar"}
          </h2>
          <p className="text-sm text-muted-foreground">{summary(props)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="preseason" checked={preseason} onCheckedChange={onPreseasonChange} />
          <Label htmlFor="preseason">Include preseason</Label>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="url">Calendar link</Label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              id="url"
              readOnly
              value={url}
              placeholder="Appears once you pick a team"
              className="font-mono text-xs"
            />
            <Button onClick={copy} disabled={!url}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
          {url && (
            <div className="flex gap-2">
              <a className={cn(buttonVariants({ variant: "outline" }))} href={webcal}>
                Subscribe
              </a>
              <a className={cn(buttonVariants({ variant: "outline" }))} href={path} download>
                Download .ics
              </a>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Add it in Google Calendar under Other calendars, From URL; in Apple Calendar under
          File, New Calendar Subscription; or in Outlook. Your calendar refreshes it on its own,
          so kickoff changes and playoff games show up by themselves.
        </p>
      </div>
    </aside>
  );
}
