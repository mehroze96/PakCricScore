import { Header } from "@/components/header";
import { MatchesBoard } from "@/components/matches-board";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className="flex-1 py-8"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <MatchesBoard />
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
