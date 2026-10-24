import type { DataConfidence } from "@/types/airport";

const LABELS: Record<DataConfidence, string> = {
  official_verified: "Official source",
  demo_estimate: "Demo estimate",
  third_party: "Third party",
  unknown: "Unverified",
};

const CLASS: Record<DataConfidence, string> = {
  official_verified: "gw-badge gw-badge-verified",
  demo_estimate: "gw-badge gw-badge-demo",
  third_party: "gw-badge gw-badge-unknown",
  unknown: "gw-badge gw-badge-unknown",
};

export function ConfidenceBadge({ confidence }: { confidence: DataConfidence }) {
  return (
    <span className={CLASS[confidence]}>{LABELS[confidence]}</span>
  );
}
