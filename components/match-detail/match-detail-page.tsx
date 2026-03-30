"use client";

import { ChevronLeft, RefreshCcw, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  MatchSummary,
  MatchSummarySkeleton,
} from "@/components/match-detail/match-summary";
import { MatchInfoView } from "@/components/match-detail/match-info-view";
import {
  ScorecardSkeleton,
  ScorecardView,
} from "@/components/match-detail/scorecard-view";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import type { InningsScore, Match } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "scorecard" | "info";

const TABS: { id: Tab; label: string }[] = [
  { id: "scorecard", label: "Scorecard" },
  { id: "info", label: "Match Info" },
];

interface MatchDetailPageProps {
  hasInitialScorecardPayload?: boolean;
  id: string;
  initialInnings?: InningsScore[];
  initialMatch?: Match | null;
  initialMatchError?: string | null;
  initialScorecardError?: string | null;
}

function MatchErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-card px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <ServerCrash className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground">Unable to load match</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button className="mt-6" size="sm" onClick={onRetry}>
        <RefreshCcw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}

function ScorecardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-6 py-10 text-center dark:border-white/[0.06]">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCcw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}

async function parseApiResponse<T>(response: Response) {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function MatchDetailPage({
  hasInitialScorecardPayload = false,
  id,
  initialInnings = [],
  initialMatch = null,
  initialMatchError = null,
  initialScorecardError = null,
}: MatchDetailPageProps) {
  const [match, setMatch] = useState<Match | null>(initialMatch);
  const [innings, setInnings] = useState<InningsScore[]>(initialInnings);
  const [matchLoading, setMatchLoading] = useState(!initialMatch && !initialMatchError);
  const [scorecardLoading, setScorecardLoading] = useState(!hasInitialScorecardPayload);
  const [matchError, setMatchError] = useState<string | null>(initialMatchError);
  const [scorecardError, setScorecardError] = useState<string | null>(initialScorecardError);
  const [activeTab, setActiveTab] = useState<Tab>("scorecard");

  const fetchScorecard = useCallback(async () => {
    setScorecardLoading(true);
    setScorecardError(null);

    try {
      const data = await parseApiResponse<{ innings?: InningsScore[] }>(
        await fetch(`/api/matches/${encodeURIComponent(id)}/scorecard`)
      );

      setInnings(data.innings ?? []);
    } catch (error) {
      setScorecardError(error instanceof Error ? error.message : "Failed to load scorecard.");
    } finally {
      setScorecardLoading(false);
    }
  }, [id]);

  const fetchAll = useCallback(async () => {
    setMatchLoading(true);
    setScorecardLoading(true);
    setMatchError(null);
    setScorecardError(null);

    const [matchSettled, scorecardSettled] = await Promise.allSettled([
      parseApiResponse<{ match?: Match }>(
        await fetch(`/api/matches/${encodeURIComponent(id)}`)
      ),
      parseApiResponse<{ innings?: InningsScore[] }>(
        await fetch(`/api/matches/${encodeURIComponent(id)}/scorecard`)
      ),
    ]);

    if (matchSettled.status === "fulfilled") {
      setMatch(matchSettled.value.match ?? null);
    } else {
      setMatchError(
        matchSettled.reason instanceof Error
          ? matchSettled.reason.message
          : "Failed to load match details."
      );
    }
    setMatchLoading(false);

    if (scorecardSettled.status === "fulfilled") {
      setInnings(scorecardSettled.value.innings ?? []);
    } else {
      setScorecardError(
        scorecardSettled.reason instanceof Error
          ? scorecardSettled.reason.message
          : "Failed to load scorecard."
      );
    }
    setScorecardLoading(false);
  }, [id]);

  useEffect(() => {
    if (!initialMatch && !initialMatchError) {
      void fetchAll();
      return;
    }

    if (!hasInitialScorecardPayload) {
      void fetchScorecard();
    }
  }, [
    fetchAll,
    fetchScorecard,
    hasInitialScorecardPayload,
    id,
    initialMatch,
    initialMatchError,
  ]);

  const showTabs = !matchLoading && !matchError && match;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className="flex-1 py-6 sm:py-8"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="mx-auto max-w-4xl space-y-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Pakistan Fixtures
          </Link>

          {matchLoading ? (
            <MatchSummarySkeleton />
          ) : matchError ? (
            <MatchErrorState message={matchError} onRetry={() => void fetchAll()} />
          ) : match ? (
            <MatchSummary match={match} />
          ) : null}

          {showTabs && (
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm dark:bg-white/[0.08] dark:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {showTabs && activeTab === "scorecard" &&
            (scorecardLoading ? (
              <ScorecardSkeleton />
            ) : scorecardError ? (
              <ScorecardErrorState message={scorecardError} onRetry={() => void fetchScorecard()} />
            ) : (
              <ScorecardView innings={innings} />
            ))}

          {showTabs && activeTab === "info" && <MatchInfoView match={match} />}
        </div>
      </main>

      <footer
        className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <p>PakScore · Data via CricketData API</p>
      </footer>
    </div>
  );
}
