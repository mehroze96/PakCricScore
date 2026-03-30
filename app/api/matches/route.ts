import { CACHE_WINDOWS, getCurrentPakistanMatches, jsonWithCache } from "@/lib/api";

export async function GET() {
  try {
    const payload = await getCurrentPakistanMatches();

    return jsonWithCache(payload, {
      cacheSeconds: CACHE_WINDOWS.live,
    });
  } catch (error) {
    return jsonWithCache(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch cricket matches right now.",
      },
      {
        status: 500,
        cacheSeconds: CACHE_WINDOWS.live,
      }
    );
  }
}
