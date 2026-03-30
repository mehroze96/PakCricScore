import { MatchDetailPage } from "@/components/match-detail/match-detail-page";
import { getPakistanMatchById, getPakistanScorecardById } from "@/lib/api";

interface MatchDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailRoute({ params }: MatchDetailRouteProps) {
  const { id } = await params;

  const [matchResult, scorecardResult] = await Promise.all([
    getPakistanMatchById(id)
      .then((payload) => ({ payload, error: null }))
      .catch((error) => ({
        payload: null,
        error: error instanceof Error ? error.message : "Unable to fetch match details.",
      })),
    getPakistanScorecardById(id)
      .then((payload) => ({ payload, error: null }))
      .catch((error) => ({
        payload: null,
        error: error instanceof Error ? error.message : "Unable to fetch scorecard.",
      })),
  ]);

  return (
    <MatchDetailPage
      hasInitialScorecardPayload={Boolean(
        scorecardResult.error || (scorecardResult.payload?.innings.length ?? 0) > 0
      )}
      id={id}
      initialInnings={scorecardResult.payload?.innings ?? []}
      initialMatch={matchResult.payload?.match ?? null}
      initialMatchError={matchResult.error}
      initialScorecardError={scorecardResult.error}
    />
  );
}
