# GW-ICN-019 — ICN mobile UX prototype (accepted design)

Plan revision: **GW-PLAN-REV-2026-10-29** · **Design acceptance:** human owner **2026-10-29**

**Branch:** `design/gw-icn-019-icn-ux` · **Base:** `chore/gw-icn-011-012-package` @ `460be126cddebc8b9df4a00b5fe9d5ea645a775b`

## Open locally

```bash
cd docs/design/gw-icn-019
python3 -m http.server 8766
```

Open `http://127.0.0.1:8766/`. If a port is busy, pick another (see `GW_ICN_019_PORT` for capture scripts).

**Harness vs viewport:** The page header (viewport dropdown, demo scenario) is **review chrome only**. Screenshots capture **`#phone`** at 360/390/430 harness widths.

## Screenshot evidence

See [`screenshots/README.md`](screenshots/README.md) for **authoritative vs superseded** captures.

| Priority | Files |
| --- | --- |
| **Accepted header** | **`11-header-browse-ko-390px.png`** (+ supporting `12`–`16` @ 390px) |
| **EN-corrected content** | `07`–`10` (`-360px` / `-390px` / `-430px`) |

Full KO journey `01`–`06` are not in the publication commit; regenerate with `capture-screenshots.mjs` if archived QA needs them.

## Regenerate (optional)

From repo root with linked `node_modules`:

```bash
GW_ICN_019_PORT=8766 node docs/design/gw-icn-019/capture-screenshots.mjs
GW_ICN_019_EN_ONLY=1 GW_ICN_019_PORT=8766 node docs/design/gw-icn-019/capture-screenshots.mjs
GW_ICN_019_PORT=8768 node docs/design/gw-icn-019/capture-header-screenshots.mjs
```

## Docs

- [`DESIGN-RATIONALE.md`](DESIGN-RATIONALE.md) — intent, header inset rule, EN pairing  
- [`IMPLEMENTATION-HANDOFF.md`](IMPLEMENTATION-HANDOFF.md) — GW-ICN-013–017 wiring notes  
- [`../../handoffs/GW-ICN-019-checkpoint.md`](../../handoffs/GW-ICN-019-checkpoint.md) — acceptance + verification log
