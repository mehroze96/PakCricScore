export type MatchStatus = "live" | "completed" | "upcoming";

/* ─── Raw API types — current matches / match info ───────────────── */

export interface RawScoreEntry {
  inning?: string;
  r?: number;
  w?: number;
  o?: number;
}

export interface RawCricketMatch {
  id?: string;
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  teamInfo?: Array<{
    name?: string;
    shortname?: string;
    img?: string;
  }>;
  score?: RawScoreEntry[];
  matchStarted?: boolean;
  matchEnded?: boolean;
  series_id?: string;
  seriesName?: string;
  tossWinner?: string;
  tossChoice?: string;
  winner?: string;
}

export interface ApiResponseShape {
  status?: string;
  data?: RawCricketMatch[];
  matches?: RawCricketMatch[];
}

/* ─── Raw API types — scorecard ──────────────────────────────────── */

/** CricAPI returns player refs as either a plain string or an object. */
export type RawPlayerRef = string | { id?: string; name?: string };

export interface RawBatsmanCard {
  batsman?: RawPlayerRef;
  r?: number;
  b?: number;
  "4s"?: number;
  "6s"?: number;
  sr?: number;
  out?: string;
}

export interface RawBowlerCard {
  bowler?: RawPlayerRef;
  o?: number | string;
  m?: number;
  r?: number;
  w?: number;
  eco?: number | string;
  wd?: number;
  nb?: number;
}

export interface RawExtras {
  r?: number;
  b?: number;
  lb?: number;
  wd?: number;
  nb?: number;
  p?: number;
}

export interface RawInningsTotal {
  r?: number;
  w?: number;
  o?: number | string;
  inning?: string;
}

export interface RawInnings {
  inning?: string;
  battingCard?: RawBatsmanCard[];
  bowlingCard?: RawBowlerCard[];
  extras?: RawExtras;
  total?: RawInningsTotal;
}

/** Shape returned by match_info?id= — a single match object, not an array. */
export interface RawMatchDetailData extends RawCricketMatch {
  referee?: string;
  umpires?: string[];
  scorecard?: RawInnings[];
}

export interface RawMatchInfoResponse {
  status?: string;
  data?: RawMatchDetailData;
}

export interface RawScorecardResponse {
  status?: string;
  data?: RawMatchDetailData;
}

/* ─── Normalized frontend types ──────────────────────────────────── */

export interface TeamScore {
  name: string;
  shortName?: string;
  score?: string;
  overs?: string;
  runRate?: string;
}

export interface Match {
  id: string;
  name: string;
  series?: string;
  matchType?: string;
  venue?: string;
  date?: string;
  status: MatchStatus;
  statusText: string;
  teams: TeamScore[];
  toss?: string;
  winner?: string;
}

export interface BatsmanScore {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  dismissal: string;
}

export interface BowlerFigure {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
  wides: number;
  noBalls: number;
}

export interface ExtrasBreakdown {
  total: number;
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  penalty: number;
}

export interface InningsScore {
  name: string;
  batting: BatsmanScore[];
  bowling: BowlerFigure[];
  extras: ExtrasBreakdown;
  total: { runs: number; wickets: number; overs: string };
}

/** Full match detail — extends Match with scorecard innings. */
export interface MatchDetail extends Match {
  innings: InningsScore[];
  umpires?: string[];
  referee?: string;
}
