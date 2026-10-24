import type { ResolvedDurationSource } from "@/types/airport";

const LABELS: Record<ResolvedDurationSource, string> = {
  user_override: "Your estimate",
  demo_estimate: "Demo estimate",
  official_record: "Official source",
  unknown: "Unknown",
};

export function durationModelLabel(source: ResolvedDurationSource): string {
  return LABELS[source];
}

export function durationModelBadgeClass(source: ResolvedDurationSource): string {
  if (source === "user_override") {
    return "gw-badge gw-badge-demo";
  }
  if (source === "demo_estimate") {
    return "gw-badge gw-badge-demo";
  }
  if (source === "official_record") {
    return "gw-badge gw-badge-verified";
  }
  return "gw-badge gw-badge-unknown";
}
