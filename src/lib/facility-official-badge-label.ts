import type { FacilityOfficialBadge } from "@/types/airport";

const BADGE_LABELS: Record<FacilityOfficialBadge, string> = {
  open_past_10pm: "Open past 10 PM",
  military_discount: "Military discount",
  sit_down_restaurant: "Sit-down restaurant",
  sfo_green_business: "SFO Green Business",
};

export function facilityOfficialBadgeLabel(badge: FacilityOfficialBadge): string {
  return BADGE_LABELS[badge];
}
