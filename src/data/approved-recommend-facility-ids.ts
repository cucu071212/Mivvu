/**
 * GW-B-002 / C14 — versioned manifest of facilities that may receive time-based recommendations.
 * Browse-only rows must never appear here; `zone === "D"` alone is insufficient (26-row dataset).
 */
export const APPROVED_LEGACY_RECOMMEND_MANIFEST_VERSION = "legacy-d-v1";

export const APPROVED_LEGACY_RECOMMEND_FACILITY_IDS: readonly string[] = [
  "sfo-t2-d-16th-dolores-general-store",
  "sfo-t2-d-andale-mexican-kitchen-bar",
  "sfo-t2-d-brookstone",
  "sfo-t2-d-burger-joint",
  "sfo-t2-d-cat-cora",
  "sfo-t2-d-kiehls",
  "sfo-t2-d-lark-creek-grill",
  "sfo-t2-d-napa-farms-market",
  "sfo-t2-d-peets-coffee-d7",
  "sfo-t2-d-sunglass-hut",
  "sfo-t2-d-the-chocolate-market",
  "sfo-t2-d-wakaba",
] as const;
