import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import {
  filterPakistanMatches,
  getMatchPhase,
  normalizeInnings,
  normalizeMatch,
  normalizePakistanMatches,
} from "@/lib/matches";
import type {
  ApiResponseShape,
  InningsScore,
  Match,
  MatchStatus,
  RawMatchInfoResponse,
  RawMatchDetailData,
  RawScorecardResponse,
} from "@/lib/types";

const DEFAULT_BASE_URL = "https://api.cricapi.com/v1";
const STALE_WHILE_REVALIDATE_SECONDS = 120;

// These TTLs balance freshness with the CricketData free-tier request budget.
export const CACHE_WINDOWS = {
  live: 60,
  upcoming: 600,
  completed: 1800,
} as const;

type CacheablePayload =
  | MatchesPayload
  | MatchPayload
  | ScorecardPayload;

type CacheWindow = (typeof CACHE_WINDOWS)[keyof typeof CACHE_WINDOWS];

type CachedRecord<T> = {
  fetchedAt: string;
  value: T;
};

export interface MatchesPayload {
  matches: Match[];
  fetchedAt: string;
  isStale?: boolean;
}

export interface MatchPayload {
  match: Match;
  fetchedAt: string;
  isStale?: boolean;
}

export interface ScorecardPayload {
  innings: InningsScore[];
  fetchedAt: string;
  matchStatus: MatchStatus;
  isStale?: boolean;
}

const lastKnownGood = new Map<string, CachedRecord<CacheablePayload>>();

function getApiConfig() {
  const apiKey = process.env.CRICKETDATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing CRICKETDATA_API_KEY environment variable.");
  }

  return {
    apiKey,
    baseUrl: process.env.CRICKETDATA_API_BASE_URL ?? DEFAULT_BASE_URL,
  };
}

function buildCricketUrl(path: string, searchParams: Record<string, string>) {
  const { apiKey, baseUrl } = getApiConfig();
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, "")}/`;
  const url = new URL(path.replace(/^\/+/, ""), normalizedBaseUrl);

  url.searchParams.set("apikey", apiKey);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  return url;
}

export function buildCacheControl(cacheSeconds: number) {
  return `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`;
}

export function jsonWithCache<T>(
  body: T,
  options?: {
    cacheSeconds?: number;
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: options?.status ?? 200,
    headers: {
      "Cache-Control": buildCacheControl(options?.cacheSeconds ?? CACHE_WINDOWS.live),
    },
  });
}

async function fetchCricketJson<T>(
  path: string,
  searchParams: Record<string, string>,
  revalidate: number
) {
  const url = buildCricketUrl(path, searchParams);

  console.info(
    `[cricket-api] Upstream request ${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString().replace(/apikey=[^&]+/, "apikey=***")}` : ""} (revalidate=${revalidate}s)`
  );

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`CricketData API responded with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function withLastKnownGood<T extends CacheablePayload>(
  key: string,
  loader: () => Promise<T>
) {
  try {
    const value = await loader();
    lastKnownGood.set(key, { fetchedAt: value.fetchedAt, value });
    return value;
  } catch (error) {
    const fallback = lastKnownGood.get(key);

    if (fallback) {
      console.warn(`[cricket-api] Serving last known good payload for ${key}.`);
      return { ...fallback.value, isStale: true } as T;
    }

    throw error;
  }
}

function getMatchCacheWindow(status: MatchStatus): CacheWindow {
  if (status === "completed") return CACHE_WINDOWS.completed;
  if (status === "upcoming") return CACHE_WINDOWS.upcoming;
  return CACHE_WINDOWS.live;
}

function normalizeScorecardInnings(matchData?: RawMatchDetailData | null) {
  return (matchData?.scorecard ?? []).map(normalizeInnings);
}

const getCurrentMatchesFeedCached = unstable_cache(
  async () =>
    fetchCricketJson<ApiResponseShape>(
      "/currentMatches",
      { offset: "0" },
      CACHE_WINDOWS.live
    ),
  ["cricket-current-matches-feed"],
  { revalidate: CACHE_WINDOWS.live }
);

const getLiveMatchesCached = unstable_cache(
  async (): Promise<MatchesPayload> => {
    const payload = await getCurrentMatchesFeedCached();
    return {
      matches: normalizePakistanMatches(payload),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["cricket-live-matches"],
  { revalidate: CACHE_WINDOWS.live }
);

const getUpcomingMatchesCached = unstable_cache(
  async (): Promise<MatchesPayload> => {
    const payload = await getCurrentMatchesFeedCached();
    const pakistanMatches = filterPakistanMatches(payload);
    console.log("Pakistan Matches:", pakistanMatches);
    const upcomingPakistanMatches = pakistanMatches.filter(
      (match) => getMatchPhase(match) === "upcoming"
    );

    return {
      matches: normalizePakistanMatches({ data: upcomingPakistanMatches }),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["cricket-upcoming-matches"],
  { revalidate: CACHE_WINDOWS.live }
);

const getMatchByIdCached = unstable_cache(
  async (id: string): Promise<MatchPayload> => {
    const payload = await fetchCricketJson<RawMatchInfoResponse>(
      "/match_info",
      { id },
      CACHE_WINDOWS.live
    );

    if (!payload.data || payload.status === "failure") {
      throw new Error("Match not found or API key invalid.");
    }

    return {
      match: normalizeMatch(payload.data),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["cricket-match-by-id"],
  { revalidate: CACHE_WINDOWS.live }
);

const getScorecardCached = unstable_cache(
  async (id: string): Promise<ScorecardPayload> => {
    const [scorecardPayload, matchInfoPayload] = await Promise.all([
      fetchCricketJson<RawScorecardResponse>(
        "/match_scorecard",
        { id },
        CACHE_WINDOWS.live
      ),
      fetchCricketJson<RawMatchInfoResponse>(
        "/match_info",
        { id },
        CACHE_WINDOWS.live
      ),
    ]);

    const scorecardInnings = normalizeScorecardInnings(scorecardPayload.data);
    const matchInfoInnings = normalizeScorecardInnings(matchInfoPayload.data);
    const innings =
      scorecardInnings.length > 0 ? scorecardInnings : matchInfoInnings;
    const matchSource = scorecardPayload.data ?? matchInfoPayload.data ?? null;
    const match = matchSource ? normalizeMatch(matchSource) : null;

    return {
      innings,
      fetchedAt: new Date().toISOString(),
      matchStatus: match?.status ?? "upcoming",
    };
  },
  ["cricket-scorecard-by-id"],
  { revalidate: CACHE_WINDOWS.live }
);

export async function getCurrentPakistanMatches() {
  return withLastKnownGood("live-matches", getLiveMatchesCached);
}

export async function getUpcomingPakistanMatches() {
  return withLastKnownGood("upcoming-matches", getUpcomingMatchesCached);
}

export async function getPakistanMatchById(id: string) {
  return withLastKnownGood(`match:${id}`, () => getMatchByIdCached(id));
}

export async function getPakistanScorecardById(id: string) {
  return withLastKnownGood(`scorecard:${id}`, () => getScorecardCached(id));
}

export function getMatchPayloadCacheSeconds(match: Match) {
  return getMatchCacheWindow(match.status);
}

export function getScorecardPayloadCacheSeconds(payload: ScorecardPayload) {
  return getMatchCacheWindow(payload.matchStatus);
}
