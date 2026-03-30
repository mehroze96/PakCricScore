import type { ApiResponseShape, Match, MatchStatus, RawCricketMatch, RawScoreEntry } from "@/lib/types";

const PAKISTAN_PATTERN = /\bpakistan\b|\bpak\b/i;

function cleanLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatRunRate(runs?: number, overs?: number) {
  if (typeof runs !== "number" || typeof overs !== "number") {
    return undefined;
  }

  if (overs <= 0) {
    return undefined;
  }

  return (runs / overs).toFixed(2);
}

function formatScore(entry?: RawScoreEntry) {
  if (!entry || typeof entry.r !== "number") {
    return undefined;
  }

  if (typeof entry.w === "number") {
    return `${entry.r}/${entry.w}`;
  }

  return `${entry.r}`;
}

function formatOvers(entry?: RawScoreEntry) {
  if (!entry || typeof entry.o !== "number") {
    return undefined;
  }

  return `${entry.o}`;
}

function inferStatus(match: RawCricketMatch): MatchStatus {
  const status = match.status?.toLowerCase() ?? "";

  if (match.matchEnded || status.includes("result") || status.includes("won")) {
    return "completed";
  }

  if (match.matchStarted || status.includes("live") || status.includes("inning")) {
    return "live";
  }

  return "upcoming";
}

function shortName(name: string) {
  if (name.toLowerCase() === "pakistan") {
    return "PAK";
  }

  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function mapScoreToTeams(teams: string[], scoreEntries: RawScoreEntry[] = []) {
  const teamScores = new Map<string, RawScoreEntry>();

  for (const team of teams) {
    const matchedEntry = scoreEntries.find((entry) => {
      const inning = entry.inning ?? "";
      return cleanLabel(inning).includes(cleanLabel(team));
    });

    if (matchedEntry) {
      teamScores.set(team, matchedEntry);
    }
  }

  for (let index = 0; index < teams.length; index += 1) {
    if (!teamScores.has(teams[index]) && scoreEntries[index]) {
      teamScores.set(teams[index], scoreEntries[index]);
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
      .map((team) => team.name)
      .filter((name): name is string => Boolean(name));
  }

  return match.teams ?? [];
}

function isPakistanMatch(match: RawCricketMatch) {
  const teams = [
    ...(match.teams ?? []),
    ...(match.teamInfo?.flatMap((team) => [team.name, team.shortname].filter(Boolean)) ?? []),
    match.name,
  ].filter((value): value is string => Boolean(value));

  return teams.some((value) => PAKISTAN_PATTERN.test(value));
}

function statusText(match: RawCricketMatch, status: MatchStatus) {
  if (match.status) {
    return match.status;
  }

  if (status === "live") {
    return "Live";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Upcoming";
}

function normalizeMatch(match: RawCricketMatch): Match {
  const teams = extractTeams(match);
  const status = inferStatus(match);

  return {
    id: match.id ?? `${match.name ?? "pakistan-match"}-${match.dateTimeGMT ?? match.date ?? "now"}`,
    name: match.name ?? teams.join(" vs "),
    series: match.seriesName,
    venue: match.venue,
    date: match.dateTimeGMT ?? match.date,
    status,
    statusText: statusText(match, status),
    teams: mapScoreToTeams(teams, match.score),
    toss:
      match.tossWinner && match.tossChoice
        ? `${match.tossWinner} elected to ${match.tossChoice}`
        : undefined,
    winner: match.winner,
  };
}

function sortMatches(matches: Match[]) {
  const order: Record<MatchStatus, number> = {
    live: 0,
    upcoming: 1,
    completed: 2,
  };

  return [...matches].sort((left, right) => {
    const byStatus = order[left.status] - order[right.status];

    if (byStatus !== 0) {
      return byStatus;
    }

    return new Date(right.date ?? 0).getTime() - new Date(left.date ?? 0).getTime();
  });
}

export function normalizePakistanMatches(payload: ApiResponseShape): Match[] {
  const rawMatches = payload.data ?? payload.matches ?? [];

  return sortMatches(
    rawMatches
      .filter(isPakistanMatch)
      .map(normalizeMatch)
  );
}
