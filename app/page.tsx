import { TeamPicker } from "@/components/team-picker";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">NFL Game Calendar</h1>
        <p className="text-muted-foreground">
          Pick your teams, then subscribe to the calendar URL. Kickoff times, venues, and TV
          networks come from ESPN and stay up to date.
        </p>
      </header>
      <TeamPicker />
    </main>
  );
}
