# GW-ICN-019 screenshot evidence (accepted design)

Plan revision: **GW-PLAN-REV-2026-10-29** · Human acceptance: **2026-10-29**

## Authoritative header (accepted)

| File | Role |
| --- | --- |
| **`11-header-browse-ko-390px.png`** | **Canonical accepted header** — right-aligned Mivvu with `--mivvu-surface-inline-pad` inset from the search/card content rail |
| `12-header-browse-en-390px.png` … `16-header-saved-en-390px.png` | Same header CSS on browse / detail / saved × KO/EN at 390px (supporting) |

Do **not** use centered-wordmark captures or pre-inset header crops for implementation sign-off.

## EN journey content (accepted prototype data)

| Files | Role |
| --- | --- |
| `07-browse-default-en-*` | Fixture-backed EN listing text (`% ARABICA`, `Near Gate 209`, …) |
| `08-browse-en-ko-fallback-sim-*` | Labeled simulated KO field fallback + disclosure |
| `09-detail-en-ko-fallback-sim-*` | Detail KO name disclosure |
| `10-detail-save-blocked-en-*` | Storage-unavailable save UX |

**Note:** Full-height journey PNGs `07`–`10` may show an older header strip in the top crop; treat **`11`–`16`** as the header source of truth.

## Superseded / not in this publication commit

| Item | Status |
| --- | --- |
| Centered Mivvu wordmark (rev 2 draft) | **Superseded** by right-aligned + inset header |
| Wordmark flush to language pill outer edge (pre-inset) | **Superseded** by content-rail inset |
| KO journey set `01`–`06` (full `#phone` captures) | **Not committed** here; regenerate with `capture-screenshots.mjs` if needed for QA archives |

Regeneration commands: see [`../README.md`](../README.md).
