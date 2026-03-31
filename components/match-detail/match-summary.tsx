import { Calendar, Clock3, MapPin, Trophy } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Match, MatchStatus } from "@/lib/types";

/* ─── Team flags ─────────────────────────────────────────────────── */
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
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    }).format(new Date(date));
  } catch { return null; }
}

const PAK = /\bpakistan\b|\bpak\b/i;

/* ─── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status, text }: { status: MatchStatus; text: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-green-400 ring-1 ring-green-500/20 dark:bg-green-500/10">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
        </span>
        Live
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-400 ring-1 ring-sky-500/20">
        <Clock3 className="h-3.5 w-3.5 shrink-0" />
        Upcoming
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 ring-1 ring-slate-500/20 dark:bg-white/[0.05] dark:text-slate-300 dark:ring-white/10">
      <Trophy className="h-3.5 w-3.5 shrink-0" />
      {text.length > 18 ? "Finished" : text}
    </span>
  );
}

/* ─── Team column ────────────────────────────────────────────────── */
function TeamColumn({
  name, shortName, score, overs, runRate, align,
}: {
  name: string; shortName?: string; score?: string;
  overs?: string; runRate?: string; align: "left" | "right";
}) {
  const isPak = PAK.test(name);
  const flag = getFlag(name);
  const isRight = align === "right";

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1", isRight && "items-end text-right")}>
      <div className={cn("flex items-center gap-2", isRight && "flex-row-reverse")}>
        <span className="text-xl leading-none sm:text-3xl">{flag}</span>
        <span className={cn(
          "text-[11px] font-black uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]",
          isPak ? "text-green-500" : "text-muted-foreground"
        )}>
          {shortName ?? name.slice(0, 3).toUpperCase()}
        </span>
      </div>
      <p className={cn(
        "truncate text-sm font-bold tracking-tight sm:text-lg",
        isPak ? "text-green-400 dark:text-green-300" : "text-foreground"
      )}>
        {name}
      </p>
      <p className={cn(
        "text-[1.75rem] font-black tabular-nums tracking-tight sm:text-4xl",
        score ? "text-foreground" : "text-muted-foreground/30"
      )}>
        {score ?? "—"}
      </p>
      {overs && (
        <p className="text-sm font-medium text-muted-foreground">{overs} ov</p>
      )}
      {runRate && (
        <p className="text-xs font-bold text-green-500 dark:text-green-400">
          RR {runRate}
        </p>
      )}
    </div>
  );
}

/* ─── Match summary ──────────────────────────────────────────────── */
export function MatchSummary({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const formattedDate = formatDate(match.date);
  const team0 = match.teams[0];
  const team1 = match.teams[1];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border",
      isLive
        ? "border-green-500/20 bg-card dark:bg-[#060e18] shadow-glow"
        : isCompleted
        ? "border-border/70 bg-card shadow-card dark:border-white/[0.06]"
        : "border-sky-500/15 bg-card shadow-card dark:border-sky-500/10"
    )}>
      {/* Top accent */}
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/70 to-transparent" />
      )}
      {!isLive && !isCompleted && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
      )}

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {match.series && (
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                {match.series}
              </p>
            )}
            <p className="mt-0.5 truncate text-sm font-semibold text-muted-foreground/60">
              {match.name}
            </p>
          </div>
          <div className="shrink-0 self-start pt-0.5">
            <StatusBadge status={match.status} text={match.statusText} />
          </div>
        </div>

        {/* Score section */}
        <div className="mt-5 flex items-center gap-2 sm:mt-6 sm:gap-5">
          {team0 && (
            <TeamColumn
              name={team0.name}
              shortName={team0.shortName}
              score={team0.score}
              overs={team0.overs}
              runRate={team0.runRate}
              align="left"
            />
          )}

          <div className="flex shrink-0 flex-col items-center gap-1 self-center px-0.5 sm:gap-1.5">
            <div className="h-8 w-px bg-border/60 dark:bg-white/[0.07] sm:h-10" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 sm:text-[11px]">
              vs
            </span>
            <div className="h-8 w-px bg-border/60 dark:bg-white/[0.07] sm:h-10" />
          </div>

          {team1 && (
            <TeamColumn
              name={team1.name}
              shortName={team1.shortName}
              score={team1.score}
              overs={team1.overs}
              runRate={team1.runRate}
              align="right"
            />
          )}
        </div>

        {/* Result / toss */}
        {(match.winner || match.toss) && (
          <div className={cn(
            "mt-4 rounded-xl px-3.5 py-3 text-sm font-medium leading-6 sm:mt-5 sm:px-4",
            match.winner
              ? "bg-green-500/8 text-green-500 ring-1 ring-green-500/15 dark:bg-green-500/[0.08] dark:text-green-400"
              : "bg-muted/50 text-muted-foreground dark:bg-white/[0.04]"
          )}>
            {match.winner ? `🏆 ${match.winner}` : `🪙 ${match.toss}`}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4 dark:border-white/[0.06] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1.5">
          {formattedDate && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {formattedDate}
            </span>
          )}
          {match.venue && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground/70">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{match.venue}</span>
            </span>
          )}
          {match.matchType && (
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground dark:bg-white/[0.05]">
              {match.matchType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────── */
export function MatchSummarySkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 dark:border-white/[0.06] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-2.5 w-40 rounded-full" />
          <Skeleton className="h-3 w-56 rounded-full" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="mt-6 flex items-center gap-5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-10 rounded-full" />
          </div>
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-10 w-px" />
          <Skeleton className="h-3 w-5 rounded-full" />
          <Skeleton className="h-10 w-px" />
        </div>
        <div className="flex-1 flex flex-col items-end space-y-2">
          <div className="flex items-center gap-2 flex-row-reverse">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-10 rounded-full" />
          </div>
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      </div>
      <div className="mt-5 flex gap-4 border-t border-border/50 pt-4">
        <Skeleton className="h-3 w-36 rounded-full" />
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>
    </div>
  );
}
