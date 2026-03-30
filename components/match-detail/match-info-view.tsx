import { Calendar, MapPin, Shield, Trophy, Zap } from "lucide-react";

import type { Match } from "@/lib/types";

function formatFullDate(date?: string) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return null;
  }
}

interface InfoTileProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

function InfoTile({ label, value, icon, highlight }: InfoTileProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 dark:border-white/[0.06]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        {icon && <span className="shrink-0">{icon}</span>}
        {label}
      </div>
      <p className={`mt-1.5 text-sm font-semibold ${highlight ? "text-green-400 dark:text-green-300" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

export function MatchInfoView({ match }: { match: Match }) {
  const formattedDate = formatFullDate(match.date);

  const tiles: InfoTileProps[] = [];
  if (match.matchType) tiles.push({ label: "Match Type", value: match.matchType.toUpperCase(), icon: <Zap className="h-3 w-3" /> });
  if (match.series) tiles.push({ label: "Series / Competition", value: match.series, icon: <Shield className="h-3 w-3" /> });
  if (formattedDate) tiles.push({ label: "Date & Time", value: formattedDate, icon: <Calendar className="h-3 w-3" /> });
  if (match.venue) tiles.push({ label: "Venue", value: match.venue, icon: <MapPin className="h-3 w-3" /> });
  if (match.winner) tiles.push({ label: "Result", value: match.winner, icon: <Trophy className="h-3 w-3" />, highlight: true });
  if (match.toss) tiles.push({ label: "Toss", value: match.toss });
  tiles.push({ label: "Status", value: match.statusText });
  if (match.name) tiles.push({ label: "Match", value: match.name });

  if (tiles.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-10 text-center text-sm text-muted-foreground dark:border-white/[0.06]">
        Match information not available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {tiles.map((tile) => (
        <InfoTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
