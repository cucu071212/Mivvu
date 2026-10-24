# GateWise — recording shot list and presentation script

GW-021/023, finalized 2026-10-24 (Eastern Time). Target **2:40**, not yet a measured rehearsal or completed recording. [Production](https://gate-wise-iota.vercel.app) loads; the core sequence below was exercised in the [independent live audit](consolidated-qa-report.md). Recheck the final deployment before recording. No source JSON edits or new timing assumptions are needed.

## Setup and concise shot list

Start a clean production view: main boarding **50**, buffer **10**, scenario **50**, queue delta **0**, demo estimates **off**, filters cleared. Close unrelated tabs/notifications; record readable text and clear audio. If the live behavior differs, pause and report it rather than narrating an expected result as observed.

| Time | Shot / action | Evidence to keep readable |
| --- | --- | --- |
| 0:00–0:20 | Presenter/project title, then production opening view | Team GateWise; URL; passenger problem. Use the actual team names in the submission fields. |
| 0:20–0:45 | Scope and 12-place count; select Coffee, optionally search Peet | Terminal 2 D Gates; approved Peet's D7; official listing/date; unknown timing. |
| 0:45–1:15 | Enable demo estimates; show Peet's breakdown | Demo banner; 3 + 3 + 8 + 10 + 10 = 34; 50 available → +16 feasible. |
| 1:15–1:45 | Scroll to What-if, change scenario only to 35; queue stays 0 | Baseline +16 preserved; scenario +1 tight; explanation. |
| 1:45–2:10 | Change scenario queue delta to +7 | Baseline +16; scenario −6 over budget; 15 fewer available + 7 more queue reduces margin by 22. |
| 2:10–2:25 | Briefly turn demo estimates off | Both runs unknown; no zero-filled queue or invented total. |
| 2:25–2:40 | Presenter closing over readable app view | Implementation, future work and no boarding guarantee. |

Capture 3–4 stills from the **final reviewed build**: opening/scope, source-plus-estimate breakdown, before/after comparison, and (only if confirmed deployed) the schematic with its disclaimer. Avoid credentials, unrelated personal information, stale preview UI or screenshots implying unknown times are measured. Screenshot/recording creation and upload remain pending human execution.

## Read-aloud script (approximately 300 words)

**0:00–0:20**

“We're team GateWise. Imagine waiting at your gate and wondering whether you have time for coffee. A map tells you where a café is, but it doesn't show whether a visit and the trip back fit before boarding starts. That's the problem we built GateWise to make clearer.”

**0:20–0:45**

“Our MVP focuses on SFO Terminal 2, D Gates, with twelve sourced facility records. I'll filter to coffee and show Peet's near D7. Its location comes from official SFO information. That doesn't tell us today's queue or whether the business is currently open, so visit timing starts as unknown.”

**0:45–1:15**

“Now I'll enable clearly labeled demo estimates. These are synthetic assumptions, not airport measurements. We add three minutes outbound, three returning, eight in queue, ten for the activity and a ten-minute buffer. That's thirty-four required minutes. With fifty minutes until boarding starts, the margin is sixteen: feasible in the model.”

**1:15–1:45**

“What if boarding starts in thirty-five minutes instead? I change only the hypothetical scenario. The baseline stays at fifty, while the scenario leaves one minute of margin: tight. Both sides use the same recommendation engine.”

**1:45–2:10**

“Add seven minutes to the queue assumption and the visit needs forty-one minutes, leaving a six-minute deficit: over budget. Fifteen fewer available minutes plus seven extra queue minutes reduce the margin by twenty-two. The comparison explains what changed.”

**2:10–2:25**

“Turn estimates off and both results return to unknown. We don't replace missing information with zero. We also keep unverified security-side access out of eligible recommendations.”

**2:25–2:40**

“We built this with Next.js, React, TypeScript and one deterministic time-budget engine. Next we want better evidenced travel data and stronger accessibility validation. GateWise exposes assumptions; it never promises boarding success.”

## GW-015 and recording gates

GW-015 is undergoing final integration/deployment. It was **not visible on production** when this package was finalized. The base script does not depend on it. Only after a fresh production check confirms all 12 entries, source/confidence labels and the non-geographic disclaimer may the presenter add: “This schematic groups published landmarks; its spacing is not geography, distance or a walking route.” Replace part of the scope shot; keep the total under three minutes. Do not infer travel times from boxes or claim gate landmarks change the calculations.

Do not demonstrate E/F as Terminal 2 zones or use the 42-minute synthetic regression example. Do not claim GW-E/two-stop planning, live flights, real-time queues, AI inference, current operating hours or measured indoor navigation. Explain ineligible policy verbally; the approved dataset has no live ineligible example to show.

Rehearse once with a timer, record actual duration, watch the export, verify audio/readability, and test the video link without signing in. The official event permits a video up to five minutes; this script targets 2–3. See [submission-checklist.md](submission-checklist.md) for the source and final handoff gates. No recording, upload or submission is claimed by this script.
