# GW-ICN-012 — ICN facility reference contract and Cursor handoff

Plan revision: **GW-PLAN-REV-2026-10-28** (acceptance recorded under **`GW-PLAN-REV-2026-10-29`**). Local implementation; **human owner and Cursor integration review accepted** (2026-10-29). Source baseline `2e56a28c16ebd71eb202db7aa428db7ba9b50b78`. Accepted GW-ICN-011 inputs and execution authorization are recorded in the [checkpoint](../handoffs/GW-ICN-012-checkpoint.md). Publication via PR `chore/gw-icn-011-012-package` — not `main` merge or production.

## Exported interface and boundary

All exports live in [`icn-facility-reference.ts`](../../src/lib/icn-facilities/icn-facility-reference.ts). It imports only normalized types/constants and the existing pure snapshot matching helpers. No fixture loader, server-only dependency, browser API, storage, network, UI, or side effect is introduced. Tests use the existing server fixture loader only for offline regression evidence.

```ts
type IcnFacilityRef = {
  version: 1;
  contentFingerprint: string;
  pairedContentFingerprint?: string;
};
type IcnFacilityReferenceCatalogs = Readonly<
  Record<IcnFacilitiesLanguage, readonly IcnFacilityBrowseRecord[]>
>;
type IcnFacilityRefParseResult =
  | { status: "valid"; ref: IcnFacilityRef }
  | { status: "invalid_reference" }
  | { status: "unsupported_version"; version: number };
type IcnFacilityRefResolution =
  | { status: "found"; record: IcnFacilityBrowseRecord }
  | { status: "missing"; reason:
      "reference_content_not_found" | "locale_content_not_found" | "locale_not_captured" }
  | { status: "ambiguous"; reason: "bilingual_pairing" }
  | { status: "invalid_reference" }
  | { status: "unsupported_version"; version: number };

function createIcnFacilityRef(
  record: IcnFacilityBrowseRecord,
  catalogs: IcnFacilityReferenceCatalogs,
): IcnFacilityRef;
function serializeIcnFacilityRef(ref: IcnFacilityRef): string;
function parseIcnFacilityRef(input: unknown): IcnFacilityRefParseResult;
function resolveIcnFacilityRef(
  input: unknown,
  catalogs: IcnFacilityReferenceCatalogs,
  language: IcnFacilitiesLanguage,
): IcnFacilityRefResolution;
```

`IcnFacilitiesLanguage` is **K/E**, not the UI's ko/en. Future callers explicitly map the active locale. Catalogs are **complete normalized per-language records** (e.g. `fixture.facilities`); raw identical duplicates are allowed and collapsed internally by the existing rule. They must already satisfy the normalized record contract. An unavailable language uses an empty array. This API does not validate arbitrary airport API responses; those belong to the existing normalization/snapshot validation boundary.

Never pass `IcnBrowseListItem`, `IcnBrowseDisplayItem`, or a terminal/query/category-filtered subset. Those projections omit content fields needed to distinguish listings. Completeness is a caller precondition: the helper cannot detect a subset or provider-side omissions. “Complete catalog” means the entire supplied snapshot, **not** a claim of full airport coverage. Current fixtures retain `api_total_mismatch`.

Creation takes a normalized catalog member. It returns its exact content reference, capturing a counterpart only if complete collapsed catalogs permit the existing 1:1 match **and** the origin matches that member's content. Resolving also validates the reference. Serialization takes a valid typed ref; parse unknown saved/link values before using typed helpers.

## Fields, version and serialization

- `version: 1` freezes this wire contract. The parser rejects unexpected v1 envelope/content fields, missing fields, wrong field types, invalid airport/source/flag/language values, noncanonical fingerprints, and inconsistent captured pairs. Future positive safe-integer versions return `unsupported_version`; invalid/nonpositive/fractional versions return `invalid_reference`. No migration is implemented.
- `contentFingerprint` is exactly [`icnFacilityContentFingerprint`](../../src/lib/icn-facilities/icn-snapshot-matching.ts)'s **canonical JSON string**, not a short hash. It contains sourceId, airport, language, name, three category fields, terminal, floor, location, hours, A/D and duty-free flags, API operation and dataset. Only `listingIndex` is incidental. This exact encoding avoids digest collisions and shared synchronous hashing dependencies. Nulls and raw blank text remain distinct. No case-folding, trimming, translation or fuzzy matching is applied.
- `pairedContentFingerprint`, when present, captures the other language's exact content at creation. It must have the same sourceId and opposite language. This is necessary to prevent a later sourceId-only join from silently following replaced translation content. It is not a general registry or reconciliation framework.
- No listingIndex, retrieval timestamp, redundant sourceId/language/airport, save timestamp or facility/business ID is added. A future saved-item wrapper may own `savedAt`; it is not identity.
- `serializeIcnFacilityRef` emits JSON with fixed envelope field order. `parseIcnFacilityRef` accepts a JSON-compatible object or JSON string and returns a fresh validated envelope. It does not decode URI components. Fingerprint strings must retain exact canonical keys/order/escaping; manually reformatting the inner JSON invalidates them. Changing shared fingerprint field inventory/semantics requires explicit version review; do not silently rewrite v1 references.

Example (synthetic normalized rows, not airport facts):

```ts
const catalogs = { K: koreanFixture.facilities, E: englishFixture.facilities };
const ref = createIcnFacilityRef(selectedNormalizedRecord, catalogs);
// { version: 1, contentFingerprint: '{"sourceId":...,"airportIata":"ICN",...}',
//   pairedContentFingerprint?: '{"sourceId":...,"airportIata":"ICN",...}' }
const savedJSON = serializeIcnFacilityRef(ref);
const restored = parseIcnFacilityRef(savedJSON);
const result = resolveIcnFacilityRef(savedJSON, catalogs, "E");
if (result.status === "found") {
  // result.record is the current raw normalized EN record, not merged display text.
}
```

For a future link, URI-encode serialized JSON once at the transport boundary and use the framework's decoded value (or decode once if its transport requires it) before parsing. No route/path is established here. These references contain public listing content and are verbose, readable, and unsigned; they are **not authorization tokens**, private storage, or compact permanent slugs. The round-trip test covers Unicode and `/ % ? # &`/quotes/backslashes. Future route integration must check its actual URL transport and length constraints; no deployment URL limits were tested. A different compact representation would require an explicit contract/version decision.

## Resolution guarantees and outcomes

Every failure omits `record`. Consumers must branch on `status`, preserving failure instead of picking the first sourceId match, old index, translated title, or unrelated fallback facility.

| Situation | Outcome |
| --- | --- |
| Exact origin content in the full snapshot | `found`, current collapsed normalized record |
| Rows reordered / listingIndex reassigned only | `found`, same content at its current index |
| Identical duplicates | Existing collapse chooses earliest current listingIndex; duplicate count/order is not identity |
| Duplicate sourceId with different content | Same-language exact content resolves independently; no sourceId-only selection |
| Name/hours/location/categories/terminal/floor/flags/sourceId changed, or row removed | `missing / reference_content_not_found` |
| Old ordinal occupied by another listing | Still missing; ordinal is never consulted for identity |
| Locale switch, origin exact, captured counterpart exact, complete catalogs still 1:1 | `found` in requested language |
| More than one distinct collapsed record under the sourceId on either side of a locale switch | `ambiguous / bilingual_pairing` |
| Counterpart was absent/ambiguous at creation, later becomes unique | `missing / locale_not_captured`; explicit reselection/new ref is needed |
| Captured counterpart removed or its content changed | `missing / locale_content_not_found` |
| Origin changed/removed while captured counterpart still exists | `missing / reference_content_not_found`, including requests in counterpart language |
| Conflicting ref payload (e.g. same-language pair/different sourceId), malformed input | `invalid_reference` |
| Future positive integer version | `unsupported_version` with that version; no v1 interpretation |

Resolution checks invalid/version first, then origin exact match. Same-language requests return that record without requiring a bilingual match. Cross-language requests check ambiguity, captured counterpart presence, then exact counterpart match. An ambiguity therefore takes precedence over `locale_not_captured`; stale origins take precedence over bilingual diagnostics. Exact normalized duplicates cannot remain ambiguous under current collapse semantics. Distinct content is distinguishable because the fingerprint is the entire canonical content, not a lossy projection or collision-prone short digest.

Changed and removed content deliberately share a missing outcome. The current data cannot reliably distinguish those cases, real-world ID reuse with identical content, or whether two snapshots describe the same business. Even two captured language fingerprints are evidence of snapshot content, **not permanent real-world facility identity**. No cross-refresh migration, reconstruction from the surviving language, or new pairing of an old unpaired ref is promised.

## Cursor integration handoff

1. Review this module and its tests independently. Keep the full catalogs available at creation/resolution; construct refs from normalized records **before** lossy browse projection. For future browse links, add an explicitly reviewed association at that projection boundary rather than recreating a reference from `browse-{listingIndex}` or a display name. No association or UI wiring is implemented here.
2. A future server detail consumer can load both snapshots via existing server loaders and call the shared resolver. A client saved consumer can receive normalized records or a separately authorized projection that preserves all required content. This module itself must remain shared and pure; do not import a server fixture loader into it. Decide payload/caching/URL transport in that integration task.
3. Store/transport the whole serialized ref, including any captured counterpart. Locale toggles resolve the **same stored ref** with the active language. Do not rewrite its origin, replace it with a newly generated translation reference, or drop its paired fingerprint on toggle.
4. On success, apply the existing display rules separately. Missing EN name/location can use [`buildKoreanFallbackIndex` / `toBrowseDisplayItems`](../../src/lib/icn-facilities/icn-browse-display.ts), built from **full** collapsed catalogs; preserve raw fields and fallback labels. Resolution itself never borrows titles or merges records. Category/hours fallback rules are unchanged.
5. On failure, render the appropriate recoverable missing/ambiguous/unsupported state in the future detail/saved task. Do not change a save automatically; explicit selection can create a new ref. UI wording, persistence and routes remain outside 012.
6. Retain tests for changed origin and changed translation with reused IDs, both directions of ambiguity, filter-hidden conflicts and pre-toggle refs. Add integration tests at the actual future server/client boundaries and validate its link encoding, active locale, complete catalogs and error handling.

Consequential existing **Codex-owned** code from prior tasks includes GW-ICN-007 exact content/collapse/bilingual matching and GW-ICN-008 search/index/fallback integration, released through GW-ICN-009. This work reuses those helpers, so the new tests and regression results are **self-verification**, not independent approval of that earlier code or of this contract. Cursor is the named integration reviewer; human owner provides final acceptance.

## Supplementary goods/services descriptions (GW-ICN-015 enrichment addendum)

v1 facility references remain unchanged: `contentFingerprint` / optional `pairedContentFingerprint` still identify **core listing rows only**. Official `facilityitem`, `goods`, and `GOODS` text lives in a **separate companion artifact** bound to the same KO/EN core fixture pair. Companion refresh may change description text for an unchanged core fingerprint; v1 refs do **not** pin historical description copy. Bare observation fingerprints use the same canonical v1 **content** string rules as references (shared validator in [`icn-facility-content-fingerprint-validate.ts`](../../src/lib/icn-facilities/icn-facility-content-fingerprint-validate.ts)); they are not facility-reference envelopes. Detail association, locale/fallback presentation, and quality diagnostics are defined in [`icn-facility-goods-services-contract.md`](icn-facility-goods-services-contract.md). Shipped core fixtures without a reviewed companion behave as today — no goods/services block.

## Verification

[`icn-facility-reference.test.ts`](../../src/lib/icn-facilities/icn-facility-reference.test.ts) has 26 meaningful cases: frozen v1 wire shape independent of helper output; paired/unpaired JSON/URI round trips; explicit null/blank content; reordering/index reuse; changed fields; removal; duplicate sourceIds/identical copies; origin/target ambiguity; captured and uncaptured translations; changed origin/translation; raw EN fallback boundary; malformed/version cases; real fixture catalog resolution independent of empty filtered results. Synthetic expectations are semantic assertions, not regenerated output snapshots.

Fresh checks for this local implementation:

```text
npm test -- src/lib/icn-facilities/icn-facility-reference.test.ts src/lib/icn-facilities/icn-browse-view-model.test.ts src/lib/icn-facilities/icn-browse-display.test.ts src/lib/icn-facilities/icn-browse-catalog.fixture.test.ts src/lib/icn-facilities/icn-fixture-duplicate-sn.test.ts src/lib/icn-facilities/icn-snapshot-quality.test.ts src/lib/icn-facilities/icn-shipped-output.test.ts src/lib/icn-facilities/icn-search-fallback-integration.test.ts
  PASS: 8 files / 85 tests
./node_modules/.bin/tsc --noEmit --incremental false
  PASS
./node_modules/.bin/eslint src/lib/icn-facilities/icn-facility-reference.ts src/lib/icn-facilities/icn-facility-reference.test.ts
  PASS
```

The existing Vite config-loader future warning remains; no tool configuration change was made. Whitespace/link/preservation results and the final Git state are in the [checkpoint](../handoffs/GW-ICN-012-checkpoint.md). No application build/browser/live API/fixture refresh/Graphify/performance campaign/full audit was run; no production state inferred. The helper is not yet connected to a route or UI. Stop here for review; no next task or publishing authorized.
