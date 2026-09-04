"use client";

import Image from "next/image";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TEAMS, logoUrl, textOn, type Conference, type Division } from "@/lib/teams";

const CONFERENCES: Conference[] = ["AFC", "NFC"];
const DIVISIONS: Division[] = ["East", "North", "South", "West"];

export function TeamBoard({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (teams: string[]) => void;
}) {
  return (
    <ToggleGroup
      multiple
      value={selected}
      onValueChange={onChange}
      variant="outline"
      aria-label="Teams"
      className="flex w-full flex-col items-stretch gap-6"
    >
      {CONFERENCES.map((conference) => (
        <div key={conference} className="flex flex-col gap-2">
          {DIVISIONS.map((division) => (
            <div
              key={division}
              className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] items-center gap-2"
            >
              <span className="text-sm text-muted-foreground">
                {conference} {division}
              </span>
              {TEAMS.filter((t) => t.conference === conference && t.division === division).map(
                (t) => {
                  const on = selected.includes(t.abbr);
                  return (
                    <ToggleGroupItem
                      key={t.abbr}
                      value={t.abbr}
                      title={`${t.location} ${t.name}`}
                      aria-label={`${t.location} ${t.name}`}
                      style={
                        on
                          ? { backgroundColor: t.color, borderColor: t.color, color: textOn(t.color) }
                          : undefined
                      }
                      className="h-auto flex-col gap-1.5 py-2.5"
                    >
                      <Image src={logoUrl(t.abbr)} alt="" width={28} height={28} />
                      <span className="font-condensed text-sm font-semibold tracking-wide">
                        {t.abbr}
                      </span>
                    </ToggleGroupItem>
                  );
                },
              )}
            </div>
          ))}
        </div>
      ))}
    </ToggleGroup>
  );
}
