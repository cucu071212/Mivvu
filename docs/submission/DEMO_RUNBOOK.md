# Technical demo runbook (production)

**URL:** https://gate-wise-iota.vercel.app  
**SHA to announce:** `c9c163c` (`c9c163cd7ee51d270e1a079daf84ffaf37b5952a`)  
**Numbers below were read from the live alias on 2026-10-25**, except E04 which was read from the same deployment earlier the same day. Do not invent nicer numbers.

Offline fallback: `npm run build && npm run start`, then the same clicks on http://localhost:3000.

## 0. Reset

Hard-refresh. If Welcome appears, select **SFO** → **Continue to Flight dashboard**.  
If an Explore search is still filled, clear it before Results so all 26 cards show.

## 1. Honest Unknown (no demo)

**Flight**

- Baseline minutes until boarding starts: **50** (default)
- Safety buffer: **10**
- Demo estimates: **leave OFF**

**Results**

Eligible D Gates cards stay **Unknown** for queue/activity. Say: “The official record has no wait time, so we do not invent one.”

**My Plan** (optional here)

Pick Burger Joint + Peet’s Coffee with travel **unchecked**. Expect **Why timing is Unknown**.

## 2. Feasible single-stop (demo on)

**Flight:** turn **Demo estimates for wait & activity times ON**.  
Keep **50** / **10**.

**Results → Burger Joint** (verified live):

| Leg | Minutes |
| --- | --- |
| Walking (out + return) | 6 (3 + 3) |
| Queue / wait | 8 |
| Activity | 10 |
| Safety buffer | 10 |
| **Total required** | **34** |
| **Margin** | **+16** |
| **Class** | **Feasible in model** |

Say these are labeled demo estimates, not measured SFO times.

## 3. Tight and Over Budget via What-if

Stay on Results. **What-if simulator** (verified live; baseline card stays +16):

1. Scenario minutes = **35**, queue adjustment = **0** → **Model margin: +1 min**, **Tight in model**.
2. Scenario minutes = **35**, queue adjustment = **7** → required 41, **Model deficit: −6 min**, **Over budget in model**.
3. Point at the baseline still showing **+16**.

## 4. Location Guidance

**Explore** (search, then open details):

| Facility | Expect |
| --- | --- |
| **16th & Dolores** | Location evidence **Verified area**. Terminal 2 · D Gates · Near Gate D16. Conceptual guide. “Gate D16, named on this listing.” Official listing + Evidence source. |
| **Vino Volo** | **Unknown**. No conceptual guide. No “named on this listing.” Facility Information **Where** may still say `D Gates, Retail Street`. |
| **Bun Mee** | **Unknown**. Harvey Milk T1 / B. T2-only scope note. No current-area chip. |

Tab through 16th’s dialog: focus stays on Close / Official listing / Evidence source. Close restores **View facility details**. Escape also closes.

## 5. Two-stop planner

**Flight demo must stay ON** for complete queue/activity numbers.

**My Plan**

1. Check **Use illustrative D-Gates travel times (demo only)**.
2. First: **Burger Joint**. Second: **Peet’s Coffee**.

Arithmetic (same both orders): 3+8+10+3+8+10+3+10 = **55** required.

| Baseline minutes | Margin | Class | Evidence |
| --- | --- | --- | --- |
| **70** | **+15** | Feasible in model | Verified live this closeout |
| **50** | **−5** | Over budget | 50 − 55; use if you do not change 50 |
| **0** (E04) | **−55** | Over budget | Verified live on this deploy |

Do not claim two-stop is a real indoor route.

## 6. If the internet or alias fails

1. `git checkout c9c163cd7ee51d270e1a079daf84ffaf37b5952a`
2. `npm install && npm run build && npm run start`
3. Repeat sections 1–5 on localhost.
4. If even that fails, speak the **34 / +16 / +1 / −6 / 55** table from this file and show the README screenshots. Do not click a static chip and call it a live computation.

## Spoken disclaimer (every numeric beat)

“This is a model pass with labeled demo minutes. It is not live SFO data and not a guarantee you will board.”
