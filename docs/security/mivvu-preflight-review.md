# Mivvu pre-release security preflight

## Current PR review decision — 2026-10-28

The human owner directly authorized packaging the implemented Mivvu entry, ICN browse, KO/EN support, and SEC-01/02/03 changes for draft PR review under **GW-ICN-005**, plan revision **GW-PLAN-REV-2026-10-26**. Commit, normal push to `feat/mivvu-first-entry-slice`, and draft PR creation are authorized; merge, production deployment, infrastructure changes, active scanning, new features, and dependency upgrades are not.

**Strix/Shannon and isolation setup are skipped for this release by owner decision. Active penetration testing was not performed.** The earlier blocked-isolation verdict and proposed runbook below are historical preparation, not a current PR-packaging gate or instructions to execute. The decision to proceed is not an independent code audit or a guarantee that the application is secure.

SEC-01 emits controlled client errors without forwarding upstream credentials/URLs/bodies. SEC-03 enforces `import "server-only"`; its empty-marker alias is confined to Vitest's `test.alias`, outside the real Next application resolver. SEC-02 adds `script-src-attr 'none'`; production inline script blocks and styles remain allowed, and no complete XSS defense is claimed. SEC-04's later dependency-only appendix records zero known-advisory findings from the completed registry checks, with bundled-code/provenance and runtime exploitability limits still open. These historical checks were reviewed, not repeated as a new dependency audit.

Final combined checks and publication evidence are recorded in the [PR packaging handoff](../qa/mivvu-pr-packaging.md). Human review remains pending. Browser evidence covers installed Chromium with mobile-size viewports, not physical devices or other browser engines. No production integration or deployment is claimed; this PR does not itself authorize production promotion.

## Historical preflight and remediation evidence

Review date: **2026-10-27, America/New_York**. Preparation only; no active penetration test was authorized or performed.

**SEC-01 follow-up, 2026-10-28:** The human owner separately authorized a local client error-handling fix and focused tests. That fix and its evidence are recorded below. The original preflight baseline/checks remain historical; no active test, installation, infrastructure, commit, push, merge, or deployment is authorized by this follow-up.

**Verdict: blocked by isolation or prerequisites.** Continue with read-only review. Shannon is the preferred candidate of the two requested tools, but its stock launcher is **not approved for this boundary**. The isolated, deterministic browser preflight below is a proposed, more controllable next step; it has not been run. Neither this document nor a successful preflight authorizes agentic testing or production release.

## Authority and reviewed baseline

- Task reference: **GW-ICN-005, supplemental Mivvu security preflight**, directly assigned by the human owner through the attached task in Codex chat on 2026-10-27. There is no dedicated security-task row in the existing queue. This report records that limited authorization without creating a second authoritative implementation plan or inventing a new queue ID.
- Plan revision: **GW-PLAN-REV-2026-10-26**. Read [AGENTS.md](../../AGENTS.md), [PLAN.md](../../PLAN.md), [the existing queue](../IMPLEMENTATION_PLAN.md), [QA](../qa/mivvu-preview-qa.md), [entry handoff](../design/mivvu-first-entry-handoff.md), and [browse handoff](../design/mivvu-icn-browse-handoff.md). GW-ICN-003/004/005 acceptance is pending; GW-ICN-006 production release remains unauthorized.
- Actual branch: `feat/mivvu-first-entry-slice`. HEAD: **`518534a89acd24917e5b9a55aef87e746ce51a92`**, checkpoint subject “Checkpoint Mivvu preview entry, ICN browse, and GW-ICN-005 QA.”
- Reviewed **working-tree contents**, including uncommitted integration above that checkpoint. There were 30 tracked changed paths: the implementation plan, both design handoffs, five E2E files, and application/component/test/route files. `src/app/(app)/page.tsx` was deleted; Flight is now `/flight`.
- Initial untracked paths: `.DS_Store`, `docs/.DS_Store`, `src/app/(app)/flight/page.tsx`, the three files under `src/app/(mivvu-entry)/`, `src/components/mivvu/MivvuEntryLayoutShell.tsx`, `src/components/mivvu/MivvuIcnBrowsePage.tsx`, `src/lib/mivvu-entry-routes.ts`, and its test. All were included in the local secret check. The application additions and tracked source diff were read.
- Initial content manifest: 344 existing tracked/untracked files, SHA-256 **`cd97e359929093c967c679f499c5daf7328167a58dc4dacdaf4217640c9657cd`** (hash of sorted JSON mapping relative paths to file SHA-256). Initial `git diff --binary HEAD` SHA-256: **`5bff4d562e285a18b897c821e646d6514b5181fed067f967f0406f47dbd6920f`**. These distinguish the dirty state from HEAD alone.
- Existing build ID: `yHI2Y0VQFpKUivVFt-4uO`. Its prerender manifest includes `/`, `/icn`, `/flight`, `/explore`, `/recommendations`, `/plan`, and the two preview URLs. This is an inspected existing artifact, **not a newly verified build** or deployment provenance proof.
- `lsof -nP -iTCP:3113 -sTCP:LISTEN` found Node PID 94653 listening on `127.0.0.1:3113`. No request was sent to that server; its process/build freshness was not independently proved. It is **not** the proposed isolated target.
- No reset, stash, branch switch, commit, push, merge, deployment, installation, fixes, dependency changes, credential validation, or account changes were performed. Remote deployment state and whether older work was pushed were not inspected; historical handoff statements are not fresh deployment evidence.

Only this report is a repository edit from this assignment. The handoffs contain 2026-10-28 dates; those are retained historical document labels, not substituted for this client's review date.

## Findings and evidence

No confirmed critical/high application vulnerability or material secret exposure was established by this bounded review. The following findings and gaps remain; absence of other findings is not a security assurance.

| ID / severity | Evidence and impact | Recommended follow-up, not performed |
| --- | --- | --- |
| SEC-01 **Medium, conditional credential disclosure — fixed locally; review pending** | Original preflight: the client interpolated `String(error)` and forwarded upstream gateway/API text; synthetic credential propagation was reproduced, with no actual key exposure found. Follow-up: `src/lib/icn-facilities/icn-facilities-client.ts:24–50,86–125` now emits controlled errors across setup, fetch, response-body read, HTTP, JSON, and API-parser failures. It retains no original error, cause, stack, URL, body, or upstream message/code. See the remediation evidence below. | Human owner review of the local fix; no release approval implied. Standalone probe logging and direct pure-parser diagnostics are outside this client-boundary fix and remain unchanged. No credential rotation or history rewrite was performed. |
| SEC-02 **Low, defense in depth — partially tightened locally; review pending** | Actual public Vercel responses allow `unsafe-inline` in both `script-src` and `style-src`, with no production `unsafe-eval`. `next.config.ts:15–22` now additionally sets `script-src-attr 'none'`; a fresh local production build blocks a benign inline event-handler assertion while preserving ordinary React interactions. Inline script blocks and styles remain allowed for the reasons and evidence below. This is a confirmed policy limitation, not demonstrated XSS. | Human owner review of the narrow local change. Eliminating the remaining allowances needs separately approved rendering/build/style work; no nonce infrastructure, dynamic-rendering change, deployment, or broader XSS assurance is implied. |
| SEC-03 **Low, boundary enforcement gap — fixed locally; review pending** | `src/lib/icn-facilities/icn-facilities-client.ts:6` now imports the standard `server-only` marker. The actual Next.js production build rejected a temporary Client Component import with the intended server-only diagnostic and a client import trace. A legitimate server import and browser imports of pure utilities/type-only declarations built successfully. See the dated SEC-03 evidence below. | Human owner review of the local boundary/config change. `vitest.config.ts:5–13` handles the marker only within the Node test/sync CLI harness; no Next.js/application resolver bypass, dependency installation, live API integration, or release was introduced. |
| SEC-04 **Medium, release verification gap; exploitability unresolved** | Root React/React DOM are `19.3.0`; the current upstream RSC advisories list `react-server-dom-*` 19.3.0 as affected and 19.3.1 as patched. Those are **different packages**. Next `16.4.3` vendors RSC code whose local metadata references `19.3.0-canary-278794d7-20261002`; that version string alone does not establish which fixes were backported. Next's corresponding October advisories identify `16.4.1` as patched, which this installation exceeds. Do not report root React's number as proof of an exploitable Mivvu RSC defect, or assume every vendored fix from package version alone. | Before release acceptance, reconcile the Next release's vendored RSC patch provenance and a complete current dependency advisory check. Do not run exploit/DoS requests to settle this question. Sources below. |
| SEC-05 **Informational, active-test blocker** | No `docker`, `podman`, `nft`, Gitleaks, TruffleHog, Semgrep, OSV scanner, Syft, or Grype was available on PATH. No disposable VM/network policy, preloaded scan images, isolated model controller, hard spend gate, or approved model access was verified. | Provision and verify an isolated preflight under a separate human assignment. Stock autonomous launchers cannot be treated as localhost-only security boundaries. |

### SEC-01 local remediation — 2026-10-28

**Authorization:** Direct human assignment in Codex chat, 2026-10-28 (America/New_York), limited to SEC-01, local error handling, focused regression tests, lint/type checking, and this report update. Task reference remains **GW-ICN-005 / SEC-01**, plan revision **GW-PLAN-REV-2026-10-26**; no new implementation queue or permission to address other findings. Reviewer: **human owner**, pending. Baseline branch/HEAD is still `feat/mivvu-first-entry-slice` @ `518534a89acd24917e5b9a55aef87e746ce51a92`, with the inherited uncommitted integration and preflight report preserved.

**Fix:** The client constructs fresh `IcnFacilitiesClientError` objects from fixed messages and a controlled code. It never stringifies, logs, attaches as `cause`, or copies properties from a rejected fetch/body error or API-parser error. Upstream HTTP body/status text, gateway messages, API result messages/codes, and JSON syntax diagnostics are discarded at the client boundary. HTTP status remains a numeric diagnostic. A new local stack is generated; the upstream stack is not retained.

| Public error code | Meaning / safe metadata |
| --- | --- |
| `MISSING_SERVICE_KEY` | No configured key; no value included |
| `INVALID_REQUEST` | Invalid request setup, including existing pagination checks and deadline setup |
| `TIMEOUT` | This request's locally created deadline signal was aborted during fetch/body reading |
| `NETWORK_FAILURE` | Fetch/body-read rejection without local deadline expiry; remote exception names are not trusted |
| `HTTP_FAILURE` | HTTP failure, with numeric `httpStatus`; applies even when the error body is not JSON |
| `INVALID_RESPONSE` | Successful HTTP response was not valid JSON |
| `API_FAILURE` | Gateway/API rejection or response-schema/parser failure; no arbitrary upstream details |

The successful response still goes through the **unchanged** pure parser and returns the same header, pagination, and items. Request destination/GET/query parameters, fixtures, sync pagination/completeness rules, and SFO/ICN product behavior were not changed. CSP and all other findings remain untouched. Direct calls to the pure parser and the separate probe script are not covered by a claim that all project diagnostics have been sanitized.

**TDD and regression evidence:** Tests were written and executed before implementation. The original client produced **21 failures / 2 passes** in the 23-case client suite: failures demonstrated credential propagation and missing controlled failure distinctions; both KO/EN success cases already passed. After the fix, **23/23 client tests passed**. The focused client/parser/sync suite then passed **40 tests across 5 files**, including the existing incomplete-sync rejection. Tests use synthetic credentials, mock `fetchImpl`, mock response-body failures, and locally controlled abort signals only. Global fetch is replaced with a failing guard in the client regression suite; no `.env.local`, real credential, provider validation, or live API request was used.

The tests inspect error objects, hidden property descriptors, string/JSON representations, and application-style logging of the sanitized error. They reject the synthetic raw/encoded key, authenticated URL, username/password, request host, cause, and unexpected error properties. Seven console methods are intercepted: the client emits no logging; simulated caller logging contains no sensitive marker. Coverage includes fetch exceptions with credential-bearing cause/stack/extra fields, arbitrary rejection stringification, body-read failures, fetch/body deadline expiry, spoofed timeout names, HTTP 403/500/502 with untrusted bodies/status text, gateway errors, untrusted API result messages/codes, malformed schema/JSON, missing key, invalid request setup, and unchanged KO/EN success results/request parameters.

Commands actually run, using installed tools and a clean process environment:

```bash
# RED before implementation: 21 failed, 2 passed; GREEN afterward: 23 passed.
env -i PATH="$PATH" ICN_SYNC=0 ICN_INVESTIGATE=0 NEXT_TELEMETRY_DISABLED=1 \
  node_modules/.bin/vitest run src/lib/icn-facilities/icn-facilities-client.test.ts

# Final focused regression: PASS, 5 files / 40 tests.
env -i PATH="$PATH" ICN_SYNC=0 ICN_INVESTIGATE=0 NEXT_TELEMETRY_DISABLED=1 \
  node_modules/.bin/vitest run \
  src/lib/icn-facilities/icn-facilities-client.test.ts \
  src/lib/icn-facilities/parse-api-response.test.ts \
  src/lib/icn-facilities/parse-api-items.test.ts \
  src/lib/icn-facilities/sync-icn-facilities.test.ts \
  src/lib/icn-facilities/validate-sync.test.ts

# PASS, exit 0 for each.
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run lint
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/tsc --noEmit --incremental false
git diff --check -- src/lib/icn-facilities/icn-facilities-client.ts src/lib/icn-facilities/icn-facilities-client.test.ts
```

Vitest still emits the pre-existing Vite native-config-loader compatibility warning; it is unrelated to SEC-01 and was left unchanged. The original whole-tree whitespace failure at `docs/design/mivvu-first-entry-handoff.md:3–5` was not repaired. No fresh build, broad suite/E2E, dependency/security scan, VM setup, or active penetration test was run for this fix. The preflight's blocked active-testing verdict is unchanged.

Final preservation review compared all **345** existing tracked/nonignored-untracked files captured at this follow-up's start: exactly the three authorized files changed, the other **342** file hashes matched, and no tracked/nonignored-untracked file was added or removed. Scoped source whitespace checks and local report link/whitespace checks passed. This preservation claim is separate from the original preflight's historical 344-file scan.

### Secrets: actual coverage and limits

A local Python checker read values from ignored `.env*` files **in memory only**, without sourcing them or printing their contents. One distinct value of at least 12 characters was available for exact/URL-encoded/URL-decoded comparison. No match occurred in:

- **344** current tracked plus nonignored untracked files (335 index entries, one deleted file, ten untracked files).
- **703** unique Git blobs reachable from **159** local refs and their reflogs, spanning **168** reachable commits (`git rev-list --objects --all --reflog`, `git cat-file --batch`). Historical versions were checked, not just the current checkout.
- **455** existing non-cache `.next` files, including **40** files under `.next/static` and **10** prerendered HTML files. The key's variable name was also absent from those 40 public assets. No public `.map` files were present there.

Pattern checks covered private-key markers, AWS IDs, GitHub/provider token shapes, authenticated URLs, credential query strings, and current-tree literal credential assignments. Two authenticated-URL-shape matches pointed to the same deliberate synthetic `user:pass` test in `src/lib/audit-facility-data.test.ts:95` (current file and one historical blob); values were not printed. `.env.local` is ignored and no `.env*` file is tracked.

Limitations: custom pattern/exact-value checking is not Gitleaks/entropy analysis; unknown old credentials, unsupported formats, secrets split across strings, archives, unreachable/dangling Git objects, remote-only branches, Git LFS objects, build caches, ignored reports, host credential stores, and deployed artifacts were not comprehensively scanned. No provider was contacted to validate a credential. Existing artifact coverage does not prove what a future build will contain.

### Server/client, content, navigation, and state

- `/icn` calls `MivvuIcnBrowsePage` → fixture loaders → pure catalog/view-model → client component. Both KO/EN snapshots are serialized as browse data. `fetchIcnFacilitiesPage` is used by the separate sync module/tests, not an app route. No application route handler, middleware/proxy route, custom Server Action, authentication, payment, or database path was found in `src`.
- Runtime environment access in application code is confined to the offline/sync API client and `NODE_ENV` in configuration. No `NEXT_PUBLIC_*` key, `next.config.env` embedding, or application analytics/beacon/WebSocket/service-worker integration was found. `scripts/sync-icn-facilities.mjs` uses `spawnSync` with a fixed executable/argument list; its live-test flag is why it was not run.
- The API destination is constant `https://apis.data.go.kr/B551177/FacilitiesInformation/getFacilitesInfo`; query values use `URLSearchParams`. It uses GET and a timeout. Redirect rejection, a response-byte cap, and a whole-sync page/time budget are absent. The standalone probe also lacks a timeout and can print raw upstream response/error content. These are future sync hardening concerns; no live requests were made.
- No `dangerouslySetInnerHTML`, HTML insertion sink, `eval`, `new Function`, or `document.write` was found in current `src`. ICN name/location/category/hours appear as React text children (`MivvuIcnFacilitiesBrowseScreen.tsx:210–232`). Search is in-memory string filtering. This is source inspection, not an active XSS test.
- Fixed preview redirects point to `/` and `/icn`; router destinations are constants/internal literals. No user-controlled `next`, return URL, or external redirect destination was found. The generic slash redirect in the build manifest is internal.
- The SFO airport acknowledgement guard is a **client preference gate**, not authorization. An attacker can forge its localStorage record; no protected server data is supposed to depend on it. Parsed airport/date and locale values are constrained; intro state is a session flag. Countdown/personalization state is React memory, not a credential store. No server authentication cookie was found in application code.
- SFO listing/evidence/map/construction anchors intentionally navigate externally. `noopener noreferrer` is present on inspected new-tab anchors; telephone links are filtered to digits/`+`. `validate-facilities.ts:79–80,397–409` constrains source URL schemes to HTTP(S); the offline audit is stricter about official domains. Static provenance/rights records also mention Wikimedia, Creative Commons, and Unsplash. These are **not authorized test targets**. CSP `connect-src 'self'` does not prohibit normal top-level navigation. Egress isolation must cover popups and redirects independently of CSP.
- `next/font/google` imports Inter/JetBrains Mono in `src/app/layout.tsx` and Plus Jakarta Sans in `MivvuEntryLayoutShell.tsx`. Font downloads can occur during build; generated fonts are served locally at runtime. Registry, font, base-image, browser, and model-weight downloads belong only to a separate, secret-free provisioning phase.
- Headers inspected in source and existing build: X-Frame-Options DENY, nosniff, strict-origin-when-cross-origin, restricted Permissions-Policy, CSP default/connect/frame/base/form restrictions. Actual serving headers, HSTS/TLS behavior, edge/CDN configuration, origin checks, and request limiting were not probed. No claim is made about Vercel's current deployment.

### Dependencies and advisory review

`package.json`, lockfile, and installed versions agree: Next **16.4.3**, React/React DOM **19.3.0**, Playwright **1.64.1**, Vitest **4.1.12**, jsdom **26.1.0**; lockfile has **549** package entries and sharp **0.35.5**. Lock entries with install scripts include `fsevents` and `unrs-resolver`; provisioning must review lifecycle needs rather than blindly enabling every script.

Official advisory pages were read as public documentation; no project source, lockfile, SBOM, secret, or report was uploaded. **`npm audit`, online OSV/SCA, cloud repository scanning, and scanner installation were not run** because they can transmit dependency metadata or were unavailable. This is not a full dependency-audit pass.

| Official source | Bounded conclusion |
| --- | --- |
| [Next image-optimization RCE, GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) | The advisory names Next 16.4.1 and sharp 0.35.5 as fixed thresholds; inspected versions meet them. No exploit was attempted. |
| [Next typed-array/use-cache RCE, GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) | Affected Next through 16.4.0; fixed 16.4.1. `cacheComponents` is enabled, but no custom `use cache` function was found. |
| [Next Server Action DoS, GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) | Affected through 16.4.0; fixed 16.4.1. No custom Server Action found. |
| [Next root-param cache leak](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3), [next/og RCE](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) | Their listed affected versions precede this Next version; no application `ImageResponse` path found. These checks do not cover every transitive dependency. |
| [React RSC RCE, GHSA-xqc2-xf4c-x3h3](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3), [RSC DoS, GHSA-h3gv-c5rc-p453](https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453) | Track SEC-04's vendored-package qualification. A root `react` version comparison is insufficient. |

## Active-tool selection and cost

**Preferred candidate: Shannon v3.5.0**, Git tag resolved by the public GitHub tree API to **`33dc203b32ef45bca15cc68b5a6c8931d5752236`**. [Release](https://github.com/KeygraphHQ/shannon/releases/tag/v3.5.0), [pinned README](https://github.com/KeygraphHQ/shannon/blob/v3.5.0/README.md). This is a reproducible evaluation pin, not authorization to install or launch it. Worker/base images must additionally be pinned by digest; no image digest was verified here.

| Criterion | Shannon | Strix |
| --- | --- | --- |
| Next.js fit | Source-aware browser/CLI testing of web apps; relevant to text input, navigation, and SSR boundaries. Limited additional value for this mostly static app without auth/APIs. | General autonomous penetration testing, browser/proxy/terminal capabilities, broader toolkit than needed here. |
| Runtime | Docker worker, local orchestration/Temporal; Node 18+ for CLI, pnpm for source builds. | Evaluated **v1.7.0**; Python >=3.12, Docker sandbox and model access. |
| Model | BYOK, local/self-hosted model configuration, custom base URL; a suitable model/runtime was not verified. | Model-provider API access; actual account access and balance unverified. |
| Boundary | Stock launcher/network is unsuitable; a hardened worker/controller integration would be needed. | Docker backend explicitly adds NET_ADMIN/NET_RAW and host-gateway; particularly poor match for an attacker that must not alter its own network boundary. |

Sources: [Shannon development](https://github.com/KeygraphHQ/shannon/blob/main/docs/development.md), [pinned providers](https://github.com/KeygraphHQ/shannon/blob/v3.5.0/docs/ai-providers.md), [Strix v1.7.0 runtime](https://github.com/usestrix/strix/blob/v1.7.0/strix/runtime/docker_client.py), [Strix Python/runtime dependencies](https://github.com/usestrix/strix/blob/v1.7.0/pyproject.toml).

Shannon's pipeline launches multiple analysis/exploitation agents and can delegate work; it is not a single passive scanner. Its fixed vulnerability classes and prompt rules are not a process/concurrency or network enforcement layer. No tool agents or Codex subagents were launched. [Configuration](https://github.com/KeygraphHQ/shannon/blob/main/docs/configuration.md), [pinned safety guidance](https://github.com/KeygraphHQ/shannon/blob/v3.5.0/docs/safety.md).

Observed current `main` launcher code uses `shannon-net`, host-gateway/hosts forwarding, writable workspace overlays, and container-wide `seccomp=unconfined`; its Compose stack publishes local Temporal ports. These facts require rechecking at the pinned commit: pinned README/providers/safety and the tag commit were accessible, but attempts to retrieve the pinned launcher/config/development files failed. Current-main source is **not** asserted to be identical to the pin. No documented setting was verified that enforces all required restrictions. [Launcher source](https://github.com/KeygraphHQ/shannon/blob/main/apps/cli/src/docker.ts), [Compose](https://github.com/KeygraphHQ/shannon/blob/main/docker-compose.yml), [networking guidance](https://github.com/KeygraphHQ/shannon/blob/main/docs/platforms.md).

Consequently, **do not run the stock `npx ... start` or `./shannon start` commands** for this setup. Do not patch/relax the boundary to make them work. Remain with read-only review or the bounded deterministic preflight below until a separately reviewed worker/controller adapter exists.

No ChatGPT/Cursor subscription was assumed to include API credits, and no host model-auth files were read or reused. Shannon documents optional subscription integration; it is deliberately excluded here because mounting real authentication into the attack worker violates the proposed separation. Remote source/prompt transmission also needs explicit human approval beyond this task.

Presence-only inspection found none of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `LLM_API_KEY`, `SHANNON_AI_API_KEY`, `XAI_API_KEY`, or `AWS_BEARER_TOKEN_BEDROCK` set in the review process environment. This does not establish account eligibility or absence of credentials elsewhere; no credential values were displayed or provider calls made.

Cost assumption for this preparation and the deterministic fallback: **$0 in model API usage**. A future Shannon run has no reliable dollar estimate without the chosen model, context volume, pricing, and concurrency. Its docs describe roughly 1–1.5 hours for a full run, not a cost guarantee. The proposed initial ceiling is **30 minutes, one model request in flight, 100 model calls, and a human-approved hard budget** (example $5, not permission to spend). No native hard dollar/concurrency flag was verified; do not invent one. A trusted controller must reserve worst-case input/output cost before each call, reject unknown pricing/retries/oversized requests, and fail closed before crossing the approved cap. Provider dashboard budgets alone are not accepted as instantaneous enforcement. A local model avoids API charges but still needs memory/runtime limits and a demonstrated tool-use capability.

## Proposed isolation and execution preparation — NOT EXECUTED

This appendix is a runbook attached to the existing queue, not a new task authorization. It prepares **only an isolated deterministic browser/boundary preflight**, not a Shannon scan. The app behavior and fixtures remain unchanged; the wrapper is test infrastructure. All commands below are future instructions, not commands run during this review.

### Trust boundary and required prerequisites

Use a **disposable Linux VM** with Docker Engine, iproute2, util-linux/nsenter, nftables, systemd, Python, and a preloaded matching Playwright browser. No host directory shares, SSH-agent forwarding, clipboard credential transfer, host credentials, real `.env.local`, browser profiles/cookies, or Docker socket inside any container. macOS Docker Desktop does not make the host-side Linux `nsenter` recipe directly usable; provision a disposable Linux VM first. The VM's administrative shell is trusted; app/browser processes are not.

After provisioning, **disconnect all VM virtual NICs in the hypervisor**. Record the hypervisor state and confirm only `lo` remains UP in the guest before creating veth pairs. Merely deleting a default route or setting Docker `internal: true` is insufficient. Docker service must be enabled before detaching; no pull/build/install/download is allowed during preflight/testing. No container is privileged, uses host networking/IPC/PID, receives added capabilities, or mounts the working repository.

```text
browser + subprocess container          trusted HTTP gate                  isolated Next app
172.30.10.20/32 -- veth -- 172.30.10.10/32:3113
                                       172.30.11.1/32 -- veth -- 172.30.11.2/32:3113
```

Only **`http://172.30.10.10:3113`** is a target authority. The gate forwards to one fixed app socket. The two links terminate wholly in private container network namespaces; there is no host bridge, gateway, DNS server, default route, or forwarding path. Guest-admin-installed nftables policies apply to **both** app and browser containers and also constrain the gate. Processes run without NET_ADMIN/NET_RAW and cannot replace those policies. IPv6, UDP, other ports, loopback HTTP, internet, host/LAN/private destinations other than the two explicit lab peers, and metadata/link-local destinations are denied.

The HTTP gate is outside the browser's control and enforces exact Host, fixed upstream, methods, response size, concurrency, rate, total request count, timeouts, and redirect destination. Browser interception adds popup/navigation/download/service-worker checks; it is not the primary network boundary. A compromised app is still unable to contact any new destination.

For **future remote LLM use**, keep the worker without a model-network interface. A trusted controller outside the testing namespaces must accept bounded requests through a narrow broker (e.g. a dedicated Unix socket), validate schema/model/token/call/cost limits, and connect only to one fixed TLS provider path. It must not implement arbitrary HTTP, CONNECT, URL fetching, provider-host overrides, web search, downloads, or remote execution. Credentials exist only in that controller; the worker gets no real key or provider cookie. The model receives only separately approved sanitized material. The pinned Shannon worker/broker integration and controller have **not** been implemented or verified, so **Shannon remains blocked**. Do not add general worker internet access to reach a model.

### A. Export the dirty application and provision separately

Future export on the workstation, from this exact reviewed checkout. This deliberately copies current files, including untracked route additions, rather than exporting HEAD and losing the integration. Stop if the fingerprints above differ. Inspect the export for secrets before transfer.

```bash
export MIVVU_EXPORT="$(mktemp -d /tmp/mivvu-export.XXXXXX)"
python3 - <<'PY'
import os, pathlib, shutil, hashlib, json
src = pathlib.Path('/Users/wonjonghun/Desktop/GateWise')
dst = pathlib.Path(os.environ['MIVVU_EXPORT'])
roots = ['src', 'public', 'package.json', 'package-lock.json',
         'next.config.ts', 'tsconfig.json', 'next-env.d.ts']
manifest = {}
for name in roots:
    root = src / name
    for p in (root.rglob('*') if root.is_dir() else [root]):
        if p.is_symlink(): raise SystemExit('Stop: symlink in export')
        if not p.is_file(): continue
        rel = p.relative_to(src)
        if any(x.startswith('.') for x in rel.parts):
            raise SystemExit('Stop: unexpected hidden export path')
        q = dst / rel
        q.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(p, q)
        manifest[str(rel)] = hashlib.sha256(q.read_bytes()).hexdigest()
(dst / 'source-manifest.json').write_text(json.dumps(manifest, sort_keys=True, indent=2))
print('Exported allowlisted files:', len(manifest))
PY
```

Transfer the inspected export to the disposable VM as `/opt/mivvu-preflight/source` using an offline disk, then detach that disk. Materialize the following gate/verification files under `/opt/mivvu-preflight/infra`. No `.git`, `.env*`, `.next`, `node_modules`, `.vercel`, personal home, or workstation build is copied. Use existing saved fixture JSON and synthetic browser state only.

The following provisioning Dockerfile belongs at `/opt/mivvu-preflight/Dockerfile`. Downloads are restricted to this preflight provisioning phase, with no app or model credentials in the VM. Review lifecycle requirements first. If `npm ci --ignore-scripts` cannot produce a working build, stop and review the exact failing dependency; do not rerun arbitrary scripts wholesale.

```dockerfile
ARG NODE_BASE
FROM ${NODE_BASE} AS build
WORKDIR /work
COPY source/package.json source/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY source/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM ${NODE_BASE} AS app
WORKDIR /work
COPY --from=build /work /work
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
USER 1000:1000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3113"]

FROM ${NODE_BASE} AS gate
WORKDIR /work
COPY infra/gate.mjs ./gate.mjs
USER 1000:1000
CMD ["node", "gate.mjs"]

FROM build AS browser
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright
RUN node_modules/.bin/playwright install --with-deps chromium
COPY infra/verify.mjs infra/socket-check.mjs /work/infra/
USER 1000:1000
CMD ["sleep", "infinity"]
```

Provisioning commands, **not executed**:

```bash
cd /opt/mivvu-preflight
docker pull node:24.17.0-bookworm-slim
MIVVU_NODE_BASE=$(docker image inspect node:24.17.0-bookworm-slim --format '{{index .RepoDigests 0}}')
test -n "$MIVVU_NODE_BASE"
docker build --build-arg NODE_BASE="$MIVVU_NODE_BASE" --target app -t mivvu-preflight-app .
docker build --build-arg NODE_BASE="$MIVVU_NODE_BASE" --target gate -t mivvu-preflight-gate .
docker build --build-arg NODE_BASE="$MIVVU_NODE_BASE" --target browser -t mivvu-preflight-browser .
docker image inspect mivvu-preflight-app mivvu-preflight-gate mivvu-preflight-browser > image-lock.json
```

Record image IDs/digests, package lock and infra file hashes, source manifest, runtime/platform versions, and an offline recheck for real credential values. Local tags are only provisioning labels: subsequent commands resolve and use immutable local image IDs. No digest is fabricated in this report. Confirm the built browser package is 1.64.1 and that matching browser binaries are present. Then disconnect VM NICs; do not restore connectivity during a failed test.

### B. Trusted gate (`infra/gate.mjs`)

This intentionally narrow wrapper supports GET/HEAD browser verification only. It is not a transparent protocol/exploit scanner and cannot test POST/Server Actions, WebSocket, request-smuggling, or transport-level behavior. Those require another reviewed harness.

```javascript
import http from 'node:http';
const authority = '172.30.10.10:3113';
const origin = `http://${authority}`;
let count = 0, active = 0, lastStart = 0;
const started = Date.now();
const report = (event) => console.log(JSON.stringify({ event, count, active }));
const deny = (res, event, code = 403) => {
  report(event); res.writeHead(code, { Connection: 'close' }); res.end();
};
const hop = new Set(['connection', 'keep-alive', 'proxy-authenticate',
  'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']);
const cleanHeaders = (headers) => {
  const strip = new Set([...hop,
    ...String(headers.connection || '').toLowerCase().split(',').map(x => x.trim())]);
  return Object.fromEntries(Object.entries(headers).filter(([k]) => !strip.has(k)));
};
const server = http.createServer((req, res) => {
  count++;
  if (count > 500 || Date.now() - started > 600_000)
    return deny(res, 'budget_exceeded', 429);
  if (req.headers.host !== authority || !['GET', 'HEAD'].includes(req.method)
      || !req.url.startsWith('/') || req.url.startsWith('//')
      || req.headers['transfer-encoding'] || Number(req.headers['content-length'] || 0) !== 0)
    return deny(res, 'boundary_violation');
  const u = new URL(req.url, origin);
  if (u.origin !== origin || u.username || u.password)
    return deny(res, 'boundary_violation');
  if (active >= 2) return deny(res, 'concurrency_exceeded', 429);
  active++;
  let finished = false;
  const finish = () => { if (!finished) { finished = true; active--; } };
  res.once('close', finish);
  // Queue at most two requests; globally start at most two per second.
  const now = Date.now(), wait = Math.max(0, lastStart + 500 - now);
  lastStart = now + wait;
  setTimeout(() => {
    if (res.destroyed) return finish();
    const headers = cleanHeaders(req.headers);
    delete headers['forwarded']; delete headers['x-forwarded-host'];
    delete headers['x-forwarded-proto']; delete headers['x-forwarded-for'];
    headers.host = authority;
    const upstream = http.request({ hostname: '172.30.11.2', port: 3113,
      method: req.method, path: u.pathname + u.search, headers, agent: false }, response => {
      const chunks = []; let bytes = 0;
      response.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > 8 * 1024 * 1024) {
          response.destroy(); deny(res, 'response_limit', 502); return;
        }
        chunks.push(chunk);
      });
      response.once('error', () => { if (!res.writableEnded) deny(res, 'upstream_error', 502); });
      response.once('end', () => {
        if (res.writableEnded) return;
        const out = cleanHeaders(response.headers);
        if (out.location) {
          let dest;
          try { dest = new URL(out.location, origin); } catch {}
          if (!dest || dest.origin !== origin || dest.username || dest.password)
            return deny(res, 'redirect_escape', 502);
        }
        res.writeHead(response.statusCode || 502, out);
        res.end(Buffer.concat(chunks));
        report('forwarded');
      });
    });
    upstream.setTimeout(10_000, () => upstream.destroy());
    upstream.once('error', () => { if (!res.writableEnded) deny(res, 'upstream_error', 502); });
    res.once('close', () => upstream.destroy());
    upstream.end();
  }, wait);
});
server.on('connect', (req, socket) => { report('connect_denied'); socket.destroy(); });
server.on('upgrade', (req, socket) => { report('upgrade_denied'); socket.destroy(); });
server.on('clientError', (error, socket) => { report('parser_reject'); socket.destroy(); });
server.requestTimeout = 15_000; server.headersTimeout = 5_000;
server.maxHeadersCount = 64; server.maxConnections = 4;
server.listen(3113, '172.30.10.10');
setTimeout(() => { report('deadline'); server.closeAllConnections(); server.close(); }, 600_000);
```

The gate logs event names/counts, not request URLs/bodies/cookies. Its 500-request limit includes rejected requests. An external watchdog must stop the entire lab on unexpected gate events. A process exit is an incomplete preflight, never a pass. Validate this wrapper independently before using it as an enforcement component.

### C. Container and network setup (`setup.sh`, Linux VM admin)

Run only after separate authorization and VM NIC disconnection. No tests/agents start with this setup: processes initially sleep. Default-drop rules are installed **before** either veth link is raised.

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /opt/mivvu-preflight
test "$(id -u)" = 0
test -z "$(ip -o link show up | awk -F': ' '$2 !~ /^lo$/ {print $2}')"
MIVVU_APP_IMAGE=$(docker image inspect mivvu-preflight-app --format '{{.Id}}')
MIVVU_GATE_IMAGE=$(docker image inspect mivvu-preflight-gate --format '{{.Id}}')
MIVVU_BROWSER_IMAGE=$(docker image inspect mivvu-preflight-browser --format '{{.Id}}')
common=(--detach --pull never --network none --read-only --cap-drop ALL
  --security-opt no-new-privileges --user 1000:1000 --init --restart no
  --log-driver json-file --log-opt max-size=2m --log-opt max-file=2
  --tmpfs /tmp:rw,nosuid,nodev,size=128m,uid=1000,gid=1000)
docker run "${common[@]}" --name mivvu-pf-app --memory 768m --cpus 1 --pids-limit 128 \
  --tmpfs /work/.next/cache:rw,nosuid,nodev,size=32m,uid=1000,gid=1000 \
  "$MIVVU_APP_IMAGE" sleep infinity
docker run "${common[@]}" --name mivvu-pf-gate --memory 192m --cpus .5 --pids-limit 64 \
  "$MIVVU_GATE_IMAGE" sleep infinity
docker run "${common[@]}" --name mivvu-pf-browser --memory 1536m --cpus 1 --pids-limit 256 \
  --shm-size 256m "$MIVVU_BROWSER_IMAGE" sleep infinity
MIVVU_APP_PID=$(docker inspect -f '{{.State.Pid}}' mivvu-pf-app)
MIVVU_GATE_PID=$(docker inspect -f '{{.State.Pid}}' mivvu-pf-gate)
MIVVU_BROWSER_PID=$(docker inspect -f '{{.State.Pid}}' mivvu-pf-browser)
for pid in "$MIVVU_APP_PID" "$MIVVU_GATE_PID" "$MIVVU_BROWSER_PID"; do
  nsenter -t "$pid" -n nft -f - <<'NFT'
table inet boundary {
  chain input { type filter hook input priority 0; policy drop; }
  chain output { type filter hook output priority 0; policy drop; }
  chain forward { type filter hook forward priority 0; policy drop; }
}
NFT
done
nsenter -t "$MIVVU_BROWSER_PID" -n nft add rule inet boundary output \
  ip daddr 172.30.10.10 tcp dport 3113 ct state new,established counter accept
nsenter -t "$MIVVU_BROWSER_PID" -n nft add rule inet boundary input \
  ip saddr 172.30.10.10 tcp sport 3113 ct state established counter accept
nsenter -t "$MIVVU_GATE_PID" -n nft add rule inet boundary input \
  ip saddr 172.30.10.20 tcp dport 3113 ct state new,established counter accept
nsenter -t "$MIVVU_GATE_PID" -n nft add rule inet boundary output \
  ip daddr 172.30.10.20 tcp sport 3113 ct state established counter accept
nsenter -t "$MIVVU_GATE_PID" -n nft add rule inet boundary output \
  ip daddr 172.30.11.2 tcp dport 3113 ct state new,established counter accept
nsenter -t "$MIVVU_GATE_PID" -n nft add rule inet boundary input \
  ip saddr 172.30.11.2 tcp sport 3113 ct state established counter accept
nsenter -t "$MIVVU_APP_PID" -n nft add rule inet boundary input \
  ip saddr 172.30.11.1 tcp dport 3113 ct state new,established counter accept
nsenter -t "$MIVVU_APP_PID" -n nft add rule inet boundary output \
  ip daddr 172.30.11.1 tcp sport 3113 ct state established counter accept
for pid in "$MIVVU_APP_PID" "$MIVVU_GATE_PID" "$MIVVU_BROWSER_PID"; do
  nsenter -t "$pid" -n nft add rule inet boundary output counter log prefix 'MIVVU_DENY ' drop
  nsenter -t "$pid" -n nft add rule inet boundary input counter drop
done
link_pair() {
  local left_name=$1 left_pid=$2 left_ip=$3 right_name=$4 right_pid=$5 right_ip=$6
  ip link add "$left_name" type veth peer name "$right_name"
  ip link set "$left_name" netns "$left_pid"
  ip link set "$right_name" netns "$right_pid"
  nsenter -t "$left_pid" -n ip link set "$left_name" addrgenmode none
  nsenter -t "$right_pid" -n ip link set "$right_name" addrgenmode none
  nsenter -t "$left_pid" -n ip addr add "$left_ip/32" dev "$left_name"
  nsenter -t "$right_pid" -n ip addr add "$right_ip/32" dev "$right_name"
  nsenter -t "$left_pid" -n ip route add "$right_ip/32" dev "$left_name"
  nsenter -t "$right_pid" -n ip route add "$left_ip/32" dev "$right_name"
  nsenter -t "$left_pid" -n ip link set "$left_name" up
  nsenter -t "$right_pid" -n ip link set "$right_name" up
}
link_pair pf-w "$MIVVU_BROWSER_PID" 172.30.10.20 pf-gw "$MIVVU_GATE_PID" 172.30.10.10
link_pair pf-ga "$MIVVU_GATE_PID" 172.30.11.1 pf-a "$MIVVU_APP_PID" 172.30.11.2
systemd-run --unit=mivvu-pf-stop --on-active=600s \
  /usr/bin/docker kill mivvu-pf-browser mivvu-pf-gate mivvu-pf-app
docker exec -d mivvu-pf-app node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3113
docker exec -d mivvu-pf-gate node /work/gate.mjs
```

Before execution, verify Docker's absolute path is `/usr/bin/docker` or replace it with the independently verified path. If any setup step fails, kill/remove the three specifically named containers; do not continue with partial rules. Verify the systemd timer is active before starting application/gate processes. Retain default seccomp, private IPC/PID, and all dropped capabilities. No `--privileged`, `--network host`, `--ipc host`, `SYS_ADMIN`, Docker socket, host gateway, extra hosts, writable repository bind, or `seccomp=unconfined` workaround is permitted. If Chromium will not run under these settings, stop.

### D. Non-destructive boundary checks and minimal inputs

`infra/socket-check.mjs` runs inside **both** the browser and app containers. These destinations are synthetic/reserved addresses or unroutable destinations inside the already disconnected lab. No real airport, provider, GitHub, Vercel, or third-party production hostname is resolved or contacted.

```javascript
import net from 'node:net';
import assert from 'node:assert/strict';
const targets = [
  ['127.0.0.1', 3113], ['::1', 3113],
  ['172.30.10.10', 3114], ['172.30.11.2', 3114],
  ['10.0.0.1', 80], ['192.168.0.1', 80],
  ['169.254.169.254', 80], ['203.0.113.7', 80], ['2001:db8::7', 80],
];
for (const [host, port] of targets) {
  const connected = await new Promise(resolve => {
    const socket = net.connect({ host, port });
    let done = false;
    const end = result => { if (!done) { done = true; socket.destroy(); resolve(result); } };
    socket.once('connect', () => end(true));
    socket.once('error', () => end(false));
    socket.setTimeout(1000, () => end(false));
  });
  assert.equal(connected, false, `Forbidden socket reachable: ${host}:${port}`);
}
console.log('Forbidden TCP destinations blocked');
```

Expected failures alone are insufficient: inspect routes, firewall policy/drop counters and container isolation alongside the positive app check. Also run the same socket checker from a child Node process to cover subprocess inheritance. The app image does not contain infra, so use stdin there; no source mount is needed. Record and inspect IPv4/IPv6 routes, interfaces, and nft rules in all three namespaces. Confirm absence of default routes/DNS/interface to host. Prove a wrong port on the existing peer increases the output-drop counter. Reserved external ranges should have no route, so no packet can leave the VM. UDP/DNS/IPv6 are denied by the default policy; inspect both families rather than assuming an IPv4-only rule covers them.

`infra/verify.mjs`, using the already-installed 1.64.1 Playwright package:

```javascript
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin = 'http://172.30.10.10:3113';
const browser = await chromium.launch({ headless: true, chromiumSandbox: true });
const result = { requests: 0, expectedNavigationBlocks: 0, unexpected: [] };
try {
  const context = await browser.newContext({ locale: 'en-US', serviceWorkers: 'block',
    acceptDownloads: false, viewport: { width: 390, height: 844 } });
  context.on('page', page => page.on('download', download => download.cancel()));
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      if (url.hostname === '203.0.113.7') result.expectedNavigationBlocks++;
      else result.unexpected.push('non-target-navigation');
      return route.abort('blockedbyclient');
    }
    if (++result.requests > 200) {
      result.unexpected.push('browser-request-budget');
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  await context.addInitScript(() => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('mivvu.preview.locale.v1', 'en');
    sessionStorage.setItem('mivvu.entry.introSeen.v1', '1');
  });
  const page = await context.newPage();
  for (const path of ['/', '/icn', '/preview/mivvu-entry', '/preview/mivvu-entry/icn']) {
    const response = await page.goto(origin + path);
    assert.ok(response && response.status() === 200);
    assert.equal(new URL(page.url()).origin, origin);
  }
  await page.getByRole('searchbox').fill('SYNTHETIC_NO_MATCH_428');
  await context.addInitScript(() => {
    localStorage.setItem('gatewise.airport-selection.v1', JSON.stringify({
      airportIata: 'SFO', acknowledgedAt: '2026-10-27' }));
  });
  for (const path of ['/explore', '/flight', '/recommendations', '/plan']) {
    await page.goto(origin + path);
    assert.equal(new URL(page.url()).origin, origin);
  }
  // Intercept a synthetic local path to simulate an external redirect without changing the app.
  await context.route(origin + '/__boundary__/redirect', route => route.fulfill({
    status: 302, headers: { location: 'http://203.0.113.7/' }, body: '' }));
  await page.goto(origin + '/__boundary__/redirect').catch(() => {});
  assert.ok(result.expectedNavigationBlocks >= 1);
  const popup = await context.newPage();
  await popup.goto('http://203.0.113.7/').catch(() => {});
  assert.ok(result.expectedNavigationBlocks >= 2);
  assert.deepEqual(result.unexpected, []);
} finally {
  await browser.close();
  fs.writeFileSync('/tmp/preflight-browser.json', JSON.stringify(result, null, 2));
}
```

This verifies constrained navigation, not XSS/exploitation. Input is a synthetic no-match string and one synthetic airport acknowledgement. Extend to KO, malformed locale/airport state, and a literal HTML-looking search string **only in the later isolated assignment**; define text-only expectations first. No account, real traveler data, flight feed, or saved user state is needed. Preserve ICN unknown-time/data-limit labels and SFO recommendation semantics.

Future preflight commands, after a readiness wait capped at 30 seconds:

```bash
cd /opt/mivvu-preflight
mkdir -p reports
docker inspect mivvu-pf-app mivvu-pf-gate mivvu-pf-browser > reports/containers.json
systemctl is-active mivvu-pf-stop.timer
for name in mivvu-pf-app mivvu-pf-gate mivvu-pf-browser; do
  pid=$(docker inspect -f '{{.State.Pid}}' "$name")
  nsenter -t "$pid" -n ip -j address > "reports/$name-address.json"
  nsenter -t "$pid" -n ip -j route > "reports/$name-route4.json"
  nsenter -t "$pid" -n ip -6 -j route > "reports/$name-route6.json"
  nsenter -t "$pid" -n nft -j list ruleset > "reports/$name-nft-before.json"
done
docker exec -i mivvu-pf-app node --input-type=module < infra/socket-check.mjs
docker exec -i mivvu-pf-browser node --input-type=module < infra/socket-check.mjs
docker exec mivvu-pf-browser node -e \
  "require('node:child_process').execFileSync(process.execPath,['/work/infra/socket-check.mjs'],{stdio:'inherit'})"
docker exec mivvu-pf-browser node /work/infra/verify.mjs
docker cp mivvu-pf-browser:/tmp/preflight-browser.json reports/preflight-browser.json
```

The readiness check should use one fixed target GET from the browser namespace, at most once per second and 30 attempts, before browser verification. A connection error/timeout must fail preflight, not be ignored. The future operator must implement and independently check the readiness wait, watchdog/event monitor, report collection on failure, and gate unit tests before treating this appendix as an executable approved harness; those components were not silently claimed implemented here.

For the trusted gate itself, unit-check exact authority parsing, absolute-form/CONNECT/Upgrade rejection, both IPv4/IPv6 external Location rejection, 500-request cap, two-request concurrency, 2/s starts, oversized/truncated responses, idle timeouts, and kill-on-failure against a **synthetic upstream in the disconnected VM**. Do not send 501 validation requests to the real app; use a synthetic responder. The browser's synthetic redirect above checks interception, not the gate's upstream redirect validator. Mark these as distinct tests.

### E. Stop, evidence, and cleanup

Stop all three named containers immediately for unexpected gate events, out-of-scope destinations, any real secret value in artifacts, unexpected listening interfaces/default routes, policy mutation, OOM/PID limits, 200 browser requests/500 gate requests, invalid report evidence, or a 600-second deadline. Expected negative boundary probes are labeled preflight-only; establish fresh counter baselines afterward. A later agentic trial must monitor all denied traffic and stop on its first unexpected attempt, even when blocked. Never silently retry with more access.

An independent guest-admin watchdog is required, outside all test containers. It must watch gate error events and namespace drop-counter changes, enforce the deadline even if CLI/agents hang or fork, and collect failure evidence. The provided systemd kill timer is a hard deadline backstop; stopping only a CLI or calling Shannon's normal stop command is insufficient. Manual emergency stop:

```bash
docker kill mivvu-pf-browser mivvu-pf-gate mivvu-pf-app
```

Before removing containers, collect bounded app/gate logs, browser result JSON, before/after route/nft counters, container exit/OOM/PID state, image/source/infra hashes, hypervisor NIC-disconnect evidence, test expectations and outcomes, and a statement of incomplete/skipped checks. `docker exec -d` child output is not guaranteed to appear in `docker logs`; a reviewed wrapper must capture app/gate child output to bounded `/tmp` files and copy it on both success and failure. Do not claim event monitoring from `docker logs` until this is implemented. No uploaded report, CI artifact, or cloud scanner is part of this assignment.

After evidence collection and redaction, cleanup only these resources:

```bash
docker rm -f mivvu-pf-browser mivvu-pf-gate mivvu-pf-app
systemctl stop mivvu-pf-stop.timer
```

Container network namespaces/veth peers disappear with their processes. Confirm no lab process/interface/container remains; do not run global Docker prune or remove unrelated resources. Export only redacted reports through an offline disk after tests stop, then destroy the VM. Do not reconnect a compromised test VM to the internet to upload results.

## Actual verification log and remaining gates

| Check actually run | Result |
| --- | --- |
| Branch/HEAD/status, current diff and untracked source review | PASS: baseline above; existing integration preserved |
| Local secret checker (`python3 /tmp/mivvu-secret-review.py`) | COMPLETED: 344 current files, 703 historical blobs, 455 non-cache build files; zero known-value matches; synthetic authenticated-URL test classified |
| Current-tree literal credential assignment check | Zero candidates for the bounded pattern; not a full secret-scanner pass |
| Existing compiled headers/manifests and static source review | COMPLETED; no fresh build or HTTP-header claim |
| Installed safe tests, exact command below | **PASS: 9 files / 97 tests**; Vite emitted a future native-config-loader compatibility warning |
| Offline transpile/VM reproduction of SEC-01 with injected fetch and synthetic marker | CONFIRMED: marker propagated; **zero network calls** |
| `git diff --check` on pre-existing working tree | **FAIL**: existing Markdown hard-break trailing spaces at `docs/design/mivvu-first-entry-handoff.md:3–5`; left untouched |
| Official public documentation/advisory lookups | COMPLETED with the pinned-file retrieval limitations stated above; shell public-document GETs also encountered DNS failures; no private upload |
| Report verification | PASS: local Markdown links resolve; Bash/JavaScript blocks and embedded export Python parse; no trailing spaces in this report; all 344 inherited file hashes and the inherited Git diff hash unchanged |
| Isolation recipe runtime, Docker build, firewall checks, browser recipe, gate enforcement tests | **NOT RUN**; required Linux/containers absent, authorization limited to preparation |
| Full dependency/secret scanner, fresh app build, full suite/E2E, deployment smoke, live API, Shannon/Strix/model run | **NOT RUN** |

Exact existing-unit-test command actually executed (no npx/install; clean inherited environment; live sync flags disabled):

```bash
env -i PATH="$PATH" ICN_SYNC=0 ICN_INVESTIGATE=0 NEXT_TELEMETRY_DISABLED=1 \
  node_modules/.bin/vitest run \
  src/lib/airport-selection-preference.test.ts src/lib/mivvu-preview-locale.test.ts \
  src/lib/mivvu-entry-routes.test.ts src/lib/app-routes.test.ts \
  src/lib/audit-facility-data.test.ts \
  src/lib/icn-facilities/icn-facilities-client.test.ts \
  src/lib/icn-facilities/parse-api-response.test.ts \
  src/lib/icn-facilities/parse-api-items.test.ts \
  src/lib/icn-facilities/normalize-icn-facility.test.ts
```

The preparation is complete as a review/report; **execution readiness is blocked**. Missing gates are an isolated Linux VM, reviewed/materialized/tested wrappers and failure monitoring, immutable image/browser inventory, pinned Shannon launcher verification/hardened integration, and (only if agentic testing is later chosen) approved model access, sanitized-data disclosure approval, controller/proxy and hard cost/concurrency limits. Do not interpret the pseudonymous/synthetic inputs or the code blocks as an authorization to run.

## GATEWISE STATUS — Codex

```text
Task ID / objective: GW-ICN-005 supplemental Mivvu security preflight; read-only review + preparation
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assignment, attached task in Codex chat, 2026-10-27 America/New_York); preparation only
Work progress: complete
Review / acceptance: pending (human owner)
Integration / release: n/a
Files changed: docs/security/mivvu-preflight-review.md only
Behavior delivered / verified data sources: review report; actual dirty baseline, local code/history/build artifacts, official public tool/advisory documentation; no application behavior change
Tests and commands actually run: 97 targeted tests PASS; synthetic offline error propagation CONFIRMED; bounded local secret checks completed; pre-existing git diff --check FAIL; active/isolation tests NOT RUN
Git branch / commit / push state: feat/mivvu-first-entry-slice @ 518534a89acd24917e5b9a55aef87e746ce51a92; inherited dirty integration preserved; report uncommitted; no commit/push/merge/deploy by this task
Dependencies needed from other owner: human review; disposable VM/runtime and reviewed isolation wrappers; release advisory provenance review
Blockers, known limitations, integration risks: isolation/prerequisites unverified; stock agentic launcher unsuitable; full SCA/secret-scanner/deployment coverage unavailable; SEC-01 conditional error disclosure and SEC-04 advisory provenance gap
Handoff / report location: docs/security/mivvu-preflight-review.md
Recommended next task (proposal only): separately authorize materializing and independently verifying the offline deterministic boundary preflight, without Shannon/model/airport traffic
Decision needed from human owner: accept/revise this preparation and assign that bounded infrastructure validation; active testing and release remain unauthorized
```

## GATEWISE STATUS — Codex, SEC-01 follow-up (2026-10-28)

```text
Task ID / objective: GW-ICN-005 / SEC-01; prevent credential-bearing ICN client errors
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assignment in Codex chat, 2026-10-28 America/New_York); local SEC-01 fix/tests/report only
Work progress: complete
Review / acceptance: pending (human owner)
Integration / release: n/a
Files changed: src/lib/icn-facilities/icn-facilities-client.ts; src/lib/icn-facilities/icn-facilities-client.test.ts; docs/security/mivvu-preflight-review.md
Behavior delivered / verified data sources: controlled client error codes/messages; discarded upstream diagnostics; synthetic mocked-fetch/body regression coverage; success handling and sync integrity preserved
Tests and commands actually run: TDD RED 21 failed / 2 passed; GREEN 23 passed; focused suite 40 passed; npm run lint PASS; tsc --noEmit --incremental false PASS; scoped diff whitespace check PASS
Git branch / commit / push state: feat/mivvu-first-entry-slice @ 518534a89acd24917e5b9a55aef87e746ce51a92; inherited uncommitted work preserved; this fix uncommitted; no commit/push/merge/deploy
Dependencies needed from other owner: human owner integration review
Blockers, known limitations, integration risks: no local-fix blocker; standalone probe/direct-parser diagnostics outside this fix; other findings and active-test prerequisites unchanged; no full-suite/build/release claim
Handoff / report location: docs/security/mivvu-preflight-review.md, SEC-01 local remediation
Recommended next task (proposal only): human owner review of these three local file changes
Decision needed from human owner: accept/revise SEC-01; no installation/infrastructure/scan/release authorization implied
```

## Dependency-only assessment — 2026-10-28

**Outcome: completed official npm registry audits; zero reported vulnerabilities in both the all-dependency and production-filtered reports.** This is a known-advisory lookup result, not a security guarantee or evidence of application exploitability. No dependency remediation is indicated by these audit results. The earlier statements that `npm audit` was not run describe the original preflight; this separately authorized assessment supersedes those statements only for the checks recorded here.

**Authority/baseline:** Direct human assignment in Codex chat on 2026-10-28 (America/New_York), **GW-ICN-005 supplemental dependency assessment**, **GW-PLAN-REV-2026-10-26**. Read `AGENTS.md`, `PLAN.md`, the existing implementation queue, and this report. Branch/HEAD remains `feat/mivvu-first-entry-slice` @ `518534a89acd24917e5b9a55aef87e746ce51a92`. All inherited uncommitted integration work and the SEC-01 client/test changes were preserved. This assignment permits read-only dependency auditing and this report append, not installation, upgrades, removal, lockfile rewrites, application fixes, active testing, infrastructure, or release actions.

### Registry, disclosure, and actual commands

Before any audit request, `npm config get registry` returned **`https://registry.npmjs.org/`**, without userinfo or query parameters. Project `.npmrc`, `/Users/wonjonghun/.npmrc`, and `/usr/local/etc/npmrc` were absent. All lockfile `resolved` HTTP(S) addresses used `registry.npmjs.org`, without credentials/query parameters; no linked/non-registry package entries were found. npm was the already-installed **11.13.0** at `/usr/local/bin/npm`.

The human explicitly authorized sending dependency metadata to the official registry. npm's bulk audit sends package names and versions; its documented fallback can send the dependency tree and npm/Node/platform metadata. Source code, environment files, and credential values were not submitted. Requests used a process environment containing only PATH, separate empty user/global config files, an explicit official registry, disabled lifecycle scripts, and a cache under `/tmp`. No third-party upload/scanning service was substituted. [Official npm audit behavior](https://docs.npmjs.com/cli/v11/commands/npm-audit/).

Execution history distinguishes failed attempts from completed scans:

| Attempt | Actual outcome |
| --- | --- |
| Initial audit with both `--userconfig=/dev/null` and `--globalconfig=/dev/null` | Exit **1**, before configuration completed; npm rejected double-loading the same config path. Empty stdout, no audit result. |
| Corrected audit with distinct empty config files, restricted executor | Exit **1**; `getaddrinfo ENOTFOUND registry.npmjs.org` for `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`. JSON contained an endpoint error, not vulnerability results. |
| Same corrected all-dependency audit with permitted network access | Exit **0**; valid audit report, empty stderr, **0** reported vulnerabilities. |
| Production-filtered audit with permitted network access | Exit **0**; valid audit report, empty stderr, **0** reported vulnerabilities. |

The config failure was corrected without touching personal/repository configuration. The restricted-executor DNS failure was resolved by running the already authorized request with network access; it was not treated as a clean scan. Actual successful commands, run from `/Users/wonjonghun/Desktop/GateWise`:

```bash
env -i PATH="$PATH" /usr/local/bin/npm audit --json \
  --registry=https://registry.npmjs.org/ \
  --include=dev --include=optional --include=peer \
  --ignore-scripts --fund=false --update-notifier=false \
  --userconfig=/tmp/mivvu-dependency-audit-znb7zrw6/user.npmrc \
  --globalconfig=/tmp/mivvu-dependency-audit-znb7zrw6/global.npmrc \
  --cache=/tmp/mivvu-dependency-audit-znb7zrw6/cache \
  --fetch-retries=0 --fetch-timeout=20000 \
  > /tmp/mivvu-dependency-audit-znb7zrw6/audit-all-network.json \
  2> /tmp/mivvu-dependency-audit-znb7zrw6/audit-all-network.stderr

env -i PATH="$PATH" /usr/local/bin/npm audit --json \
  --registry=https://registry.npmjs.org/ --omit=dev \
  --ignore-scripts --fund=false --update-notifier=false \
  --userconfig=/tmp/mivvu-dependency-audit-znb7zrw6/user.npmrc \
  --globalconfig=/tmp/mivvu-dependency-audit-znb7zrw6/global.npmrc \
  --cache=/tmp/mivvu-dependency-audit-znb7zrw6/cache \
  --fetch-retries=0 --fetch-timeout=20000 \
  > /tmp/mivvu-dependency-audit-znb7zrw6/audit-prod-network.json \
  2> /tmp/mivvu-dependency-audit-znb7zrw6/audit-prod-network.stderr
```

Both reports returned the following complete, identical JSON (SHA-256 **`99fde2b0967ea76926a1a4ea974f62d494bb506ba7b3fa2e7e22e19c240aab5a`** for each original output file):

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {},
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 0,
      "high": 0,
      "critical": 0,
      "total": 0
    },
    "dependencies": {
      "prod": 20,
      "dev": 491,
      "optional": 115,
      "peer": 0,
      "peerOptional": 0,
      "total": 548
    }
  }
}
```

The dependency metadata describes the full tree, including in the `--omit=dev` output; it is not a count of vulnerabilities or proof that all those entries were submitted in the production-filtered payload. Optional/dev classifications overlap, so do not sum these categories. Lockfile version is 3, with 549 entries including the root; 548 are package entries. Raw temporary logs/caches are supplementary local evidence, not additional repository deliverables; the commands/result/hash are retained here.

### Production versus development paths

Installed and locked versions agreed for the packages below. No package/advisory entry was returned under `vulnerabilities`; therefore there is no audit-confirmed vulnerable installed version, affected path, or proposed npm fix to enumerate. This does not establish that every installed package or bundled file is safe.

| Dependency path | Installed/locked versions | Audit interpretation |
| --- | --- | --- |
| Root production: `next`, `react`, `react-dom` | Next **16.4.3**; React/React DOM **19.3.0** | Covered by both runs; zero reported findings. Next's vendored RSC needs separate qualification below. |
| Production optional: `next` → `sharp` | **0.35.5** | Optional/native/platform-sensitive path; do not treat it as dev-only. Zero reported findings. |
| Root development: `vitest` → `vite` | **4.1.12** → **8.3.5** | Included by the all-dependency run; zero reported findings. |
| Root development: `jsdom` | **26.1.0** | Included by the all-dependency run; zero reported findings. |
| Root development: `eslint`, `eslint-config-next` | **9.39.5**, **16.4.3** | Included by the all-dependency run; zero reported findings. |
| Dual reachability: root dev `@playwright/test`, also `next` → optional peer `@playwright/test` → `playwright` → `playwright-core` | All **1.64.1** | Declared for development, but the lock/installed graph also reaches it from production Next. Do not promise that `--omit=dev` removes it. Zero reported findings. |

The Playwright distinction was verified with the installed Next `peerDependencies`/`peerDependenciesMeta` and a local, offline `npm explain @playwright/test --json --offline` using the same empty configs/cache. It reported a root `dev` edge and a Next **`peerOptional`** edge (`^1.51.1`), with `dev: false`, `devOptional: true` on the installed node. Offline explain exited **0** and made no registry request. This is graph classification, not evidence that the deployed app launches a browser. Across all lock entries, 491 carry `dev: true` and 57 do not; these flags likewise do not establish deployed reachability.

### Official advisory checks and bundled RSC

The following are **advisory severities and affected ranges**, not newly confirmed Mivvu vulnerabilities. Official Next/React advisory indexes, advisory pages, release notes, and pinned Next tag metadata were reviewed without submitting project content.

| Official advisory | Affected package/range and available fix | Assessment of this checkout |
| --- | --- | --- |
| [Next typed-array/use-cache RCE — critical](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) | `next >=16.0.0 <=16.4.0`; fixed **16.4.1** | Installed **16.4.3** is outside the published affected range. This downstream advisory, not root React's number, is the version evidence. |
| [Next Server Action DoS — high](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) | `next >=13.0.0 <=15.5.27` or `>=16.0.0 <=16.4.0`; fixed **15.5.28 / 16.4.1** | Installed **16.4.3** is outside the published affected ranges. No exploit/DoS request was run. |
| [Next image-optimization RCE — critical](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) | Listed Next 15.x affected through **15.5.27**, 16.x through **16.4.0**; fixed **15.5.28 / 16.4.1**, sharp **>=0.35.5** | Next **16.4.3** and sharp **0.35.5** meet the cited fix thresholds; deployment/platform exploitability was not tested. |
| [Next root-param cache leak — moderate](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3) | Listed affected **16.3.0**; fixed **16.3.8** | Next **16.4.3** is outside the listed affected version. |
| [React RSC RCE — critical](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3), [React Server Functions DoS — high](https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453) | `react-server-dom-webpack`, `react-server-dom-turbopack`, `react-server-dom-parcel`; affected stable lines **19.0.0–19.0.8**, **19.1.0–19.1.9**, **19.2.0–19.2.8**, **19.3.0** in the advisory package tables; fixes **19.0.9 / 19.1.10 / 19.2.9 / 19.3.1** | No standalone `react-server-dom-*` package is in the lockfile. Root `react@19.3.0` is not one of those package identities. Next's built-in RSC code is considered using downstream evidence and its actual vendored metadata, not equated to root React. |

The [Next v16.4.1 release](https://github.com/vercel/next.js/releases/tag/v16.4.1) explicitly lists the typed-array RCE, image-optimization RCE, and Server Action DoS security fixes. The [v16.4.3 release](https://github.com/vercel/next.js/releases/tag/v16.4.3) is the installed release line and records subsequent backports. This supports the bounded published-version assessment above; it is not a proof of arbitrary bundled-code safety.

Actual local `node_modules/next/dist/compiled/react-server-dom-{turbopack,webpack}/package.json` files have built-in package names, no standalone `version`, and peer labels **`19.3.0-canary-278794d7-20261002`**. Those same peer labels appear in the official pinned **v16.4.3** tag's [Turbopack metadata](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/compiled/react-server-dom-turbopack/package.json) and [webpack metadata](https://github.com/vercel/next.js/blob/v16.4.3/packages/next/src/compiled/react-server-dom-webpack/package.json). Thus an older-looking embedded label is consistent with the official release metadata; it does not by itself prove vulnerability or patch completeness. No byte-for-byte comparison of every installed vendored JS file with the published package, signature/provenance audit, or independent exploitability verification was performed.

Additional official image-SSRF/Draft Mode cache advisory pages were consulted; some displayed unresolved **`16.3.?`** range/fix placeholders. No exact patch version was invented from those placeholders, and those fields were not used as proof of a fixed artifact. The usable published thresholds above and the completed official registry results remain separately stated evidence.

**SEC-04 update by appendix:** The previously unrun registry-audit portion is now complete, and Next's downstream fixed-release evidence plus official vendored metadata were checked. Residual bundled-byte/provenance and application exploitability questions remain unverified. There is still no basis here to declare this app exploitable from root React's version, or universally secure from a zero-advisory report.

### Smallest recommendation and limits

**No dependency install/upgrade/removal is recommended solely on these zero-finding audit results.** Retain the current manifests/lockfile and the SEC-01 fix for owner review. If release acceptance requires stronger closure of SEC-04, the smallest further check is read-only comparison of the installed vendored RSC artifact against the official fixed Next release; it is not a speculative root-React upgrade or an active scan. No such additional task is automatically authorized by acceptance of this report.

This assessment did not run `npm audit fix`, install/update/remove/prune commands, signature audit, application tests, lint/type checks, build/E2E, airport APIs, active penetration tests, VM setup, or Git/release mutations. Registry queries/public advisory lookups do not test runtime exploitability. Audit database coverage, optional/platform-specific packages, bundled implementation code, unknown vulnerabilities, and actual deployment provenance remain limits. The earlier active-testing prerequisite verdict and other security findings are unchanged.

Preservation evidence: the report is the only repository file changed by this assessment; the other 344 captured tracked/nonignored-untracked file hashes match, including the SEC-01 source/tests. `package.json` SHA-256 remains **`46536734bfadec006e9f0fba73ee0d2890a65d6ef2dabd732390ceea2c556de8`**; `package-lock.json` remains **`4a7f0d2aacc6522a5fe29510c7be25d755feeda395d1ad3a3dbe7e072049db0b`**. Prior report content is retained byte-for-byte as a prefix; only this dated assessment is appended. Report link/whitespace/consistency checks are used for completion, without rerunning unrelated application tests.

## GATEWISE STATUS — Codex, dependency assessment (2026-10-28)

```text
Task ID / objective: GW-ICN-005 supplemental dependency-only assessment
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assignment in Codex chat, 2026-10-28 America/New_York); read-only dependency audit and existing report append only
Work progress: complete
Review / acceptance: pending (human owner)
Integration / release: n/a
Files changed: docs/security/mivvu-preflight-review.md, append only
Behavior delivered / verified data sources: official npm registry all/prod audits; installed/locked dependency paths; official Next/React advisories, releases, and vendored metadata; SEC-01/integration preserved
Tests and commands actually run: npm config get registry PASS; initial config/DNS attempts failed without scan conclusions; network-enabled npm audit --json PASS (0); npm audit --json --omit=dev PASS (0); offline npm explain PASS; report/preservation checks PASS; application tests NOT RUN
Git branch / commit / push state: feat/mivvu-first-entry-slice @ 518534a89acd24917e5b9a55aef87e746ce51a92; inherited uncommitted work preserved; report uncommitted; no commit/push/merge/deploy
Dependencies needed from other owner: human owner review; no dependency change indicated by current registry results
Blockers, known limitations, integration risks: no audit-execution blocker remains; audit is known-advisory/version evidence, not exploitability or full vendored-artifact provenance verification; active-test prerequisites unchanged
Handoff / report location: docs/security/mivvu-preflight-review.md, Dependency-only assessment — 2026-10-28
Recommended next task (proposal only): review this assessment; read-only vendored-artifact comparison only if required for release acceptance
Decision needed from human owner: accept/revise the dependency assessment; no installation/infrastructure/scan/release authorization implied
```

## SEC-03 server-only boundary enforcement — 2026-10-28

**Outcome: fixed locally; human owner review pending.** Direct human assignment in Codex chat authorized **GW-ICN-005 / SEC-03** only, under **GW-PLAN-REV-2026-10-26**: inspect imports, enforce the server boundary, verify legitimate/forbidden imports, run focused tests/type checking/lint/clean build, and update this report. Branch/HEAD remains `feat/mivvu-first-entry-slice` @ `518534a89acd24917e5b9a55aef87e746ce51a92`. No commit, push, merge, deployment, live airport request, or additional security remediation was authorized or performed.

### Import graph and available mechanism

A TypeScript-AST import/export/dynamic-import/require traversal covered **221 source and script files** under `src` and `scripts`, resolving local aliases and distinguishing type-only edges. Incoming runtime paths to the credential client were:

- `icn-facilities-client.test.ts` → client.
- `investigate-sync-mismatch.test.ts` → client (live investigation remains opt-in).
- `sync-icn-facilities.ts` → client; `sync-icn-facilities.test.ts` and `sync-cli.test.ts` reach the client through that sync module.
- `scripts/sync-icn-facilities.mjs` has an execution edge, rather than a static import: it spawns `npx vitest run src/lib/icn-facilities/sync-cli.test.ts` with `ICN_SYNC=1`.

No current application Client Component, application route, or shared barrel/re-export was found to import the credential client. The app's ICN route instead uses `MivvuIcnBrowsePage` → fixture loaders/catalog → client presentation. The client's local dependencies are a type-only ICN type import, constants, and the pure response parser (which uses the pure item parser). Normalization, fixtures, shared types, and pure parsers do not import the credential-bearing client at runtime. The standalone `scripts/icn-facilities-probe.mjs` is a separate Node probe; it does not import this client and was not run or modified.

There is no separately installed bare `server-only` package. Installed Next **16.4.3** already provides its compiler handling, type declarations, and `next/dist/compiled/server-only/{index,empty}.js`. Its installed compiler aliases/invalid-import rules were inspected. The [official Next.js guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning) confirms that installing a separate marker package is optional because Next handles these imports internally. **No new dependency was necessary; no package/lockfile changes or installations were made.**

### Minimal implementation and test-only handling

- Added **`import "server-only";`** at the credential client's module boundary. All runtime exports are now protected in Next's client graph; an erased `import type` can still reference its declarations.
- Added a **`test.alias`** entry in `vitest.config.ts` that resolves only the marker to the already-installed Next empty server export. Node Vitest and the existing Vitest-based sync CLI do not run Next's RSC compiler, so they need this server-context interpretation. This is confined to the test runner configuration: `next.config.ts`, application resolver behavior, and global Node/React conditions were not changed. The actual Next build, independently of Vitest, proves the forbidden client import is rejected. [Vitest test-alias guidance](https://vitest.dev/guide/mocking/modules#mocking-non-existing-module).
- No parser, normalizer, type definition, fixture, sync algorithm, CLI implementation, CSP, UI, or SEC-01 error-handling logic was changed. Removing the single new marker import from the current client reproduces its exact pre-task bytes, preserving SEC-01 sanitization. Its regression test file is also byte-for-byte unchanged.

### Real build checks, including before/after control

Build verification used a temporary exact application-source copy at **`/tmp/mivvu-sec03-c7vfzqw9/app`**, including the inherited uncommitted routes. Existing installed `node_modules` were copied using filesystem clones, not installed. No `.env*`, workstation build output, or real credential was copied. Build commands used a clean process environment and disabled Next telemetry. Source/public/config/package bytes were compared with the working tree. Each clean build began with that copy's `.next` removed; the working repository's existing `.next` and server artifacts were preserved.

The temporary forbidden probe was an App Router page containing:

```tsx
"use client";
import { fetchIcnFacilitiesPage } from "@/lib/icn-facilities/icn-facilities-client";
export default function Sec03BoundaryProbe() {
  return <p>{typeof fetchIcnFacilitiesPage}</p>;
}
```

It references the function without calling it; no API request is involved. The verification sequence was:

| Check | Actual result |
| --- | --- |
| Initial restricted-executor control build | Failed only because the existing Google Fonts downloads were unavailable. This was not counted as evidence of boundary enforcement. |
| Before guard, same client-import probe with permitted font-download access | **Exit 0**, production build and prerender succeeded. This established the missing boundary before the implementation. |
| After guard, same probe, actual default Turbopack production build | **Exit 1 for the intended reason:** `'server-only' cannot be imported from a Client Component module`, at the credential client marker. Import traces identified both Client Component Browser and SSR paths through `sec03-boundary-probe/page.tsx`. No module-not-found result was substituted for this check. |
| Legitimate server import | Temporary Server Component imported/called the protected client using a synthetic key and a mocked `fetchImpl` returning one synthetic record. Build **exit 0**; prerendered HTML contained the expected server-success sentinel. |
| Pure browser imports | Temporary Client Component used the unchanged parser, normalizer, fixture loader, and a type-only `FetchIcnFacilitiesPageOptions` import from the guarded module. Build **exit 0**; prerendered HTML contained its pure-client success sentinel. |
| Final clean build | All temporary pages removed, `.next` removed in the copy, and `npm run build` **exit 0**. The route manifest had only the original canonical/preview/SFO routes and no SEC-03 probe. |

The first positive server probe compiled but failed its own TypeScript check because a raw API field has type `unknown`; only that temporary probe's rendering was corrected to `String(...)`, then the positive build passed. Product types and behavior were not changed to accommodate the probe. Font-download access was needed only for the app's pre-existing Inter, JetBrains Mono, and Plus Jakarta Sans build inputs; no airport API was called.

All build invocations used the following actual command, with the probe state and separate log files described above, from the temporary application directory:

```bash
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run build
```

The failing client probe and both positive probe pages were removed before the final build. Their diagnostic/source evidence remains only under the temporary verification directory, not in the product tree. No probe route is shipped or left in the repository.

### CLI, focused tests, lint, and type verification

The actual existing launcher `node scripts/sync-icn-facilities.mjs` was exercised in the same sanitized application copy with no API key. A verification-only Node preload rejected/count-recorded every global fetch attempt; npx was set offline with a temporary cache, so it could use the copied installed Vitest without installation. The guarded client and sync CLI module loaded successfully, then the client deliberately stopped at its existing **`MISSING_SERVICE_KEY`** error (expected exit **1**). **Fetch attempts: 0.** All copied fixture hashes remained unchanged. This is import/configuration smoke evidence, not a successful live sync or a claim that missing credentials should pass.

Equivalent actual CLI smoke invocation (the preload exists only outside the repository):

```bash
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 \
  NODE_OPTIONS=--require=/tmp/mivvu-sec03-c7vfzqw9/deny-cli-network.cjs \
  npm_config_offline=true npm_config_yes=false \
  npm_config_cache=/tmp/mivvu-sec03-c7vfzqw9/npm-cache \
  node scripts/sync-icn-facilities.mjs
```

The following commands were actually run in `/Users/wonjonghun/Desktop/GateWise`:

```bash
env -i PATH="$PATH" ICN_SYNC=0 ICN_INVESTIGATE=0 NEXT_TELEMETRY_DISABLED=1 \
  node_modules/.bin/vitest run src/lib/icn-facilities src/components/mivvu
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run lint
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 \
  node_modules/.bin/tsc --noEmit --incremental false
git diff --check -- src/lib/icn-facilities/icn-facilities-client.ts vitest.config.ts
```

Results: **67 tests passed; 2 opt-in live sync/investigation tests skipped** (15 passed test files, 2 skipped). The 23 SEC-01 sanitization tests and existing sync integrity tests passed. Both opt-in modules were loaded without marker-resolution errors; their live bodies were not executed. Lint, type checking, and scoped source whitespace checks each exited **0**. Vitest's existing native-config-loader warning remains unchanged.

### Preservation, scope, and limits

Exactly three repository files changed for SEC-03: the client marker, test-scoped Vitest configuration, and this report. The other **342** captured tracked/nonignored-untracked file hashes match the task-start baseline. Original package/lockfile, fixtures, pure helpers, UI, Next/CSP config, and SEC-01 tests remain unchanged; SEC-01 implementation bytes are identical after excluding the inserted marker. No reset, stash, branch switch, or Git/release mutation was performed. The pre-existing handoff Markdown whitespace issue was left untouched.

The build evidence covers the installed Next **16.4.3 default Turbopack build** of the exact current application source without real environment files; it is not a deployment or live-server freshness check. The existing Vitest-based CLI import path and mock sync behavior were verified, not a new standalone raw-Node runner or live airport sync. No full application E2E, physical-device check, active security scan, VM setup, or broad security re-audit was performed or required. Test aliases alone are not security evidence; the independent negative and positive application builds are the boundary evidence. Review/acceptance and production authorization remain separate.

## GATEWISE STATUS — Codex, SEC-03 (2026-10-28)

```text
Task ID / objective: GW-ICN-005 / SEC-03; enforce the ICN credential-client server-only boundary
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assignment in Codex chat, 2026-10-28 America/New_York); bounded local SEC-03 fix and verification only
Work progress: complete
Review / acceptance: pending (human owner)
Integration / release: n/a
Files changed: src/lib/icn-facilities/icn-facilities-client.ts; vitest.config.ts; docs/security/mivvu-preflight-review.md
Behavior delivered / verified data sources: standard server-only compiler marker; test-scoped Node/CLI marker interpretation; actual Next client rejection and server/pure-client success; no new dependencies
Tests and commands actually run: before-guard client build accepted; after-guard client build rejected for server-only; positive server/pure-client build PASS; CLI import smoke expected MISSING_SERVICE_KEY with 0 fetch attempts; 67 tests PASS / 2 live tests SKIPPED; lint PASS; tsc PASS; clean final build PASS; scoped whitespace/preservation checks PASS
Git branch / commit / push state: feat/mivvu-first-entry-slice @ 518534a89acd24917e5b9a55aef87e746ce51a92; inherited changes preserved; local uncommitted only; no commit/push/merge/deploy
Dependencies needed from other owner: human owner integration review; no dependency-install blocker
Blockers, known limitations, integration risks: no local-fix blocker; build verified in sanitized exact-source copy with existing dependencies and font access; live sync/deployment/E2E not tested; test alias is not a global application bypass
Handoff / report location: docs/security/mivvu-preflight-review.md, SEC-03 server-only boundary enforcement — 2026-10-28
Recommended next task (proposal only): human owner review of the three local file changes and boundary evidence
Decision needed from human owner: accept/revise SEC-03; no installation/infrastructure/scan/release authorization implied
```

## SEC-02 bounded CSP assessment — 2026-10-28

**Authorization and baseline:** Direct human assignment in Codex chat, **2026-10-28 America/New_York**, for **GW-ICN-005 / SEC-02**, plan revision **GW-PLAN-REV-2026-10-26**. Read the current agent instructions, product plan, GW-ICN-005 queue row, and this report. Branch/HEAD remain `feat/mivvu-first-entry-slice` @ `518534a89acd24917e5b9a55aef87e746ce51a92`. This slice permits a bounded compatible CSP fix and relevant verification only. Human owner review remains pending. The inherited integration and SEC-01/SEC-03 work were preserved; no other finding was reassessed or changed.

### Actual policy and the two different inline allowances

Ordinary HTTPS GETs to the public [Vercel homepage](https://gate-wise-iota.vercel.app/) and [/icn](https://gate-wise-iota.vercel.app/icn) returned the following **enforced `Content-Security-Policy` response header**, rather than just a configuration or Report-Only policy:

```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

The homepage returned **HTTP 200**, server `Vercel`, response date **2026-10-28 11:40:10 GMT**; `/icn` returned **HTTP 404**, also from Vercel with the same policy, at **11:45:26 GMT**. These observations establish the deployed header and that the deployed `/icn` did not serve the local ICN page. They do **not** establish the deployment's Git SHA or prove that the uncommitted Mivvu integration is deployed. No deployment was made; the public policy still lacks the new local directive.

| Directive | Confirmed use and reason to retain this allowance in this slice |
| --- | --- |
| `script-src 'self' 'unsafe-inline'` | The exact-source local production HTML has nonce-free inline Next bootstrap/RSC script blocks, including `self.__next_f.push(...)`: 10 on `/`, 13 on `/icn`, and 11 each on the four SFO routes inspected. There is no configured nonce/hash mechanism. Removing the allowance would block these executable inline blocks and jeopardize hydration. This allowance covers script execution; it is the more direct XSS defense gap. |
| `style-src 'self' 'unsafe-inline'` | Mivvu intro/wordmark and SFO components use React style props; these runtime observations alone do not prove a CSP requirement, since direct CSSOM property assignment can be allowed. The decisive compatibility evidence is Next's generated `_not-found.html` and `_global-error.html`: both contain an inline `<style>` block and HTML `style` attributes. A browser-only control that removed this allowance on the existing 404 response produced five enforced inline-style violations, covering **`style-src-elem` and `style-src-attr`**. The unchanged final allowance preserves the fallback's styles. This allowance permits CSS, and is distinct from permission to run inline JavaScript. |

Application examples are `src/components/mivvu/MivvuWordmark.tsx:35–37`, `MivvuBrandIntroScreen.tsx:62–66`, and `src/components/TimeBudgetTimeline.tsx:44`. Fonts are a separate issue: Next/font downloads existing Google Font inputs at **build time** and emits self-hosted assets. The browser loaded those assets from the loopback origin under `font-src 'self' data:`; an external Google Fonts runtime allowance was not needed or added.

The stylesheet control changed only a disposable browser's response headers, not repository or deployed configuration. Its expected CSP errors were recorded separately from the ordinary application checks. MDN documents the distinction between style blocks/attributes and direct [CSSOM style property assignment](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src).

### Narrow change and architectural limit

Only the following directive and its explanatory comment were added to `next.config.ts`:

```text
script-src-attr 'none'
```

This overrides the permissive script fallback specifically for HTML event-handler attributes such as `onclick`. It leaves the required inline Next script blocks and existing style policy intact. Source/emitted-HTML inspection and the browser checks found no application HTML event-handler attributes; ordinary React events continued to work. [MDN's directive documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src-attr) describes that scope and the use of ordinary event listeners. No `unsafe-eval` was added: production still omits it, and the pre-existing development-only branch was not changed.

The app uses Next **16.4.3**, default Turbopack, `cacheComponents: true`, `partialPrefetching: true`, static prerendered routes, and Next configuration headers. No in-tree Vercel override, proxy, or middleware supplies a nonce. A per-request nonce design would affect those rendering/cache assumptions; Next's [CSP rendering guidance](https://nextjs.org/docs/app/guides/content-security-policy) documents its dynamic-rendering requirement and conflict with a prerendered static shell. A separately validated hash/build/header pipeline could be investigated, but this slice does not establish coverage of every inline bootstrap/RSC response. Asset SRI alone was not treated as that proof. Eliminating inline styles would also require addressing existing framework fallback output. Those are separate scoped changes, so neither remaining `unsafe-inline` allowance was removed.

**Residual risk:** In supporting browsers, inline handler attributes are now blocked locally, but arbitrary inline `<script>` blocks and inline CSS remain permitted. Older browsers that ignore `script-src-attr` retain the prior fallback behavior. This slice did not identify or audit an injection sink and does not demonstrate an exploitable XSS issue. **CSP alone does not prevent XSS**; safe rendering and input/output handling remain necessary. SEC-02 is partially mitigated, not fully resolved.

### Actual verification and outcomes

No environment/credential files were copied or sourced. The existing installed dependencies were filesystem-cloned into a new disposable source copy at `/var/folders/5_/_gp16dtj2_gggzbk_p0szr6r0000gn/T/mivvu-sec02-1p5kk9_s/app`; no installation or lockfile operation occurred. All **249** current application/public/script/config/package input files compared byte-for-byte with the copy after the build. The repository's existing `.next` was not overwritten. The final clean build ID is **`mSW9RxWJdWEZgfM1wL8aY`**; its route/prerender output retains the original routes and static rendering, with no probe page.

The browser regression uses the installed Chromium **156.0.8078.4** in a fresh profile, a mobile viewport, no user cookies, blocked service workers, and an allowlist restricted to **`http://127.0.0.1:3127`**. It recorded **zero attempted external browser requests**, including airport APIs. The source-matching SEC-03 production copy provided the before-change control; the new clean copy provided the after-change server. Both were started with `next start`, not the development server.

| Check | Actual result |
| --- | --- |
| RED, before implementation | All eight ordinary browser checkpoints worked with zero application CSP/console/hydration errors. The final policy assertion **failed for the intended reason**: a temporary button's benign inline `onclick` set its own dataset, showing the missing restriction. An ordinary `addEventListener` also worked. |
| GREEN, fresh production build | The identical regression **passed**: the inline handler did not execute; exactly one intentional enforced **`script-src-attr`** violation was observed; the ordinary event listener still worked. The temporary button was removed. |
| Production response headers | Direct HTTP GETs to local `/`, `/icn`, `/explore`, `/flight`, `/recommendations`, and `/plan` all returned **200** and the enforced policy containing `script-src-attr 'none'`, both retained inline allowances, and no `unsafe-eval`. No inference from source configuration alone was used. |
| Mivvu/ICN/SFO browser compatibility | Eight checkpoints passed: styled/hydrated intro and dismissal; EN entry; KO entry switching; ICN EN browse with **1,011** fixtures; search and KO switching with preserved query; SFO Explore navigation; SFO Flight navigation; direct ICN load/hydration. Returning through Change airport and switching back to EN also worked. |
| Scripts, fonts, styles, hydration | **Zero unexpected CSP violations, application console errors, page errors, or failed resources** in the ordinary flow. Stylesheets and local font faces loaded at each checkpoint; six font responses succeeded; all observed script/font/stylesheet responses were below HTTP 400. The intentional handler probe and separate negative style control are excluded from the zero-unexpected count. |
| Existing 404 compatibility | Under the final unmodified response policy, the expected HTTP 404 remained styled, with its inline style block present and computed heading line-height **49px**. **Zero CSP violations**; no external requests. The earlier browser-only removal control confirmed the style allowance's purpose. |
| Build / lint / type verification | Fresh `npm run build` **exit 0**, including TypeScript and static prerendering; focused `eslint next.config.ts` **exit 0**; scoped source whitespace **exit 0**. No unrelated application unit/E2E suite or dependency audit was rerun. |

Commands actually run (temporary-script files and outputs are local verification evidence, not product additions):

```bash
# Actual public response reads; no authenticated request or airport API.
curl --silent --show-error --max-time 20 --proto '=https' \
  --dump-header /tmp/mivvu-sec02-deployed-headers.txt \
  --output /tmp/mivvu-sec02-deployed.html https://gate-wise-iota.vercel.app/
env -i PATH="$PATH" curl --disable --silent --show-error --max-time 20 --proto '=https' \
  --dump-header /tmp/mivvu-sec02-deployed-icn-headers.txt \
  --output /tmp/mivvu-sec02-deployed-icn.html https://gate-wise-iota.vercel.app/icn

# Same server command in the before/after source copies, run one at a time.
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 \
  npm run start -- --hostname 127.0.0.1 --port 3127

# Before: expected RED exit 1; style-removal control: expected diagnostic PASS exit 0.
env -i PATH="$PATH" node /tmp/mivvu-sec02-browser.cjs /tmp/mivvu-sec02-before-browser.json
env -i PATH="$PATH" node /tmp/mivvu-sec02-browser.cjs /tmp/mivvu-sec02-style-control.json --style-control

# From the new sanitized copy, with no previous .next: PASS exit 0.
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run build > /tmp/mivvu-sec02-build.log 2>&1

# After: GREEN exit 0, using that build's next start server.
env -i PATH="$PATH" node /tmp/mivvu-sec02-browser.cjs /tmp/mivvu-sec02-after-browser.json

# From the working repository: PASS exit 0.
env -i PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/eslint next.config.ts
git diff --check -- next.config.ts
```

The initial restricted public GET failed DNS resolution, and the initial restricted loopback start failed with `listen EPERM`; neither was counted as successful verification. The authorized network/listener/browser executions then completed successfully. Build network access was limited in purpose to the existing Google Font inputs; no new tool/dependency, credential validation, airport request, autonomous scanner, or active penetration test was run.

The same temporary browser script was used before and after (SHA-256 **`8b29be7ca95402d85ec3b84831f46b3a333ef984f5c788d0429e7bed08f6088d`**); JSON evidence paths appear in the commands above. A separate `env -i PATH="$PATH" node -` Playwright assertion produced `/tmp/mivvu-sec02-final-404.json` for the final fallback check. The checks cover installed Chromium and these local production flows; other browsers/devices and deployed Mivvu behavior were not verified. In particular, public `/icn` was 404, and this local policy change is **not deployed**. Public header inspection is not proof that the live service contains the local fixes.

Final preservation review: exactly **two** of the **345** captured tracked/nonignored-untracked file hashes changed: `next.config.ts` and this report. The other **343** match, including all SEC-01/SEC-03 implementation/tests/config, fixtures, package files, UI, and inherited integration changes. No such file was added or removed. The report change is limited to the SEC-02 table row and this appendix. Scoped code/report whitespace and report-link checks passed; the historical whole-tree whitespace issue at `docs/design/mivvu-first-entry-handoff.md:3–5` remains untouched, and the whole-tree check was not rerun for this slice. The temporary servers were stopped after verification.

## GATEWISE STATUS — Codex, SEC-02 (2026-10-28)

```text
Task ID / objective: GW-ICN-005 / SEC-02; bounded production CSP assessment and compatible tightening
Plan revision: GW-PLAN-REV-2026-10-26
Execution permission: authorized (direct human assignment in Codex chat, 2026-10-28 America/New_York); local SEC-02 assessment/fix only
Work progress: complete
Review / acceptance: pending (human owner)
Integration / release: n/a
Files changed: next.config.ts; docs/security/mivvu-preflight-review.md
Behavior delivered / verified data sources: actual public CSP inspected; script-src-attr 'none' added locally; script/style inline reasons distinguished; production Next response headers and fixture-only browser flows verified
Tests and commands actually run: before-change browser expected RED; final identical browser GREEN; negative style control PASS; final 404 compatibility PASS; six local production route headers PASS; clean production build with TypeScript PASS; focused ESLint PASS; scoped whitespace/report/preservation PASS; unrelated suites NOT RUN
Git branch / commit / push state: feat/mivvu-first-entry-slice @ 518534a89acd24917e5b9a55aef87e746ce51a92; existing changes preserved; local uncommitted only; no commit/push/merge/deploy
Dependencies needed from other owner: human owner review only; no dependency installation
Blockers, known limitations, integration risks: no local blocker; SEC-02 residual inline-script/style risk remains; Chromium/local production only; public /icn returned 404; new policy not deployed; CSP is not a complete XSS defense
Handoff / report location: docs/security/mivvu-preflight-review.md, SEC-02 bounded CSP assessment — 2026-10-28
Recommended next task (proposal only): human owner review of this narrow CSP diff and retained-allowance evidence
Decision needed from human owner: accept/revise SEC-02 slice; no broader architecture, scan, infrastructure, or release authorization implied
```
