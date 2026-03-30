export type MatchStatus = "live" | "completed" | "upcoming";

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
  venue?: string;
  date?: string;
  status: MatchStatus;
  statusText: string;
  teams: TeamScore[];
  toss?: string;
  winner?: string;
}
