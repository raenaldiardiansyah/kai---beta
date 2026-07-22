import { Broadcast, Train, Warning, Wrench, Heartbeat, Brain, TrendUp, TrendDown } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import type { OverviewData } from "@/services/overviewService";
import Link from "next/link";

export function SummaryCards({ summary, variant = "full" }: { summary: OverviewData["summary"]; variant?: "full" | "compact" }) {
  const items = [
    { label: `Armada Aktif · Data ${summary.dataAvailabilityPercent}%`, value: `${summary.onlineTrainsets}/${summary.totalTrainsets}`, icon: <Broadcast size={24} weight="fill" color="var(--accent)" />, link: "/live-monitoring" },
    { label: "Gerbong Online", value: `${summary.onlineCars}/${summary.totalCars}`, icon: <Train size={24} weight="fill" color="var(--muted)" />, link: "/trainset" },
    { label: "Kesehatan Global", value: `${summary.globalHealthScore}%`, icon: <Wrench size={24} weight="fill" color="#10b981" />, link: "/predictive-maintenance", delta: summary.showTrends ? "1.2%" : undefined, dir: "down", deltaColor: "#10b981" },
    { label: `Alarm Aktif · ${summary.criticalAlarms} kritis`, value: summary.activeAlarms, icon: <Warning size={24} weight="fill" color="var(--danger)" />, link: "/alarm-center", delta: summary.showTrends ? "2" : undefined, dir: "up", deltaColor: "var(--danger)" },
    { label: "Risiko Prediktif", value: summary.predictiveRisks, icon: <Heartbeat size={24} weight="fill" color="var(--warning)" />, link: "/predictive-maintenance", delta: summary.showTrends ? "1" : undefined, dir: "up", deltaColor: "var(--danger)" },
    { label: "Insight LLM", value: summary.insightCount, icon: <Brain size={24} weight="fill" color="#2563eb" />, link: "/insight-analytic", delta: summary.showTrends ? "1" : undefined, dir: "up", deltaColor: "var(--danger)" }
  ];

  const visibleItems = variant === "compact" ? items.slice(0, 3) : items;

  return (
    <div className={variant === "compact" ? "summary-grid-3" : "summary-grid-6"}>
      {visibleItems.map((item) => (
        <Card key={item.label} className="summary-card-container">
          <Link
            href={item.link}
            className="summary-card"
            title={`${item.value} ${item.label}${item.delta ? `, perubahan ${item.delta}` : ""}`}
          >
            <div className="summary-card-icon">{item.icon}</div>
            <div className="summary-card-content">
              <span className="summary-card-value">{item.value}</span>
              <span className="summary-card-label">{item.label}</span>
            </div>
            {item.delta && (
              <div className="summary-card-delta" style={{ color: item.deltaColor }}>
                {item.dir === "up" ? <TrendUp size={14} weight="bold" /> : <TrendDown size={14} weight="bold" />}
                <span>{item.delta}</span>
              </div>
            )}
          </Link>
        </Card>
      ))}
    </div>
  );
}
