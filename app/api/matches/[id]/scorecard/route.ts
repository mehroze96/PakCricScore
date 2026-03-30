import {
  CACHE_WINDOWS,
  getPakistanScorecardById,
  getScorecardPayloadCacheSeconds,
  jsonWithCache,
} from "@/lib/api";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const payload = await getPakistanScorecardById(id);

    return jsonWithCache(payload, {
      cacheSeconds: getScorecardPayloadCacheSeconds(payload),
    });
  } catch (error) {
    return jsonWithCache(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch scorecard.",
      },
      {
        status: 500,
        cacheSeconds: CACHE_WINDOWS.live,
      }
    );
  }
}
