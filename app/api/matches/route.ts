import { NextResponse } from "next/server";

import { normalizePakistanMatches } from "@/lib/matches";
import type { ApiResponseShape } from "@/lib/types";

const CRICKET_API_BASE_URL = process.env.CRICKETDATA_API_BASE_URL ?? "https://api.cricapi.com/v1";
const CRICKET_API_KEY = process.env.CRICKETDATA_API_KEY;

export const revalidate = 60;

export async function GET() {
  if (!CRICKET_API_KEY) {
    return NextResponse.json(
      { error: "Missing CRICKETDATA_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${CRICKET_API_BASE_URL}/currentMatches?apikey=${CRICKET_API_KEY}&offset=0`,
      {
        next: { revalidate: 60 },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `CricketData API request failed with status ${response.status}.` },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as ApiResponseShape;
    const matches = normalizePakistanMatches(payload);

    return NextResponse.json(
      {
        matches,
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch cricket matches right now.",
      },
      { status: 500 }
    );
  }
}
