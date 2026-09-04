import { TeamPicker } from "@/components/team-picker";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-col gap-5 border-b pb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-muted-foreground">
          <span>NFL Game Calendar</span>
          <span>Schedule data from ESPN</span>
        </div>
        <h1 className="max-w-3xl font-condensed text-5xl leading-[0.95] sm:text-6xl">
          Your teams&apos; games, on your calendar.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Pick your teams and copy one link. Every kickoff, venue and TV network shows up in
          Google, Apple or Outlook, and stays current all season.
        </p>
      </header>
      <TeamPicker />
      <footer className="border-t pt-6 text-sm text-muted-foreground">
        Times are shown in your time zone. Flex games appear as all-day entries until the league
        sets a kickoff.
      </footer>
    </main>
  );
}
