# NFL Game Calendar

Pick your NFL teams and get one iCal link. Subscribe to it in Google, Apple or Outlook and every kickoff, venue and TV network shows up on your calendar and stays current all season, playoffs included.

Schedule data comes from ESPN's public API. There is no database: everything lives in the link.

## Feed

```
/api/ics?teams=DAL,KC          regular season + playoffs
/api/ics?teams=DAL,KC&pre=1    also preseason
/api/ics?teams=DAL&season=2027 a specific season (defaults to the current one)
```

`/api/games` takes the same parameters and returns JSON; the page uses it for the preview.

Games where two selected teams meet appear once. Flex games with no kickoff yet are all-day entries until the league sets a time. Calendar apps refresh the link on their own schedule, and the server caches ESPN responses for an hour.

## Run locally

```
make install
make dev        # http://localhost:3000
make check      # lint, typecheck, tests
```

## Deploy

Every push to `main` builds the image and publishes it as `ghcr.io/mausv/game-calendar:latest` (tags `v*` also get a version tag). On a host with Docker:

```
make deploy     # pull the published image and start it on port 3000
make logs
make down
```

`make up` builds the image from source instead of pulling it.

Google Calendar fetches subscriptions from its own servers, so the host has to be reachable from the internet for it; Apple Calendar and Outlook on the same network only need the LAN address.

## Release

```
pnpm version minor      # bumps package.json and creates the vX.Y.Z tag
git push --follow-tags  # the tag publishes ghcr.io/mausv/game-calendar:X.Y.Z
```
