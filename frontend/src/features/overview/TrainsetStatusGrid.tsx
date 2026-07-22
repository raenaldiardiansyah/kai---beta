"use client";

import { Card } from "@/components/ui/Card";
import { getTrainsetIdentity } from "@/adapters/identityAdapter";
import type { Trainset } from "@/types/trainset";

type StatusTone = "normal" | "watch" | "critical";

function getStatusTone(trainset: Trainset): StatusTone {
  const status = trainset.healthStatus;
  if (status === "Healthy") return "normal";
  if (status === "Watch" || status === "Warning") return "watch";
  // Alarm, Critical, Offline, Data Limited all read as the same "needs attention now" red box
  return "critical";
}

export function TrainsetStatusGrid({
  trainsets,
  onSelectTrainset
}: {
  trainsets: Trainset[];
  onSelectTrainset: (trainsetId: string) => void;
}) {
  return (
    <Card
      title="Overview TS"
      eyebrow="Klik salah satu untuk masuk ke Overview Cart"
      className="overview-composition-card ts-status-grid-card"
    >
      <div className="ts-status-grid-panel">
        <div className="ts-status-grid" role="list" aria-label="Status seluruh trainset">
          {trainsets.map((trainset) => {
            const tone = getStatusTone(trainset);
            const identity = getTrainsetIdentity(trainset.id, trainset.name);
            return (
              <button
                key={trainset.id}
                type="button"
                role="listitem"
                className={`ts-status-box ts-status-box-${tone}`}
                onClick={() => onSelectTrainset(trainset.id)}
                title={`${identity.displayCode} · ${identity.displayName} · ${trainset.healthStatus} · Kesehatan ${trainset.healthScore}%`}
              >
                {identity.displayCode}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
