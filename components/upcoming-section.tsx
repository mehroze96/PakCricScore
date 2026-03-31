"use client";

import { Calendar, Clock3, MapPin, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface UpcomingSectionProps {
  initialFetchedAt?: string | null;
  initialMatches?: Match[];
  initialError?: string | null;
}

/* ─── Team flag helper (same map as match-card) ──────────────────── */
const TEAM_FLAGS: Record<string, string> = {
  pakistan: "🇵🇰", india: "🇮🇳", australia: "🇦🇺", england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "new zealand": "🇳🇿", "south africa": "🇿🇦", bangladesh: "🇧🇩",
  "sri lanka": "🇱🇰", afghanistan: "🇦🇫", zimbabwe: "🇿🇼",
  "west indies": "🌴", ireland: "🇮🇪", netherlands: "🇳🇱",
  scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", uae: "🇦🇪", oman: "🇴🇲", nepal: "🇳🇵", usa: "🇺🇸",
};

function getFlag(name: string) {
  const lower = name.toLowerCase();
  for (const [key, flag] of Object.entries(TEAM_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return "🏏";
}

function formatDate(date?: string) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    }).format(new Date(date));
  } catch { return null; }
}

/* ─── Compact upcoming fixture card ─────────────────────────────── */
function UpcomingFixtureCard({ match, index }: { match: Match; index: number }) {
  const team0 = match.teams[0];
  const team1 = match.teams[1];
  const formattedDate = formatDate(match.date);

  return (
    <Link
      href={`/match/${encodeURIComponent(match.id)}`}
      prefetch={false}
      className="block w-full min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div
        className={cn(
          "group relative flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-sky-500/15 bg-card p-3.5 transition-all duration-300 sm:p-4",
          "opacity-0 animate-fade-up active:scale-[0.995] sm:hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-card-hover",
          "dark:border-sky-500/10 dark:bg-card cursor-pointer"
        )}
        style={{ animationDelay: `${index * 60}ms`, animationFillMode: "forwards" }}
      >
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

        {/* Header */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {match.series && (
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {match.series}
              </p>
            )}
            {match.matchType && (
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-500/70">
                {match.matchType}
              </p>
            )}
          </div>
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-400 ring-1 ring-sky-500/20 sm:shrink-0 sm:px-2.5 sm:tracking-[0.14em]">
            <Clock3 className="h-3 w-3" />
            Upcoming
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {team0 && (
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="text-base leading-none">{getFlag(team0.name)}</span>
              <div className="min-w-0">
                <p className={cn(
                  "truncate text-[13px] font-bold sm:text-sm",
                  /\bpakistan\b|\bpak\b/i.test(team0.name) ? "text-green-400 dark:text-green-300" : "text-foreground"
                )}>
                  {team0.name}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                  {team0.shortName}
                </p>
              </div>
            </div>
          )}

          <span className="shrink-0 text-[10px] font-black text-muted-foreground/40">vs</span>

          {team1 && (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <div className="min-w-0 text-right">
                <p className={cn(
                  "truncate text-[13px] font-bold sm:text-sm",
                  /\bpakistan\b|\bpak\b/i.test(team1.name) ? "text-green-400 dark:text-green-300" : "text-foreground"
                )}>
                  {team1.name}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                  {team1.shortName}
                </p>
              </div>
              <span className="text-base leading-none">{getFlag(team1.name)}</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2.5 text-[11px] dark:border-white/[0.05] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
          {formattedDate && (
            <span className="flex items-center gap-1 text-muted-foreground/60">
              <Calendar className="h-3 w-3 shrink-0" />
              {formattedDate}
            </span>
          )}
          {match.venue && (
            <span className="flex min-w-0 items-center gap-1 truncate text-muted-foreground/60 sm:flex-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{match.venue}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function UpcomingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 dark:border-white/[0.06] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-2.5 w-32 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-2.5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-3 w-4 rounded-full" />
        <div className="flex-1 space-y-1.5 items-end flex flex-col">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-2.5 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex gap-3 pt-1 border-t border-border/40">
        <Skeleton className="h-2.5 w-28 rounded-full" />
        <Skeleton className="h-2.5 w-24 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────── */
export function UpcomingSection({
  initialFetchedAt = null,
  initialMatches = [],
  initialError = null,
}: UpcomingSectionProps) {
  const hasInitialPayload = initialFetchedAt !== null || initialError !== null;
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(!hasInitialPayload);
  const [error, setError] = useState<string | null>(initialError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/matches/upcoming");
      const data = (await res.json()) as { matches?: Match[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load upcoming fixtures.");
      setMatches(data.matches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load upcoming fixtures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMatches(initialMatches);
    setError(initialError);
    setLoading(!hasInitialPayload);
  }, [hasInitialPayload, initialError, initialMatches]);

  useEffect(() => {
    if (!hasInitialPayload) {
      void load();
    }
  }, [hasInitialPayload, load]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-500/70">
            Schedule
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Upcoming Pakistan Fixtures
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="h-10 w-full gap-1.5 text-xs sm:h-8 sm:w-auto"
        >
          <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground dark:border-white/[0.06]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <UpcomingCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-7 text-sm text-muted-foreground dark:border-white/[0.06] sm:px-5 sm:py-8">
          No upcoming Pakistan matches in the next few days
        </div>
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match, index) => (
            <UpcomingFixtureCard key={match.id} match={match} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
