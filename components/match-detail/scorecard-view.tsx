import { ClipboardList } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { BatsmanScore, BowlerFigure, ExtrasBreakdown, InningsScore } from "@/lib/types";

/* ─── Batting table ──────────────────────────────────────────────── */
function BattingTable({
  batting,
  extras,
  total,
}: {
  batting: BatsmanScore[];
  extras: ExtrasBreakdown;
  total: { runs: number; wickets: number; overs: string };
}) {
  const extrasStr = [
    extras.byes > 0 && `b ${extras.byes}`,
    extras.legByes > 0 && `lb ${extras.legByes}`,
    extras.wides > 0 && `w ${extras.wides}`,
    extras.noBalls > 0 && `nb ${extras.noBalls}`,
    extras.penalty > 0 && `p ${extras.penalty}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[520px] text-[13px] sm:min-w-[560px] sm:text-sm">
        <thead>
          <tr className="border-b border-border/50 dark:border-white/[0.07]">
            <th className="py-2 pr-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-[28%]">
              Batsman
            </th>
            <th className="py-2 pr-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-[32%]">
              Dismissal
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-foreground w-14">
              R
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-12">
              B
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-10">
              4s
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-10">
              6s
            </th>
            <th className="py-2 pl-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
              SR
            </th>
          </tr>
        </thead>
        <tbody>
          {batting.map((b, i) => {
            const notOut = b.dismissal.toLowerCase() === "not out";
            const isCentury = b.runs >= 100;
            const isFifty = b.runs >= 50 && !isCentury;
            return (
              <tr
                key={i}
                className="border-b border-border/25 last:border-0 transition-colors hover:bg-muted/20 dark:hover:bg-white/[0.02] dark:border-white/[0.04]"
              >
                <td className="py-3 pr-4">
                  <span className={cn(
                    "font-semibold",
                    notOut ? "text-green-400 dark:text-green-300" : "text-foreground"
                  )}>
                    {b.name}
                    {notOut && (
                      <span className="ml-0.5 text-green-500 font-black">*</span>
                    )}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-muted-foreground">
                  {b.dismissal}
                </td>
                <td className={cn(
                  "py-3 px-2 text-right font-black tabular-nums",
                  isCentury ? "text-yellow-400" : isFifty ? "text-amber-300" : "text-foreground"
                )}>
                  {b.runs}
                </td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                  {b.balls}
                </td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                  {b.fours}
                </td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                  {b.sixes}
                </td>
                <td className="py-3 pl-2 text-right tabular-nums text-muted-foreground">
                  {b.strikeRate}
                </td>
              </tr>
            );
          })}

          {/* Extras */}
          <tr className="border-t border-border/50 bg-muted/10 dark:border-white/[0.07] dark:bg-white/[0.02]">
            <td className="py-2.5 pr-4 text-xs font-semibold text-muted-foreground">
              Extras
            </td>
            <td className="py-2.5 pr-4 text-xs text-muted-foreground">
              {extrasStr ? `(${extrasStr})` : "—"}
            </td>
            <td className="py-2.5 px-2 text-right text-sm font-bold tabular-nums text-foreground">
              {extras.total}
            </td>
            <td colSpan={4} />
          </tr>

          {/* Total */}
          <tr className="bg-muted/20 dark:bg-white/[0.03]">
            <td className="py-2.5 pr-4 text-xs font-black uppercase tracking-[0.1em] text-foreground">
              Total
            </td>
            <td className="py-2.5 pr-4 text-xs text-muted-foreground">
              {total.wickets} wkt{total.wickets !== 1 ? "s" : ""} ({total.overs} ov)
            </td>
            <td className="py-2.5 px-2 text-right text-sm font-black tabular-nums text-foreground">
              {total.runs}
            </td>
            <td colSpan={4} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ─── Bowling table ──────────────────────────────────────────────── */
function BowlingTable({ bowling }: { bowling: BowlerFigure[] }) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[360px] text-[13px] sm:min-w-[400px] sm:text-sm">
        <thead>
          <tr className="border-b border-border/50 dark:border-white/[0.07]">
            <th className="py-2 pr-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-[40%]">
              Bowler
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-14">
              O
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-12">
              M
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60 w-12">
              R
            </th>
            <th className="py-2 px-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-foreground w-12">
              W
            </th>
            <th className="py-2 pl-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
              Eco
            </th>
          </tr>
        </thead>
        <tbody>
          {bowling.map((b, i) => (
            <tr
              key={i}
              className="border-b border-border/25 last:border-0 transition-colors hover:bg-muted/20 dark:hover:bg-white/[0.02] dark:border-white/[0.04]"
            >
              <td className="py-3 pr-4 font-semibold text-foreground">
                {b.name}
              </td>
              <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                {b.overs}
              </td>
              <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                {b.maidens}
              </td>
              <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                {b.runs}
              </td>
              <td className={cn(
                "py-3 px-2 text-right font-black tabular-nums",
                b.wickets >= 5 ? "text-yellow-400" :
                b.wickets >= 3 ? "text-green-400" :
                b.wickets > 0 ? "text-green-500/80" :
                "text-foreground"
              )}>
                {b.wickets}
              </td>
              <td className="py-3 pl-2 text-right tabular-nums text-muted-foreground">
                {b.economy}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Single innings section ─────────────────────────────────────── */
function InningsSection({ innings }: { innings: InningsScore }) {
  const hasBatting = innings.batting.length > 0;
  const hasBowling = innings.bowling.length > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card dark:border-white/[0.06]">
      {/* Innings header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3.5 dark:border-white/[0.06] sm:px-5 sm:py-4">
        <h3 className="min-w-0 pr-2 text-sm font-bold text-foreground sm:text-base">{innings.name}</h3>
        <div className="shrink-0 text-right">
          <span className="text-lg font-black tabular-nums text-foreground sm:text-xl">
            {innings.total.runs}/{innings.total.wickets}
          </span>
          {innings.total.overs !== "0" && (
            <span className="ml-1 text-[11px] text-muted-foreground sm:ml-1.5 sm:text-xs">
              ({innings.total.overs} ov)
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
        {/* Batting */}
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Batting
          </p>
          {hasBatting ? (
            <BattingTable
              batting={innings.batting}
              extras={innings.extras}
              total={innings.total}
            />
          ) : (
            <p className="text-sm text-muted-foreground/50 py-2">Batting data not available.</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 dark:border-white/[0.05]" />

        {/* Bowling */}
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Bowling
          </p>
          {hasBowling ? (
            <BowlingTable bowling={innings.bowling} />
          ) : (
            <p className="text-sm text-muted-foreground/50 py-2">Bowling data not available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function ScorecardEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card px-5 py-12 text-center dark:border-white/[0.06] sm:px-6 sm:py-14">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 dark:bg-white/[0.04]">
        <ClipboardList className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <h3 className="mt-5 text-base font-bold text-foreground">
        Scorecard not available
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        The scorecard will appear here once the match begins or when data becomes available.
      </p>
    </div>
  );
}

/* ─── Main scorecard view ────────────────────────────────────────── */
export function ScorecardView({ innings }: { innings: InningsScore[] }) {
  if (innings.length === 0) return <ScorecardEmpty />;

  return (
    <div className="space-y-3 sm:space-y-4">
      {innings.map((inning, i) => (
        <InningsSection key={i} innings={inning} />
      ))}
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────── */
export function ScorecardSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 bg-card dark:border-white/[0.06]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4 dark:border-white/[0.06]">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="p-5 space-y-4">
            <Skeleton className="h-2.5 w-14 rounded-full" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-4">
                <Skeleton className="h-3.5 w-32 rounded-full flex-1" />
                <Skeleton className="h-3.5 w-40 rounded-full flex-1" />
                <Skeleton className="h-3.5 w-8 rounded-full" />
                <Skeleton className="h-3.5 w-8 rounded-full" />
                <Skeleton className="h-3.5 w-6 rounded-full" />
                <Skeleton className="h-3.5 w-6 rounded-full" />
                <Skeleton className="h-3.5 w-10 rounded-full" />
              </div>
            ))}
            <div className="pt-2 border-t border-border/50">
              <Skeleton className="h-2.5 w-14 rounded-full mb-3 mt-1" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-4 mt-2.5">
                  <Skeleton className="h-3.5 w-36 rounded-full flex-1" />
                  <Skeleton className="h-3.5 w-8 rounded-full" />
                  <Skeleton className="h-3.5 w-8 rounded-full" />
                  <Skeleton className="h-3.5 w-8 rounded-full" />
                  <Skeleton className="h-3.5 w-8 rounded-full" />
                  <Skeleton className="h-3.5 w-10 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
