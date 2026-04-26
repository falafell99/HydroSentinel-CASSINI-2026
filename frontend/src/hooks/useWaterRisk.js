import { useState, useEffect } from 'react';

/**
 * Fetches KNN water-risk and LLM insight for a given field from the backend.
 * Falls back to null quietly if the backend is not running.
 *
 * Returns: { waterBodies, riskLevel, insight, insightModel, loading, error }
 */
export function useWaterRisk(fieldId) {
  const [waterBodies, setWaterBodies]   = useState(null);
  const [riskLevel,   setRiskLevel]     = useState(null);
  const [insight,     setInsight]       = useState(null);
  const [insightModel, setInsightModel] = useState(null);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState(null);

  useEffect(() => {
    if (!fieldId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setWaterBodies(null);
      setInsight(null);
      setRiskLevel(null);

      try {
        // Fetch KNN water-risk data
        const riskRes = await fetch(`/api/fields/${fieldId}/water-risk`, { signal: AbortSignal.timeout(6000) });
        if (!riskRes.ok) throw new Error(`water-risk ${riskRes.status}`);
        const riskData = await riskRes.json();
        if (!cancelled) {
          setWaterBodies(riskData.nearestWaterBodies);
          setRiskLevel(riskData.waterRiskLevel);
        }

        // Fetch LLM insight (slightly slower, streamed separately)
        const insightRes = await fetch(`/api/fields/${fieldId}/insight`, { signal: AbortSignal.timeout(20000) });
        if (!insightRes.ok) throw new Error(`insight ${insightRes.status}`);
        const insightData = await insightRes.json();
        if (!cancelled) {
          setInsight(insightData.insight);
          setInsightModel(insightData.model);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [fieldId]);

  return { waterBodies, riskLevel, insight, insightModel, loading, error };
}
