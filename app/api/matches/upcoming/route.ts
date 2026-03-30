import { CACHE_WINDOWS, getUpcomingPakistanMatches, jsonWithCache } from "@/lib/api";

export async function GET() {
  try {
    const payload = await getUpcomingPakistanMatches();

    return jsonWithCache(payload, {
      cacheSeconds: CACHE_WINDOWS.upcoming,
    });
  } catch (error) {
    return jsonWithCache(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch upcoming Pakistan matches.",
      },
      {
        status: 500,
        cacheSeconds: CACHE_WINDOWS.live,
      }
    );
  }
}
