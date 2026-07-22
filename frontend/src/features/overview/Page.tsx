"use client";

import { useCallback, useState } from "react";
import { InteractiveTrainsetPanel } from "@/features/overview/InteractiveTrainsetPanel";
import { TrainsetStatusGrid } from "@/features/overview/TrainsetStatusGrid";
import { SummaryCards } from "@/features/overview/SummaryCards";
import { TrainPositionMap } from "@/features/overview/TrainPositionMap";
import { getOverviewData, type OverviewData } from "@/services/overviewService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

export default function OverviewPage() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getOverviewData(signal, mode), []);
  const resource = useRamsResource<OverviewData>(loader, 15_000);
  const [selectedTrainsetId, setSelectedTrainsetId] = useState<string | null>(null);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.carInsights.length === 0) {
    return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;
  }
  const data = resource.data;

  return (
    <div className="page-grid overview-compact-layout overview-page">
      <section className="overview-top-grid">
        {selectedTrainsetId ? (
          <InteractiveTrainsetPanel
            compositions={data.trainsetCompositions}
            initialTrainsetId={selectedTrainsetId}
            onBackToGrid={() => setSelectedTrainsetId(null)}
          />
        ) : (
          <TrainsetStatusGrid trainsets={data.trainsets} onSelectTrainset={setSelectedTrainsetId} />
        )}
        <TrainPositionMap points={data.mapPoints} />
      </section>

      <section className="overview-row-2">
        <SummaryCards summary={data.summary} variant="compact" />
      </section>
    </div>
  );
}
