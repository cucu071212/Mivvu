# GateWise targeted accessibility audit

Date: 2026-10-25 (America/New_York). Task: human-authorized WCAG 2.2 AA audit and three targeted UI fixes. Starting `origin/main`: `47c07028e1eccb3515f8bd8bfddd80f1c90fccdd`, confirmed by fetch. Branch: `codex/accessibility-audit`.

Scope: Flight (`/`), Explore (`/explore`), Recommendations (`/recommendations`), and shared controls. Reviewed AGENTS.md, PLAN.md, implementation-plan context, GW-F integration invariants, and existing QA notes. Earlier QA notes identified assessment gaps but did not provide a completed accessibility audit. No dependencies, datasets, eligibility rules, calculation logic, or Phase B/GW-E files changed. No merge or deployment.

## Confirmed defects fixed

| ID / severity | Reproduction and evidence | Relevant WCAG criteria | Minimal fix / regression coverage |
| --- | --- | --- | --- |
| A11Y-1 / Medium | Load any scoped page and Tab from the top. Keyboard users must traverse repeated navigation/countdown controls; no skip link exists. The main landmark already supports assistive-technology navigation, but ordinary sequential keyboard navigation lacks a bypass. | [2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html); focus checks support 2.4.7 and 2.4.11. | First-focusable skip link targets `main` with `tabIndex=-1`. Link appears on focus; scroll margin accommodates the countdown dock. Component test verifies link order, target, and focusability. Chrome verifies Tab → Enter → main → Tab into content, visible outline, and next control not fully obscured. |
| A11Y-2 / High | Open Recommendations with default data. Badge icon and text are `aria-hidden`, while their generic outer span has a prohibited `aria-label`. Axe reports 78 affected badge instances, including What-if comparisons, in each desktop theme. The intended status, reason, and caveat are not reliably exposed. | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html); 1.1.1 Non-text Content for the combined status symbol. | Add `role="img"` to the existing combined icon/text badge, making its existing full label valid. Keeps visible text and model caveats unchanged; adds no live region. Component test queries the accessible role/name and verifies the visible label and decorative icon. Browser verifies accessible names; all 78 prohibited-label findings disappear. |
| A11Y-3 / Medium | On Flight, leave the boarding date/time blank, activate Start countdown, then return to the field. It is marked invalid and an alert appears, but its accessible description is empty: the error is outside the label and unassociated. | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html); supports 3.3.1 Error Identification. | Give the existing alert an ID and conditionally reference it with `aria-describedby`. Keep validation and countdown calculations unchanged. Test verifies association to the actual alert and removal after correction. Chrome verifies the accessible description and clearing through Suggest from manual budget. |

`src/components/Accessibility.test.tsx` contains the three focused regressions. Each was observed failing for the missing behavior before the fix, then passing. A test-fixture setup error was corrected before confirming the badge failure. During final verification, a TypeScript-incompatible transitive helper import was replaced with existing Testing Library/DOM assertions; no package changes were needed.

## Actual verification

| Command / check | Result |
| --- | --- |
| `npm test -- Accessibility` | PASS — 3 tests. |
| `npm test` (final run after test-import correction) | PASS — 38 files, 634 tests. Existing Vite warning about future native config-loader compatibility remains. |
| `npx tsc --noEmit` | PASS — final run. Initial run failed on the new test's transitive helper import; corrected as above. |
| `npm run lint` | PASS — no reported lint errors or warnings. |
| `npm run build` | PASS — default Turbopack production build; TypeScript and all 7 static pages completed. |
| `git diff --check` | PASS before commit. |
| Local production server: `npm run start -- --port 3108` | PASS — served the verified build. |
| Chrome 156.0.8078.47 + axe-core 4.14.0 | 12 production scans: 3 routes × 1280/320px widths × light/dark, height 900px; tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. Eleven scans had zero violations; light/mobile Recommendations retained one existing contrast finding (below). This is not an all-clear accessibility result. |
| Keyboard browser checks | PASS in all 12 combinations: first Tab reveals skip link with an outline, Enter focuses main, next Tab enters main content and is not fully obscured by navigation/dock. Checks wait for existing smooth scrolling. No trap in these sampled paths. |
| Dynamic browser smoke | PASS — invalid countdown description, suggestion clears error, start/pause/resume, running countdown persists across navigation, search gives 0 of 26 then clears, accessible recommendation badge, invalid What-if minutes suppress comparisons and correction restores them. |
| Reflow sample | No horizontal page overflow at normal text size at 320px or 1280px. At 200% root font size, desktop remains within viewport; narrow-screen overflow remains (below). |

Browser checks used existing Playwright and Chrome installations and existing axe-core, with no installs or E2E infrastructure edits. Local scripts/results are preserved at `/tmp/gatewise-a11y-production.cjs`, `/tmp/gatewise-a11y-production.json`, and `/tmp/gatewise-a11y-limits.json`; the committed component tests provide durable regression coverage. Browser scripts use local installation paths and are not portable CI infrastructure.

The cached Chromium binary was incomplete, so installed Chrome was used. An initial webpack diagnostic run did not process the project's Turbopack-only Tailwind setup; its visual findings were discarded. All reported visual results use the default Turbopack pipeline. Existing dependencies were copied into this isolated worktree to satisfy Turbopack's resolution boundary. Next.js-generated AGENTS.md additions were restored to the starting version after stopping the development server; no instruction or configuration changes are included.

## Remaining limitations and follow-up

- **Existing contrast defect (Medium; 1.4.3):** What-if's small bold “Scenario” label uses `#0891b2` on white, measured by axe at **3.68:1**, below 4.5:1. Reproduce in light mode at 320px on Recommendations; the selector is `.text-\[var\(--gw-cyan-muted\)\]` in `WhatIfSimulator.tsx`. No color tokens or What-if markup changed in this task. Retained for a separately authorized fix after the three selected defects.
- **Text-scaling overflow (Medium; assess 1.4.4/1.4.10):** at a 320px viewport and 200% root font size, page widths are Flight 382px, Explore 371px, Recommendations 490px in both themes. Flight inputs and the personal-estimates header/badges contribute. Removing the skip-link and main-target additions in-browser leaves these widths unchanged. This combined stress test is not equivalent to a complete browser-zoom conformance test; responsive text sizing needs follow-up.
- Axe left manual-review items for contrast (including gradients), Flight generic-element ARIA, and Recommendations required-child semantics. Zero automated violations on a sampled page does not resolve incomplete checks.
- Source inspection found native inputs/buttons/links, named navigation and main landmarks, page headings, textual outcome labels, filter-count announcements, and validation alerts. Countdown minute ticks are not wrapped in a live region; boarding-start alerts are event-driven. The fixes do not introduce per-tick announcements. Actual speech behavior was **not** tested with VoiceOver/NVDA.
- What-if displays labeled baseline/scenario comparisons and retains existing validation alerts. Announcement timing for changed results, complete heading hierarchy, route-change focus across all flows, all keyboard paths, Safari/Firefox, touch assistive technology, forced colors, and true 200%/400% browser zoom were not exhaustively evaluated.

This is a focused improvement report, **not a declaration of full WCAG 2.2 AA compliance**. Recommend lead review and merge of the three scoped fixes, with the remaining contrast/text-scaling issues tracked separately. Lead retains merge/deployment authority.
