"use client";

import { RefreshCcw, ServerCrash, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Match, MatchStatus } from "@/lib/types";

const REFRESH_INTERVAL = 60;

type Tab = "all" | MatchStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

/* ─── Skeleton card matching the real card shape ─────────────────── */
function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 dark:border-white/[0.06]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2.5 w-28 rounded-full" />
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* VS score area */}
      <div className="mt-6 flex items-center gap-4">
        {/* Left team */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-2.5 w-10 rounded-full" />
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-7 w-px" />
          <Skeleton className="h-2.5 w-4 rounded-full" />
          <Skeleton className="h-7 w-px" />
        </div>

        {/* Right team */}
        <div className="flex flex-1 flex-col items-end space-y-2">
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-2.5 w-10 rounded-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 dark:border-white/[0.05]">
        <Skeleton className="h-2.5 w-32 rounded-full" />
        <Skeleton className="h-2.5 w-20 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState({ activeTab }: { activeTab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card px-6 py-16 text-center dark:border-white/[0.06]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-2xl dark:bg-white/[0.04]">
        <WifiOff className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground">
        {activeTab === "all"
          ? "No Pakistan matches"
          : `No ${activeTab} matches`}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {activeTab === "live"
          ? "No live Pakistan matches right now. Check back soon."
          : activeTab === "upcoming"
          ? "No upcoming fixtures found in the current feed."
          : "We couldn't find any Pakistan fixtures at the moment."}
      </p>
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────────── */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-card px-6 py-16 text-center dark:bg-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <ServerCrash className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground">Unable to load matches</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button
        className="mt-6 gap-2"
        onClick={onRetry}
        disabled={isRetrying}
        size="sm"
      >
        <RefreshCcw className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")} />
        Try again
      </Button>
    </div>
  );
}

/* ─── Refresh countdown ring ─────────────────────────────────────── */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const progress = ((total - seconds) / total) * circ;

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
      <circle cx="12" cy="12" r={r} fill="none" strokeWidth="2" className="stroke-border/60" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeDasharray={circ}
        strokeDashoffset={circ - progress}
        strokeLinecap="round"
        className="stroke-green-500/60 transition-all duration-1000"
      />
    </svg>
  );
}

/* ─── Main board ─────────────────────────────────────────────────── */
export function MatchesBoard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMatches = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json() as { matches?: Match[]; error?: string; fetchedAt?: string };

      if (!res.ok) throw new Error(data.error ?? "Failed to load scores.");

      setMatches(data.matches ?? []);
      if (data.fetchedAt) {
        setFetchedAt(
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(new Date(data.fetchedAt))
        );
      }
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch Pakistan matches.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  // Countdown + auto-refresh
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void loadMatches(true);
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [loadMatches]);

  // Filtered matches by tab
  const filtered = activeTab === "all" ? matches : matches.filter((m) => m.status === activeTab);

  // Count by status
  const counts = {
    all: matches.length,
    live: matches.filter((m) => m.status === "live").length,
    upcoming: matches.filter((m) => m.status === "upcoming").length,
    completed: matches.filter((m) => m.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Pakistan Fixtures
        </h2>
        <p className="text-sm text-muted-foreground">
          {fetchedAt ? `Updated at ${fetchedAt}` : "Loading match data…"}
        </p>
      </div>

      {/* Tab bar + refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs — horizontally scrollable on mobile */}
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-150 sm:py-1.5",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm dark:bg-white/[0.08] dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={cn(
                    "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-black",
                    activeTab === tab.id
                      ? tab.id === "live"
                        ? "bg-green-500/15 text-green-500"
                        : "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground dark:bg-white/[0.06]"
                  )}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!loading && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60">
              <CountdownRing seconds={countdown} total={REFRESH_INTERVAL} />
              <span>{countdown}s</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadMatches(true)}
            disabled={refreshing || loading}
            className="h-9 gap-1.5 border-border/70 text-xs dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadMatches(true)} isRetrying={refreshing} />
      ) : filtered.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
