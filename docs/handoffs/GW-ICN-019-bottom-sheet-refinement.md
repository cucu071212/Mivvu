# GW-ICN-019 — Category interaction refinement (GW-ICN-014)

Plan revision: **GW-PLAN-REV-2026-10-29**
Human decision: **2026-10-29** (direct dispatch for GW-ICN-014)

## Supersedes (category selection only)

The accepted GW-ICN-019 **collapsed inline disclosure panel** (`mivvu-icn-category-disclosure` / expandable chip panel) is **superseded** for production ICN browse by:

- One compact **full-width type row** (`유형` / `Type` + current value, default `전체` / `All`) with chevron.
- **Bottom sheet** for top-level category choice (immediate apply + close; no Apply button).
- Optional **second row + bottom sheet** for **medium** subcategory when a top-level category is selected.
- Hub filter state still keyed by **KO `large` / `medium` strings**; EN labels from paired fixture rows only.

Header inset, two-row toolbar, card layout, detail hierarchy, and GW-ICN-013 return-filter ownership are **unchanged** except extending the hub/session contract with `categoryLarge` and `categoryMedium`.

Historical GW-ICN-019 acceptance evidence (prototype screenshots, inline panel) remains valid for overall IA; this note records the **approved density refinement** only.
