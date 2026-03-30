import {
  CACHE_WINDOWS,
  getMatchPayloadCacheSeconds,
  getPakistanMatchById,
  jsonWithCache,
} from "@/lib/api";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const payload = await getPakistanMatchById(id);

    return jsonWithCache(payload, {
      cacheSeconds: getMatchPayloadCacheSeconds(payload.match),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch match details.";

    const status = message === "Match not found or API key invalid." ? 404 : 500;

    return jsonWithCache(
      {
        error: message,
      },
      {
        status,
        cacheSeconds: CACHE_WINDOWS.live,
      }
    );
  }
}
