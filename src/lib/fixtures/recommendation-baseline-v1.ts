import type { RecommendationEligibilityBaseline } from "../audit-facility-data";

/** Test-only acceptance fixture, not a runtime manifest or eligibility authority.
 * Approved GW-004 IDs retained at origin/main 47c07028e1eccb3515f8bd8bfddd80f1c90fccdd.
 * Do not regenerate this list from facilities.json: that would hide expansion.
 */
export const RECOMMENDATION_BASELINE_V1: RecommendationEligibilityBaseline = Object.freeze({
  version: "sfo-t2-d-approved-12-v1",
  approvedFacilityIds: Object.freeze([
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
  ]),
});
