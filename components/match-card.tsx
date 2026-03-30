import { Calendar, Clock3, MapPin, Trophy } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Match, MatchStatus, TeamScore } from "@/lib/types";

/* ─── Team flags ─────────────────────────────────────────────────── */
const TEAM_FLAGS: Record<string, string> = {
  pakistan: "🇵🇰",
  india: "🇮🇳",
  australia: "🇦🇺",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "new zealand": "🇳🇿",
  "south africa": "🇿🇦",
  bangladesh: "🇧🇩",
  "sri lanka": "🇱🇰",
  afghanistan: "🇦🇫",
  zimbabwe: "🇿🇼",
  "west indies": "🌴",
  ireland: "🇮🇪",
  netherlands: "🇳🇱",
  scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  uae: "🇦🇪",
  oman: "🇴🇲",
  nepal: "🇳🇵",
  usa: "🇺🇸",
};

function getFlag(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, flag] of Object.entries(TEAM_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return "🏏";
}

/* ─── Date formatter ─────────────────────────────────────────────── */
function formatDate(date?: string) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return null;
  }
}

/* ─── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status, text }: { status: MatchStatus; text: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-400 ring-1 ring-green-500/20 dark:bg-green-500/10">
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-400 ring-1 ring-sky-500/20">
        <Clock3 className="h-3 w-3 shrink-0" />
        Upcoming
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ring-1 ring-slate-500/20 dark:bg-white/[0.05] dark:text-slate-300 dark:ring-white/10">
      <Trophy className="h-3 w-3 shrink-0" />
      {text.length > 16 ? "Finished" : text}
    </span>
  );
}

/* ─── Team block ─────────────────────────────────────────────────── */
interface TeamBlockProps {
  team: TeamScore | undefined;
  align: "left" | "right";
  isPak: boolean;
}

function TeamBlock({ team, align, isPak }: TeamBlockProps) {
  if (!team) return <div className="flex-1" />;

  const flag = getFlag(team.name);
  const isRight = align === "right";

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", isRight && "items-end text-right")}>
      {/* Flag + abbreviation */}
      <div className={cn("flex items-center gap-1.5", isRight && "flex-row-reverse")}>
        <span className="text-[15px] leading-none">{flag}</span>
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            isPak ? "text-green-500" : "text-muted-foreground"
          )}
        >
          {team.shortName ?? team.name.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Full team name */}
      <p className={cn(
        "truncate text-sm font-bold tracking-tight text-foreground",
        isPak && "text-green-400 dark:text-green-300"
      )}>
        {team.name}
      </p>

      {/* Score */}
      <p className={cn(
        "text-[22px] font-black tabular-nums tracking-tight sm:text-3xl",
        team.score ? "text-foreground" : "text-muted-foreground/50"
      )}>
        {team.score ?? "—"}
      </p>

      {/* Overs */}
      {team.overs && (
        <p className="text-[11px] font-medium text-muted-foreground">
          {team.overs} ov
        </p>
      )}

      {/* Run rate */}
      {team.runRate && (
        <p className="text-[11px] font-bold text-green-500 dark:text-green-400">
          RR {team.runRate}
        </p>
      )}
    </div>
  );
}

/* ─── Match card ─────────────────────────────────────────────────── */
interface MatchCardProps {
  match: Match;
  index: number;
}

export function MatchCard({ match, index }: MatchCardProps) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const formattedDate = formatDate(match.date);

  const team0IsPak = /\bpakistan\b|\bpak\b/i.test(match.teams[0]?.name ?? "");
  const team1IsPak = /\bpakistan\b|\bpak\b/i.test(match.teams[1]?.name ?? "");

  return (
    <Link
      href={`/match/${encodeURIComponent(match.id)}`}
      prefetch={false}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "opacity-0 animate-fade-up",
        "hover:-translate-y-1 cursor-pointer",
        isLive
          ? [
              "border-green-500/20 bg-card",
              "shadow-card-dark",
              "hover:border-green-500/35 hover:shadow-glow",
              "dark:border-green-500/15 dark:bg-[#060e18]",
            ]
          : isCompleted
          ? [
              "border-border/70 bg-card",
              "shadow-card",
              "hover:border-border hover:shadow-card-hover",
              "dark:border-white/[0.06] dark:bg-card",
            ]
          : [
              "border-sky-500/15 bg-card",
              "shadow-card",
              "hover:border-sky-500/25 hover:shadow-card-hover",
              "dark:border-sky-500/10 dark:bg-card",
            ]
      )}
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "forwards" }}
    >
      {/* Live accent line at top */}
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
      )}

      {/* Upcoming accent line */}
      {!isLive && !isCompleted && (
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
      )}

      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="min-w-0 flex-1">
          {match.series && (
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
              {match.series}
            </p>
          )}
          <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground/60">
            {match.name}
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <StatusBadge status={match.status} text={match.statusText} />
        </div>
      </div>

      {/* Score section — VS layout */}
      <div className="flex items-center gap-2 px-4 py-5 sm:gap-3 sm:px-5 sm:py-6">
        <TeamBlock
          team={match.teams[0]}
          align="left"
          isPak={team0IsPak}
        />

        {/* VS divider */}
        <div className="flex shrink-0 flex-col items-center gap-1 self-center px-1">
          <div className="h-8 w-px bg-border/60 dark:bg-white/[0.07]" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">
            vs
          </span>
          <div className="h-8 w-px bg-border/60 dark:bg-white/[0.07]" />
        </div>

        <TeamBlock
          team={match.teams[1]}
          align="right"
          isPak={team1IsPak}
        />
      </div>

      {/* Toss / winner info */}
      {(match.winner || match.toss) && (
        <div className={cn(
          "mx-4 mb-4 rounded-xl px-3.5 py-2.5 text-xs font-medium sm:mx-5",
          match.winner
            ? "bg-green-500/8 text-green-500 dark:bg-green-500/[0.08] dark:text-green-400 ring-1 ring-green-500/15"
            : "bg-muted/60 text-muted-foreground dark:bg-white/[0.04]"
        )}>
          {match.winner ? `🏆 ${match.winner}` : `🪙 ${match.toss}`}
        </div>
      )}

      {/* Footer meta */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 px-4 py-3 dark:border-white/[0.05] sm:px-5">
        {match.venue && (
          <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-[11px] text-muted-foreground/60">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </span>
        )}
        {formattedDate && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/60">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        )}
      </div>
    </article>
    </Link>
  );
}
