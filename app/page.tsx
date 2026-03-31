import { getCurrentPakistanMatches, getUpcomingPakistanMatches } from "@/lib/api";
import { Header } from "@/components/header";
import { MatchesBoard } from "@/components/matches-board";
import { UpcomingSection } from "@/components/upcoming-section";

export default async function HomePage() {
  const [liveResult, upcomingResult] = await Promise.all([
    getCurrentPakistanMatches()
      .then((payload) => ({ payload, error: null }))
      .catch((error) => ({
        payload: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch Pakistan matches right now.",
      })),
    getUpcomingPakistanMatches()
      .then((payload) => ({ payload, error: null }))
      .catch((error) => ({
        payload: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch upcoming Pakistan matches.",
      })),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className="flex-1 py-5 sm:py-8"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
          <MatchesBoard
            initialError={liveResult.error}
            initialFetchedAt={liveResult.payload?.fetchedAt ?? null}
            initialMatches={liveResult.payload?.matches ?? []}
          />
          <div className="border-t border-border/40" />
          <UpcomingSection
            initialError={upcomingResult.error}
            initialFetchedAt={upcomingResult.payload?.fetchedAt ?? null}
            initialMatches={upcomingResult.payload?.matches ?? []}
          />
        </div>
      </main>
      <footer
        className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <p>PakScore · Data via CricketData API · Updates every 60s</p>
      </footer>
    </div>
  );
}
