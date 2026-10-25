# GateWise judge walkthrough — GW-018

Target: **2–3 minutes**; updated 2026-10-25 for the **GW-E2 + GW-UX-POLISH release candidate**. Rehearse on the **exact preview or production SHA** the lead approves. The app includes Flight context, Explore (26 browse / 12 recommend-eligible D Gates), Results with timeline and what-if, and a **demo-only** two-stop planner on My Plan.

Integration note (2026-10-24): imported from teammate commit `e7d06298806a0023e2fce20a0c907719b65451de` onto `feature/core-app`, based on GW-013 commit `140ef64`. References to the "local checkout," "this build" and the preview fallback describe the teammate's authoring snapshot at `4689e47`. Select the narrative/fallback only after checking the actual presentation build; this import makes no new claims about UI readiness.

The human requested this lowercase filename; no second `DEMO_SCRIPT.md` is created. QA cases and recording guidance are in [qa-checklist.md](qa-checklist.md); facility evidence is in [data-provenance.md](data-provenance.md).

## Presenter readiness

Use the live-action version only after the lead verifies the reviewed build: SFO welcome, Flight inputs, Explore directory, Results rankings, what-if comparison, and (optional) My Plan two-stop demo with disclaimers visible.

The real 12-record dataset has null waiting/activity times. Start by explaining unknown results. A numerical demo additionally needs an **explicitly approved, clearly labeled synthetic D-only scenario**, separate from the production JSON. The proposed arithmetic below does not approve new time values, implement a fixture, or assign estimates to Napa Farms/Peet's/16th & Dolores. If this setup is unavailable, use the honest fallback below.

Proposed model-only scenario: D→D 3 outbound + 3 return + queue 8 + activity 10 + buffer 10 = **34 minutes required**. The three-minute legs are already labeled demo estimates; queue/activity assumptions still need explicit lead approval. This is separate from the original 42-minute D/E regression, which belongs only to illustrative tests.

## 2:30 narrative with conditional action cues

| Time | Presenter narration | Action, only if verified in the reviewed build |
| --- | --- | --- |
| 0:00–0:25 | “You have time before boarding, but an airport map only tells you where things are. The harder question is whether you have time for coffee or food and still return to your gate. GateWise helps make that tradeoff visible.” | Show the opening view. |
| 0:25–0:50 | “Our MVP focuses on SFO Terminal 2, D Gates. We have twelve sourced facility records. We keep official location information separate from timing assumptions. Those sources do not tell us the current queue or guarantee that a business is open.” | Show the scope and sourced entries. If search is verified, find Peet's near D7 and briefly switch category. |
| 0:50–1:20 | “When visit times are unknown, the model says unknown. For the next example, we use clearly simulated inputs. The model adds outbound travel, return travel, queue, activity and one buffer. Here that is three plus three plus eight plus ten plus ten: thirty-four minutes. With fifty minutes until boarding starts, the margin is sixteen: feasible in the model.” | First show unknown on the unmodified dataset. Then use only the approved synthetic scenario; show its full breakdown and labels. |
| 1:20–1:55 | “What if boarding starts in thirty-five minutes instead? The same visit now leaves one minute of margin: tight. Now add seven minutes to the queue assumption. Required time rises to forty-one minutes, leaving a six-minute deficit: over budget. The comparison explains what changed while keeping the baseline visible.” | Keep baseline at 50/queue delta 0; hypothetical 35/0, then 35/+7. Verify +16 → +1 → -6 margins. |
| 1:55–2:20 | “These are model outcomes, not live airport measurements. Missing information stays unknown. A facility whose security-side eligibility is unverified must not be treated as eligible. Our aim is to show the assumptions and the reason for a recommendation.” | Show source/estimate details and unknown/ineligible explanation only if an approved fixture and UI support it. Otherwise explain verbally. |
| 2:20–2:30 | “GateWise helps travelers compare options with the time they have. It does not promise boarding success; travelers must follow their airline's instructions and allow for changing conditions.” | End on the comparison or opening view. |

The spoken text is approximately 250 words; the timing is an estimate until rehearsed, allowing pauses for actions, calculations and labels. Do not read the setup notes to judges or imply that conditional UI actions have already been demonstrated.

## If integration or the numeric fixture is unavailable

Use a clearly announced design-preview walkthrough. Replace live-action claims with:

“This build currently shows our design preview. The sourced twelve-record dataset and validation/filtering utilities are prepared, but the recommendation and what-if flow has not been verified in this build. The intended calculation is transparent: for a hypothetical thirty-four-minute visit, fifty minutes until boarding leaves sixteen minutes of margin; thirty-five leaves one. Adding a seven-minute queue assumption creates a six-minute deficit. That arithmetic illustrates the planned comparison, not a live result.”

Show only what actually exists, reference the written calculation if useful, and close with the same uncertainty and boarding-success caveat. Do not click a static chip and describe it as a computed outcome, invent a recording, or claim the demo is deployed. Keep the full walkthrough within 2–3 minutes by shortening the middle section rather than repeating both versions.

## Rehearsal checks

- Confirm the exact build/URL and whether each action is available; otherwise use the fallback.
- Keep the original production JSON unchanged: unknown visit durations remain null.
- Confirm hypothetical changes use the shared engine and preserve baseline values.
- Confirm the audience can read the timing breakdown, source date and estimate badges.
- Check arithmetic against QA cases N05–N08 and W01–W03. D/E/F tests must not appear as actual Terminal 2 zones.
- Time one spoken rehearsal and record actual duration. This script alone is not a completed regression run or demo recording.
