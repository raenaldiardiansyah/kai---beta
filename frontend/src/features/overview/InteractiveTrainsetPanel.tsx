"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, Train } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TrainComposition } from "./TrainComposition";
import { PriorityInsightCard } from "./PriorityInsightCard";
import type { Insight } from "@/types/insight";
import type { OverviewData } from "@/services/overviewService";

type TrainsetComposition = OverviewData["trainsetCompositions"][number];

const severityPriority: Record<Insight["severity"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  Normal: 0
};

function getPriorityInsight(composition: TrainsetComposition) {
  return [...composition.carInsights].sort((left, right) => (
    severityPriority[right.severity] - severityPriority[left.severity]
  ))[0];
}

function getSeverityColorClass(severity?: Insight["severity"]) {
  if (severity === "Critical" || severity === "High") return "browser-item-critical";
  if (severity === "Medium") return "browser-item-medium";
  return "browser-item-normal";
}

export function InteractiveTrainsetPanel({ compositions }: { compositions: TrainsetComposition[] }) {
  const [selectedTrainsetIndex, setSelectedTrainsetIndex] = useState(0);
  const [selectedCars, setSelectedCars] = useState<Record<string, number>>({});
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);
  const [compositionQuery, setCompositionQuery] = useState("");
  const safeIndex = Math.min(selectedTrainsetIndex, Math.max(compositions.length - 1, 0));
  const composition = compositions[safeIndex];
  const normalizedQuery = compositionQuery.trim().toLocaleLowerCase("id");
  const compositionSuggestions = useMemo(() => {
    if (!normalizedQuery) return compositions;

    return compositions.filter((item) => (
      [
        item.displayCode,
        item.displayName,
        item.trainsetId,
        `${item.totalCars} gerbong`
      ].some((value) => value.toLocaleLowerCase("id").includes(normalizedQuery))
    ));
  }, [compositions, normalizedQuery]);

  if (!composition) return null;

  const defaultInsight = getPriorityInsight(composition) ?? composition.carInsights[0];
  if (!defaultInsight) return null;

  const selectedCarNum = selectedCars[composition.trainsetId] ?? defaultInsight.carNumber;
  const selectedInsight = composition.carInsights.find((item) => item.carNumber === selectedCarNum) ?? defaultInsight;

  const selectCar = (carNumber: number) => {
    setSelectedCars((current) => ({ ...current, [composition.trainsetId]: carNumber }));
  };

  const showPreviousTrainset = () => {
    setSelectedTrainsetIndex((current) => (current <= 0 ? compositions.length - 1 : current - 1));
  };

  const showNextTrainset = () => {
    setSelectedTrainsetIndex((current) => (current + 1) % compositions.length);
  };

  const openCompositionModal = () => {
    setCompositionQuery("");
    setIsCompositionModalOpen(true);
  };

  const selectTrainset = (trainsetId: string) => {
    const nextIndex = compositions.findIndex((item) => item.trainsetId === trainsetId);
    if (nextIndex < 0) return;

    setSelectedTrainsetIndex(nextIndex);
    setCompositionQuery("");
    setIsCompositionModalOpen(false);
  };

  return (
    <div className="overview-left-stack">
      <TrainComposition
        trainsetId={composition.trainsetId}
        totalCars={composition.totalCars}
        cars={composition.cars}
        selectedCar={selectedCarNum}
        onSelectCar={selectCar}
        carsInsights={composition.carInsights}
        trainsetCode={composition.displayCode}
        trainsetName={composition.displayName}
        currentTrainsetIndex={safeIndex}
        totalTrainsets={compositions.length}
        onPreviousTrainset={showPreviousTrainset}
        onNextTrainset={showNextTrainset}
        onViewMore={openCompositionModal}
        activeSeverity={defaultInsight.severity}
      />
      <PriorityInsightCard insight={selectedInsight} />
      <Modal
        open={isCompositionModalOpen}
        title="Pilih Trainset"
        onClose={() => setIsCompositionModalOpen(false)}
      >
        <div className="composition-browser">
          <label className="composition-browser-search">
            <span className="sr-only">Cari Trainset</span>
            <MagnifyingGlass size={18} aria-hidden="true" />
            <Input
              autoFocus
              aria-label="Cari Trainset"
              placeholder="Ketik kode atau nama kereta, contoh: TS-001"
              value={compositionQuery}
              onChange={(event) => setCompositionQuery(event.target.value)}
            />
          </label>

          <div className="composition-browser-summary" aria-live="polite">
            <strong>
              {normalizedQuery
                ? `${compositionSuggestions.length} rekomendasi ditemukan`
                : `${compositions.length} Trainset tersedia`}
            </strong>
            <span>Pilih Trainset untuk menampilkan komposisinya di Ringkasan.</span>
          </div>

          {compositionSuggestions.length > 0 ? (
            <div className="composition-browser-results" role="listbox" aria-label="Rekomendasi komposisi kereta">
              {compositionSuggestions.map((item) => {
                const priorityInsight = getPriorityInsight(item);
                const isActive = item.trainsetId === composition.trainsetId;

                return (
                  <button
                    key={item.trainsetId}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={[
                      getSeverityColorClass(priorityInsight?.severity),
                      isActive ? "active" : ""
                    ].filter(Boolean).join(" ")}
                    onClick={() => selectTrainset(item.trainsetId)}
                  >
                    <span className="composition-browser-icon" aria-hidden="true">
                      <Train size={20} weight="duotone" />
                    </span>
                    <span className="composition-browser-copy">
                      <strong>{item.displayCode}</strong>
                      <small>{item.displayName}</small>
                    </span>
                    <span className="composition-browser-meta">
                      <strong>{item.totalCars} gerbong</strong>
                      <small>
                        {priorityInsight
                          ? `Health prioritas ${priorityInsight.healthScore}%`
                          : "Belum ada insight"}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="composition-browser-empty">
              Tidak ada komposisi kereta yang cocok dengan “{compositionQuery}”.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
