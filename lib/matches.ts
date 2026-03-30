import type {
  ApiResponseShape,
  BatsmanScore,
  BowlerFigure,
  ExtrasBreakdown,
  InningsScore,
  Match,
  MatchDetail,
  MatchStatus,
  RawCricketMatch,
  RawInnings,
  RawMatchDetailData,
  RawPlayerRef,
  RawScoreEntry,
} from "@/lib/types";

const PAKISTAN_PATTERN = /\bpakistan\b|\bpak\b/i;
const PSL_PATTERN = /\bpakistan super league\b|\bpsl\b/i;

/* ─── Shared helpers ─────────────────────────────────────────────── */

function cleanLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractPlayerName(ref: RawPlayerRef | undefined): string {
  if (!ref) return "Unknown";
  if (typeof ref === "string") return ref;
  return ref.name ?? "Unknown";
}

function formatRunRate(runs?: number, overs?: number) {
  if (typeof runs !== "number" || typeof overs !== "number" || overs <= 0) {
    return undefined;
  }
  return (runs / overs).toFixed(2);
}

function formatScore(entry?: RawScoreEntry) {
  if (!entry || typeof entry.r !== "number") return undefined;
  return typeof entry.w === "number" ? `${entry.r}/${entry.w}` : `${entry.r}`;
}

function formatOvers(entry?: RawScoreEntry) {
  if (!entry || typeof entry.o !== "number") return undefined;
  return `${entry.o}`;
}

export function getMatchPhase(match: RawCricketMatch): MatchStatus | "unknown" {
  if (match.matchStarted === false) return "upcoming";
  if (match.matchStarted === true && match.matchEnded !== true) return "live";
  if (match.matchEnded === true) return "completed";

  const status = match.status?.toLowerCase() ?? "";
  const state = match.state?.toLowerCase() ?? "";

  if (
    status.includes("not started") ||
    status.includes("upcoming") ||
    status.includes("scheduled") ||
    state.includes("upcoming")
  ) {
    return "upcoming";
  }

  if (
    status.includes("result") ||
    status.includes("completed") ||
    status.includes("won")
  ) {
    return "completed";
  }

  if (
    status.includes("live") ||
    status.includes("innings") ||
    status.includes("inning")
  ) {
    return "live";
  }

  return "unknown";
}

function inferStatus(match: RawCricketMatch): MatchStatus {
  const phase = getMatchPhase(match);
  return phase === "unknown" ? "upcoming" : phase;
}

function shortName(name: string) {
  if (name.toLowerCase() === "pakistan") return "PAK";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function mapScoreToTeams(teams: string[], scoreEntries: RawScoreEntry[] = []) {
  const teamScores = new Map<string, RawScoreEntry>();

  for (const team of teams) {
    const matched = scoreEntries.find((e) => {
      const inning = e.inning ?? "";
      return cleanLabel(inning).includes(cleanLabel(team));
    });
    if (matched) teamScores.set(team, matched);
  }

  for (let i = 0; i < teams.length; i++) {
    if (!teamScores.has(teams[i]) && scoreEntries[i]) {
      teamScores.set(teams[i], scoreEntries[i]);
    }
  }

  return teams.map((team) => {
    const entry = teamScores.get(team);
    return {
      name: team,
      shortName: shortName(team),
      score: formatScore(entry),
      overs: formatOvers(entry),
      runRate: formatRunRate(entry?.r, entry?.o),
    };
  });
}

function extractTeams(match: RawCricketMatch) {
  if (match.teamInfo?.length) {
    return match.teamInfo
      .map((t) => t.name)
      .filter((n): n is string => Boolean(n));
  }
  return match.teams ?? [];
}

export function isPakistanMatch(match: RawCricketMatch) {
  const teams = [
    ...(match.teams ?? []),
    ...(match.teamInfo?.flatMap((team) => [team.name, team.shortname].filter(Boolean)) ?? []),
  ].filter((team): team is string => Boolean(team));

  if (teams.some((team) => {
    const normalized = team.toLowerCase().trim();
    return normalized.includes("pakistan") || normalized === "pak";
  })) {
    return true;
  }

  return (
    PAKISTAN_PATTERN.test(match.name ?? "") ||
    PSL_PATTERN.test(match.seriesName ?? "") ||
    PSL_PATTERN.test(match.name ?? "")
  );
}

export function filterPakistanMatches(payload: ApiResponseShape) {
  const raw = payload.data ?? payload.matches ?? [];
  return raw.filter(isPakistanMatch);
}

function deriveStatusText(match: RawCricketMatch, status: MatchStatus) {
  if (match.status) return match.status;
  if (status === "live") return "Live";
  if (status === "completed") return "Completed";
  return "Upcoming";
}

function sortMatches(matches: Match[]) {
  const order: Record<MatchStatus, number> = { live: 0, upcoming: 1, completed: 2 };
  return [...matches].sort((a, b) => {
    const byStatus = order[a.status] - order[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
  });
}

/* ─── Match normalization ────────────────────────────────────────── */

export function normalizeMatch(match: RawCricketMatch): Match {
  const teams = extractTeams(match);
  const status = inferStatus(match);

  return {
    id: match.id ?? `${match.name ?? "pak-match"}-${match.dateTimeGMT ?? match.date ?? "now"}`,
    name: match.name ?? teams.join(" vs "),
    series: match.seriesName,
    matchType: match.matchType,
    venue: match.venue,
    date: match.dateTimeGMT ?? match.date,
    status,
    statusText: deriveStatusText(match, status),
    teams: mapScoreToTeams(teams, match.score),
    toss:
      match.tossWinner && match.tossChoice
        ? `${match.tossWinner} elected to ${match.tossChoice}`
        : undefined,
    winner: match.winner,
  };
}

export function normalizePakistanMatches(payload: ApiResponseShape): Match[] {
  return sortMatches(filterPakistanMatches(payload).map(normalizeMatch));
}

/* ─── Scorecard normalization ────────────────────────────────────── */

export function normalizeInnings(raw: RawInnings): InningsScore {
  const batting: BatsmanScore[] = (raw.battingCard ?? []).map((b) => ({
    name: extractPlayerName(b.batsman),
    runs: b.r ?? 0,
    balls: b.b ?? 0,
    fours: b["4s"] ?? 0,
    sixes: b["6s"] ?? 0,
    strikeRate: b.sr != null ? Number(b.sr).toFixed(1) : "0.0",
    dismissal: b.out ?? "not out",
  }));

  const bowling: BowlerFigure[] = (raw.bowlingCard ?? []).map((b) => ({
    name: extractPlayerName(b.bowler),
    overs: b.o != null ? String(b.o) : "0",
    maidens: b.m ?? 0,
    runs: b.r ?? 0,
    wickets: b.w ?? 0,
    economy: b.eco != null ? Number(b.eco).toFixed(1) : "0.0",
    wides: b.wd ?? 0,
    noBalls: b.nb ?? 0,
  }));

  const extras: ExtrasBreakdown = {
    total: raw.extras?.r ?? 0,
    byes: raw.extras?.b ?? 0,
    legByes: raw.extras?.lb ?? 0,
    wides: raw.extras?.wd ?? 0,
    noBalls: raw.extras?.nb ?? 0,
    penalty: raw.extras?.p ?? 0,
  };

  return {
    name: raw.inning ?? "Innings",
    batting,
    bowling,
    extras,
    total: {
      runs: raw.total?.r ?? 0,
      wickets: raw.total?.w ?? 0,
      overs: raw.total?.o != null ? String(raw.total.o) : "0",
    },
  };
}

export function normalizeMatchDetail(raw: RawMatchDetailData): MatchDetail {
  return {
    ...normalizeMatch(raw as RawCricketMatch),
    innings: (raw.scorecard ?? []).map(normalizeInnings),
    umpires: raw.umpires,
    referee: raw.referee,
  };
}
