import { Card } from "@/components/ui/Card";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import type { Insight } from "@/types/insight";

type TrainCompositionProps = {
  trainsetId: string;
  totalCars: number;
  cars: Array<{
    carId: string;
    carNumber: number | null;
  }>;
  selectedCar: number;
  carsInsights: Insight[];
  onSelectCar: (car: number) => void;
  trainsetCode?: string;
  trainsetName?: string;
  currentTrainsetIndex?: number;
  totalTrainsets?: number;
  onPreviousTrainset?: () => void;
  onNextTrainset?: () => void;
  onViewMore?: () => void;
  activeSeverity?: string;
};

type CarVisualStatus = "normal" | "warning" | "critical" | "no-data";

function getVisualStatus(insight?: Insight): CarVisualStatus {
  if (!insight) return "no-data";
  if (insight.severity === "High" || insight.severity === "Critical") return "critical";
  if (insight.severity === "Medium") return "warning";
  return "normal";
}

function getSeverityBadgeClass(severity?: string) {
  if (severity === "Critical" || severity === "High") return "trainset-active-badge-critical";
  if (severity === "Medium") return "trainset-active-badge-medium";
  return "trainset-active-badge-normal";
}

function getAnomalyLabel(insight?: Insight) {
  if (!insight || insight.event === "NO_ACTIVE_ANOMALY") return null;
  if (insight.event === "LOCAL_BC_DEVIATION") return "Brake Cylinder Deviation";

  return insight.event
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TrainCarIcon({ status }: { status: CarVisualStatus }) {
  const showIndicator = status === "warning" || status === "critical";

  return (
    <svg className="train-car-svg" viewBox="0 0 64 42" aria-hidden="true">
      <rect className="train-car-body" x="2" y="3" width="60" height="29" rx="5" />
      <path className="train-car-detail" d="M8 10h48M10 25h44" />
      <circle className="train-car-wheel" cx="15" cy="36" r="3.5" />
      <circle className="train-car-wheel" cx="49" cy="36" r="3.5" />
      {showIndicator ? (
        <g className="train-car-alert" transform="translate(32 17)">
          <circle cx="0" cy="0" r="7" />
          <text x="0" y="3.5" textAnchor="middle">!</text>
        </g>
      ) : null}
    </svg>
  );
}

export function TrainComposition({
  trainsetId,
  totalCars,
  cars,
  selectedCar,
  carsInsights,
  onSelectCar,
  trainsetCode,
  trainsetName,
  currentTrainsetIndex = 0,
  totalTrainsets = 1,
  onPreviousTrainset,
  onNextTrainset,
  onViewMore,
  activeSeverity
}: TrainCompositionProps) {
  const compositionCars = cars.length > 0
    ? cars
    : Array.from({ length: totalCars }, (_, index) => ({
      carId: "",
      carNumber: index + 1
    }));
  const showTrainsetNavigation = totalTrainsets > 1 && onPreviousTrainset && onNextTrainset;
  const navigation = showTrainsetNavigation || onViewMore ? (
    <div className="trainset-composition-actions">
      <div className="trainset-composition-left-group">
        <span
          className={`trainset-composition-active-label ${getSeverityBadgeClass(activeSeverity)}`}
          title={trainsetName}
        >
          {trainsetCode}
        </span>
        {onViewMore ? (
          <button type="button" className="trainset-composition-more" onClick={onViewMore}>
            <MagnifyingGlass size={14} weight="bold" />
            Pilih Trainset
          </button>
        ) : null}
      </div>
      {showTrainsetNavigation ? (
        <div className="trainset-composition-navigation" aria-label="Navigasi komposisi kereta">
          <button type="button" onClick={onPreviousTrainset} aria-label="Kereta sebelumnya" title="Kereta sebelumnya">
            <CaretLeft size={15} weight="bold" />
          </button>
          <button type="button" onClick={onNextTrainset} aria-label="Kereta berikutnya" title="Kereta berikutnya">
            <CaretRight size={15} weight="bold" />
          </button>
        </div>
      ) : null}
    </div>
  ) : null;
  return (
    <Card title="Komposisi Kereta" eyebrow="Mewakili armada aktif" action={navigation} className="overview-composition-card">
      <div className="train-composition-scroll" aria-label="Komposisi gerbong interaktif">
        <div className="composition overview-car-grid train-composition-track">
          {compositionCars.map((compositionCar, index) => {
            const insight = carsInsights.find((item) => (
              (compositionCar.carId && item.carId === compositionCar.carId)
              || (compositionCar.carNumber != null && item.carNumber === compositionCar.carNumber)
            ));
            const car = compositionCar.carNumber ?? insight?.carNumber ?? index + 1;
            const isSelected = car === selectedCar;
            const status = getVisualStatus(insight);
            const anomaly = getAnomalyLabel(insight);
            const statusLabel = status === "no-data" ? "No data" : status.charAt(0).toUpperCase() + status.slice(1);
            const backendCarId = compositionCar.carId.trim() || insight?.carId?.trim();

            const tooltip = [
              backendCarId ? `Kode gerbong: ${backendCarId}` : "Kode gerbong belum tersedia dari backend",
              `Status: ${statusLabel}`,
              insight ? `Health: ${insight.healthScore}%` : "Health: -",
              anomaly ? `Anomaly: ${anomaly}` : null,
              "Klik untuk memilih, lalu gunakan Tinjau Bukti"
            ].filter(Boolean).join("\n");

            return (
              <div className="train-composition-segment" key={backendCarId || `fallback-${index}`}>
                {index > 0 ? <span className="train-car-connector" aria-hidden="true" /> : null}
                <button
                  type="button"
                  className={`car-item overview-car-item train-car-link status-${status}${isSelected ? " selected" : ""}`}
                  onClick={() => onSelectCar(car)}
                  title={tooltip}
                  aria-label={`${backendCarId ? `Gerbong ${backendCarId}` : "Gerbong tanpa kode backend"}, Status ${statusLabel}${insight ? `, Health ${insight.healthScore} persen` : ""}${anomaly ? `, Anomaly ${anomaly}` : ""}. Pilih untuk meninjau insight`}
                  aria-pressed={isSelected}
                >
                  <TrainCarIcon status={status} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
