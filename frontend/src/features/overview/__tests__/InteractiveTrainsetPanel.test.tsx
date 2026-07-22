import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteractiveTrainsetPanel } from "../InteractiveTrainsetPanel";
import type { Insight } from "@/types/insight";
import type { OverviewData } from "@/services/overviewService";

function createInsight(trainsetId: string, trainsetName: string, diagnosis: string): Insight {
  return {
    id: `insight-${trainsetId}`,
    trainsetId,
    trainsetName,
    carNumber: 5,
    subsystem: "Brake System",
    event: "LOCAL_BC_DEVIATION",
    severity: "High",
    confidence: 86,
    healthScore: 42,
    diagnosis,
    risk: "High",
    evidence: {},
    structuredInsight: {},
    naturalInsight: diagnosis,
    recommendation: "Periksa sistem rem",
    carId: `${trainsetId}-CAR-05`
  };
}

describe("InteractiveTrainsetPanel", () => {
  it("slides between trainsets that report a problem on the same car", () => {
    const compositions: OverviewData["trainsetCompositions"] = [
      {
        trainsetId: "KA_DATA_DUMMY",
        displayCode: "TS-001",
        displayName: "Kereta Satu",
        totalCars: 10,
        cars: [{ carId: "KA_DATA_DUMMY-CAR-05", carNumber: 5 }],
        carInsights: [createInsight("KA_DATA_DUMMY", "TS-001", "Diagnosis kereta satu")]
      },
      {
        trainsetId: "KA_DUMMY_DATA",
        displayCode: "TS-002",
        displayName: "Kereta Dua",
        totalCars: 10,
        cars: [{ carId: "KA_DUMMY_DATA-CAR-05", carNumber: 5 }],
        carInsights: [createInsight("KA_DUMMY_DATA", "TS-002", "Diagnosis kereta dua")]
      }
    ];

    render(<InteractiveTrainsetPanel compositions={compositions} />);

    expect(screen.getByTitle("Kereta Satu")).toHaveTextContent("TS-001");
    expect(screen.getByText("Diagnosis kereta satu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /KA_DATA_DUMMY-CAR-05, Status Critical/i })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Kereta berikutnya" }));

    expect(screen.getByTitle("Kereta Dua")).toHaveTextContent("TS-002");
    expect(screen.getByText("Diagnosis kereta dua")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kereta sebelumnya" }));
    expect(screen.getByTitle("Kereta Satu")).toHaveTextContent("TS-001");
  });

  it("opens all compositions and recommends trainsets from the first typed character", () => {
    const compositions: OverviewData["trainsetCompositions"] = [
      {
        trainsetId: "KA_DATA_DUMMY",
        displayCode: "TS-001",
        displayName: "Kereta Satu",
        totalCars: 10,
        cars: [{ carId: "KA_DATA_DUMMY-CAR-05", carNumber: 5 }],
        carInsights: [createInsight("KA_DATA_DUMMY", "TS-001", "Diagnosis kereta satu")]
      },
      {
        trainsetId: "KA_DUMMY_DATA",
        displayCode: "TS-002",
        displayName: "Kereta Dua",
        totalCars: 9,
        cars: [{ carId: "KA_DUMMY_DATA-CAR-05", carNumber: 5 }],
        carInsights: [createInsight("KA_DUMMY_DATA", "TS-002", "Diagnosis kereta dua")]
      }
    ];

    render(<InteractiveTrainsetPanel compositions={compositions} />);

    fireEvent.click(screen.getByRole("button", { name: "Pilih Trainset" }));

    const search = screen.getByRole("textbox", { name: "Cari Trainset" });
    expect(search).toHaveFocus();

    fireEvent.change(search, { target: { value: "T" } });

    expect(screen.getByText("2 rekomendasi ditemukan")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /TS-001/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /TS-002/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /TS-002/i }));

    expect(screen.queryByRole("dialog", { name: "Pilih Trainset" })).not.toBeInTheDocument();
    expect(screen.getByTitle("Kereta Dua")).toHaveTextContent("TS-002");
  });
});
