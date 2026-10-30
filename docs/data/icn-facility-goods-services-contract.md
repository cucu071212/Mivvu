# ICN goods/services descriptions — companion contract

**Status:** Human owner accepted product behavior and authorized local implementation **2026-10-30** (GW-ICN-015-ENRICH-IMPL). Technical clarifications **REV1** / **REV2** and presentation/locale behavior **REV3** are incorporated below. Live acquisition, fixture replacement, publication, and release remain **not** authorized by this document alone.

| Item | Record |
| --- | --- |
| Task | **GW-ICN-015-ENRICH-CONTRACT** (original); **REV1** / **REV2** / **REV3** (Cursor); **GW-ICN-015-ENRICH-IMPL** (Cursor, local) |
| Plan revision | **GW-PLAN-REV-2026-10-29** |
| Author / future integration owner | Codex (original draft); Cursor (REV1–REV3; future integration owner) |
| Human product approval (REV3) | Labeled EN←KO fallback when E is safely `empty`; long-text expand/collapse; hide goods/services section when nothing displayable |
| Permission | Codex: direct human assignment — proposal only. Cursor: human reassignment — bounded proposal edits in this worktree only |
| Verified source | `feat/gw-icn-014-category` @ `2be6c13297f0ea0590d69743525de62a47b3920a` |
| Workspace | Reused `/private/tmp/GateWise-gw-icn-015-data`, branch `codex/gw-icn-015-data`; the pre-existing untracked research report is preserved |
| Remote check | GitHub `get_pr_info` freshly confirmed PR #10 open/unmerged, same head, base `feat/gw-icn-013-detail` @ `135712d8561518d36b4f89fc508fdf6981889b94` |

## 1. Recommendation and evidence boundary

**Keep the accepted v1 facility reference and core fixture contract unchanged. Add one optional, separately versioned goods/services companion snapshot, associated by the existing exact core-content fingerprint.** Preserve every incoming description field before duplicate collapse. If several source variants share that core fingerprint, retain them in the companion and withhold a row-specific description. A detail page can still resolve the core listing under v1; this proposal does not claim that v1 distinguishes those variants.

This approach preserves existing URLs and description variants while treating discarded fields as uncaptured in the shipped fixtures. It adds a bounded supplemental-data contract. The tradeoff is intentional: some core listings remain browsable while their goods/services explanation is unavailable or ambiguous.

**Human-approved direction (partial):** preserve useful official goods/services descriptions and show them in facility detail under the companion contract. **REV3 (human-approved):** labeled Korean-source fallback on English detail when English is safely empty; expand/collapse for long text; omit the goods/services block when nothing can be shown. Search expansion, new live services, relaxing the cross-locale gate, partial adoption from rejected companions, and live implementation remain **not** authorized here.

**Observed evidence, reused without new calls:** The complete [015-DATA report](../research/GW-ICN-015-data-feasibility.md) and sanitized samples under `/private/tmp/GW-ICN-015-evidence/` record 14 facilities requests, 198 returned rows and 157 distinct sampled rows (78 KO, 79 EN). Lowercase `facilityitem` and `goods` were equal in that sample; contents included menu, merchandise and service text. Uppercase `GOODS` is documented but absent in these sampled responses. Both lowercase fields have substantive, blank and literal `-` values; **null and absent states for those two fields are validation cases, not demonstrated merchandise-field frequencies in this sample**. Nulls occur in other listing fields. None of these sample frequencies describes the full catalog.

The [raw/normalized types](../../src/types/icn-facility-browse.ts) and [normalizer](../../src/lib/icn-facilities/normalize-icn-facility.ts) omit descriptions. The [validator](../../src/lib/icn-facilities/validate-icn-snapshot.ts) rejects extra normalized fields. [Duplicate collapse](../../src/lib/icn-facilities/icn-snapshot-matching.ts) and [v1 references](../../src/lib/icn-facilities/icn-facility-reference.ts) use the existing complete core-content encoding. The [accepted reference contract](icn-facility-reference-contract.md) remains binding. The old fixture's absence of a description means **not captured**, not “the provider supplied no description.”

All rules below are **proposed**, including type names, serializer rules, policy choices and UI copy. No new provider fact is inferred from a synthetic example.

### Alternatives considered

| Approach | Benefit | Cost / compatibility consequence | Recommendation |
| --- | --- | --- | --- |
| **Optional companion outside frozen v1 core identity** | Keeps existing reference bytes, core validation, collapse, browse counts and search inputs intact; can roll back independently | Separate association/quality check; cannot select between previously collapsed description variants; descriptions are not frozen by a v1 reference | **Choose this for the bounded detail enrichment** |
| Versioned normalized-content + reference change | New references could distinguish rows whose only difference is their description | Requires explicit new fixture/reference schemas, legacy-v1 interpretation, changed collapse/pairing and saved-link policy; description edits might invalidate references | Revisit if the product needs variant selection or description-pinned saves; not necessary for explanatory detail text |
| Add optional fields directly to core records while excluding them from v1 fingerprint | Fewer files | Changes the accepted fixture/validator; existing collapse can silently discard conflicting new fields unless a separate aggregation is added anyway; “all core content” semantics need revision | No clear simplification over a companion at this baseline |

## 2. Source preservation and readable-value policy

### Preserve source keys independently

For each source row, retain the exact key spelling and original string value for **`facilityitem`, `goods`, and `GOODS`**. Do not rename uppercase to lowercase, overwrite one with another or deduplicate the stored values because they happen to be equal. The latter two are candidate case variants, not a promised alias. Other capitalization, such as `Goods`, is an unrecognized case variant requiring review, not an automatic alias.

Proposed field representation (notation only):

```ts
type CapturedSourceText =
  | { present: false }
  | { present: true; value: string | null };

type DescriptionObservation = {
  coreFingerprint: string; // existing canonical v1 core JSON, not sn or an ordinal
  fields: {
    facilityitem: CapturedSourceText;
    goods: CapturedSourceText;
    GOODS: CapturedSourceText;
  };
};
```

The capture language is K/E and must agree with the fingerprint's language. Source dataset/operation and capture times belong to the companion metadata. Keep all raw rows, including repeated observations. No phone, key, request URL or new facility identifier is added.

Capture uses own-property presence, not truthiness or nullish coalescing. `present:false` permits no `value`; `present:true` requires an own `value` of string or explicit null. A present `undefined` or extra wrapper key is invalid rather than absent. Unknown capitalization of either source-field family requires review; the exact known keys above are the only accepted mappings.

| Incoming state | Stored representation | Derived display state / proposed action |
| --- | --- | --- |
| Key absent | `{present:false}` | `absent`; preserve distinction from explicit null |
| Explicit JSON null | `{present:true,value:null}` | `null`; unusable text, not evidence of “none offered” |
| Empty or whitespace-only string | Original string retained | `blank`; no visible placeholder paragraph |
| String whose outer-trimmed value is exactly ASCII `-` | Original string retained | `placeholder`; no useful-description claim |
| Other string | Exact string, including original whitespace | `text`; display outer-trimmed string as inert text |
| Number, boolean, array or object | Invalid capture; retain sanitized offending evidence outside shipped artifacts | Reject candidate companion; do not use `String(value)` or selectively salvage one field |
| Unknown goods-key capitalization | Diagnostic in acquisition quality evidence | Reject candidate pending field-mapping review; no fuzzy/case-insensitive reassignment |
| Excessive string length | Raw evidence retained locally, no silent clipping | Reject candidate; ingestion cap **16,384 Unicode code points per source field** (proposed; separate from UI collapse threshold in §5) |

Blank/null/placeholder are legitimate captured states, not invalid artifacts. The placeholder list initially contains only trimmed `-`; strings such as `N/A`, em dash or “없음” are not silently reclassified. A length or schema failure prevents adopting the candidate companion; the accepted core page and any prior valid companion can continue independently under their existing bindings.

### Choose display text only after association and variant checks

For the **one unambiguous observation variant**, take usable values in fixed field order `facilityitem`, `goods`, `GOODS`. Compare display strings by exact equality after outer trimming only. Preserve punctuation, internal whitespace, case and language. Do not split comma lists, translate, concatenate fragments into a new assertion or treat a substring as duplicate content.

| Usable values in the same source row | Detail result |
| --- | --- |
| None | `unavailable / empty`; underlying absent/null/blank/placeholder states stay available to quality reporting |
| One field | One paragraph, with its source-field provenance |
| Two or three equal display strings | One paragraph; record **all contributing source keys** |
| Different substantive strings | Preserve each distinct paragraph and set `fieldAgreement: different`; show a concise provider-disagreement note, without choosing one as authoritative |

Different fields inside one source row are **field disagreement**, which may be displayed. Different raw rows sharing one core fingerprint are **source-variant ambiguity**, which blocks a row-specific description. These are separate states. UI copy can say “제공처의 설명이 서로 다릅니다 / Source descriptions differ”; field names remain internal provenance rather than making the traveler interpret API names. Content supports “listed goods/services,” not stock, availability, a canonical brand registry, diet/allergen suitability, admission or security access.

## 3. Companion snapshot, acquisition and compatibility

### Proposed artifact boundary

Use one optional companion artifact containing both locale captures, avoiding accidental selection of unrelated per-language files. The notation below defines the proposed fields; it is not an existing file or executable schema.

```text
schemaVersion: 1
source: { datasetId: "15095064",
          apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo" }
targetCoreDigests: { K: <SHA-256>, E: <SHA-256> }
captures:
  K: null | {
       startedAt, completedAt, coverage: "retrievable_catalog",
       apiReportedTotalCount, recordCount, syncIntegrity,
       observations: DescriptionObservation[]
     }
  E: null | { same fields }
```

`captures.K/E = null` means that language was **not acquired**. A captured row with three missing/unusable fields is different. Counts are nonnegative safe integers; `recordCount` equals the number of observations; timestamps are valid ISO-8601 instants with timezone and ordered start ≤ completion. Source constants, K/E keys, field wrappers and canonical fingerprints are validated without coercion. Version must be a positive safe integer: 1 is accepted, other positive safe integers are unsupported, and other values are invalid. Unknown artifact fields are invalid. A companion's schema version does not change facility-reference v1 or the existing snapshot-quality report's independent version.

Each capture contains the **whole supplied retrievable catalog**, before filtering or deduplication. `coverage` is a producer assertion backed by the acquisition/page evidence, not something a consumer can prove from metadata alone. Research queries and filtered/subset captures cannot establish absence of conflicting variants and are ineligible as production companions. `syncIntegrity` retains `complete` or `api_total_mismatch` using existing count semantics; matching totals never prove airport completeness. A failed or deliberately incomplete acquisition is not converted into `retrievable_catalog` by filling missing fields with null.

**Target binding:** Calculate each target-core digest from validated, full normalized fixtures, not browse projections. SHA-256 hashes UTF-8 `JSON.stringify` of this fixed-order object:

```text
{
  airportIata: meta.airportIata,
  language: meta.language,
  source: meta.source,
  retrievedAt: meta.retrievedAt,
  recordCount: meta.recordCount,
  apiReportedTotalCount: meta.apiReportedTotalCount,
  syncIntegrity: meta.syncIntegrity,
  fingerprints: all raw core rows' icnFacilityContentFingerprint strings,
                sorted by JavaScript string code-unit order, duplicates retained
}
```

Freeze this serialization as part of companion schema 1. `listingIndex` and row order are incidental; optional duplicate-ID metadata is already checked by core validation and is not an alternative binding input. The digest is a packaging consistency check, not facility identity or authentication; each row still joins by the exact canonical JSON string. This calculation can use imported fixture objects at the producer/server boundary; it does not require reading JSON source-file bytes from a deployed filesystem or adding browser crypto/dependencies. A mismatch with **either** bound core fixture disables the companion until a reviewed artifact is prepared for that pair.

### Future acquisition path — requires a separate assignment

1. Keep the shipped core fixtures unchanged for the first enrichment release. A separately authorized facilities acquisition must retain raw description fields **before** calling the current core normalizer or collapsing any rows. Capture metadata comes from that acquisition, not the historical fixture timestamp. The current stored 14-request research sample is evidence for design, not a complete enrichment catalog.
2. For every new raw row, compute the existing normalized core projection using the current rules; validate that projection and obtain its unchanged canonical fingerprint. Record the three source fields independently. Preserve unmatched observations and all variants in the candidate companion. Associate against the full target core catalogs by **exact fingerprint**, never by source ID or source order.
3. If a new row's name, hours, location, flags, categories or other core content differs, its fingerprint differs: it cannot enrich the old row. Quality reporting records that no exact observation matches. It must not call the old listing removed or updated solely from a reused ID. Adopting a refreshed core fixture is another explicit decision, with its existing reference consequences.
4. Review count/integrity, exact associations, source-variant groups, locale coverage, field states and changes from any prior companion. Only validated/reviewed companions may be selected for packaging. `api_total_mismatch` remains visible and requires explicit review rather than relabeling the acquisition complete; no new automatic approval threshold is introduced.
5. Package the companion with its bound core pair. A refreshed companion can change descriptions for unchanged core fingerprints; its own capture dates identify that change. Do not silently carry a prior observation forward when the new capture no longer contains it. Rollback selects the prior reviewed companion only if its digests still match; otherwise remove the companion and keep base detail working. No runtime sync, watchers or automatic migration.

Retrieval start/completion times mean **our observation window**. There is no verified source row-update timestamp. Show the description's observation date separately from the core listing's existing collection date when different; neither proves current service availability. A newer capture can match an old normalized core exactly, but that establishes matching content, not permanent real-world business identity or source-ID continuity.

### Data flow and affected modules

```text
Future authorized raw KO/EN acquisition
    ├─ current core projection → validated candidate core analysis (no automatic adoption)
    └─ preserved fields + exact core fingerprints → validated companion + quality addendum

Current full core KO/EN fixtures + serialized v1 reference
    → unchanged v1 resolver
    → found record + matching companion binding + supplemental association checks
    → projected goods/services section (visible or omitted) → existing detail presenter/client

Core reference failure → existing detail error; no description rescue
Companion/association failure or empty without eligible fallback → core detail unchanged; goods/services section omitted (reasons in quality layer)
```

| Existing module/contract | Future bounded effect if this proposal is accepted |
| --- | --- |
| [Raw types](../../src/types/icn-facility-browse.ts), [item parser](../../src/lib/icn-facilities/parse-api-items.ts), [client](../../src/lib/icn-facilities/icn-facilities-client.ts), [sync](../../src/lib/icn-facilities/sync-icn-facilities.ts) | Extend raw-field typing and capture descriptions before normalization; validate new unknown values. Keep the accepted core output separate; no credential/request logging. Acquisition execution needs its own permission. |
| Core [normalizer](../../src/lib/icn-facilities/normalize-icn-facility.ts), [validator](../../src/lib/icn-facilities/validate-icn-snapshot.ts), [matching](../../src/lib/icn-facilities/icn-snapshot-matching.ts), [reference](../../src/lib/icn-facilities/icn-facility-reference.ts), [transport](../../src/lib/icn-facilities/icn-facility-ref-transport.ts) | Reuse unchanged semantics and serialized reference format; do not append description fields to core snapshots or fingerprints. |
| New companion types/validator/association presenter and server loader | Small, separate contract boundary; validate source fields, binding and groups; no generic migration layer. Proposed filenames to be chosen in the implementation assignment. |
| [Snapshot quality](../../src/lib/icn-facilities/icn-snapshot-quality.ts), [quality handoff](icn-snapshot-quality-gate.md) | Keep current core report/output semantics; add a separately identified enrichment quality report rather than silently extending core report schema 1. |
| [Fixture loader](../../src/lib/icn-facilities/load-icn-facilities-fixture.ts), [detail page](../../src/components/mivvu/MivvuIcnFacilityDetailPage.tsx), [detail presenter](../../src/lib/icn-facilities/icn-facility-detail-present.ts), [client](../../src/components/mivvu/MivvuIcnFacilityDetailPageClient.tsx) | Load optional companion server-side, resolve core first, pass projected goods/services state (including `sectionVisible`, fallback flags, and internal unavailable reasons for tests/quality). Hide the section when nothing displayable; do not surface diagnostic codes in ordinary UI. |
| [Browse/detail refs](../../src/lib/icn-facilities/icn-browse-detail-refs.ts), [browse projection](../../src/lib/icn-facilities/icn-browse-view-model.ts), [search](../../src/lib/icn-facilities/icn-facility-search.ts), [existing name/location fallback](../../src/lib/icn-facilities/icn-browse-display.ts) | Keep core browse rows, filters, links and locale-local search fields/results unchanged. The existing source-ID fallback map is not a description-association API. |

## 4. Identity, duplicate variants and KO/EN association

### Association rules

**Core resolution is first and unchanged.** Call the accepted v1 resolver against the full KO/EN core catalogs, before any search/terminal/category filtering. Its `found`, missing reasons, ambiguity, invalid-reference and unsupported-version outcomes remain authoritative. A v1 failure returns no description, even if a companion contains plausible text for the same ID.

For a `found` record, validate the optional companion and its target bindings. Select observations by equality with `icnFacilityContentFingerprint(foundRecord)` in the requested language. Never reconstruct the key from a name, card projection or URL ordinal.

### Canonical `coreFingerprint` validation (bare content string)

Each observation `coreFingerprint` is validated as a **bare canonical v1 content fingerprint string**, not as a facility-reference envelope. **`parseIcnFacilityRef` is not used on observations**; only the content-string rules below apply.

The rules remain **frozen and aligned** with accepted v1 fingerprint semantics ([reference contract](icn-facility-reference-contract.md), [`icnFacilityContentFingerprint`](../../src/lib/icn-facilities/icn-snapshot-matching.ts)):

- Fixed content field inventory and key order (including dotted category and source keys).
- Allowed types and values: nonblank `sourceId`; `airportIata` ICN; `language` K or E; string `name`; nullable text fields as string or explicit null; `arrivalOrDeparture` A, D or null; `dutyFreeFlag` Y, N or null; fixed API operation and dataset constants.
- `JSON.parse(coreFingerprint)` succeeds; parsed keys match the frozen inventory exactly; **`JSON.stringify(parsed) === coreFingerprint`** (canonical serialization, same rule the reference module applies to `contentFingerprint` strings today).

**This task does not change** [`icn-facility-reference.ts`](../../src/lib/icn-facilities/icn-facility-reference.ts) and **does not authorize** calling its private fingerprint helper from companion code. Companion validation must follow the same contract rules without reaching into non-exported reference internals.

**Intended future shared boundary:** a **public** validator at the matching/reference contract edge (for example an exported `validateIcnFacilityContentFingerprint(input: unknown)` or equivalent) that companion acquisition, companion schema validation and tests all call, with regression tests tied to the accepted reference contract so v1 content rules cannot drift silently.

**Implementation decision (explicit, not fixed here):** whether that boundary is implemented by **extracting** a shared exported helper from the reference module versus **duplicating** the frozen rules in the companion validator with contract-linked tests is chosen in the implementation assignment. Either way, observations with invalid fingerprints fail companion validation; malformed candidates are not adopted (§2).

Invalid observation fingerprints must not be coerced, truncated or “repaired” at association time.

Within an exact core-fingerprint group, a **source variant** is the fixed ordered triple of complete `facilityitem`/`goods`/`GOODS` capture wrappers. Only byte-identical source strings and identical absent/null states are duplicate observations of one variant. Capture order and occurrence count do not select a winner. Preserve every observation; report both multiplicity and distinct variants. More than one variant blocks a row-specific description; the **consumer** reason follows failure precedence below (`source_variants_ambiguous` on the same-language path; cross-locale **gate** subreasons in the §4 gate table only), even if trimming would make their display strings equal. This conservative rule can withhold harmless whitespace differences; it avoids an unreviewed merge policy.

**Additional cross-locale gate:** When the requested record is the opposite-language record captured by a v1 reference, retain the resolver's captured-pair check and also inspect the full companion capture catalogs **after precheck step 5 confirms the requested-language capture is present**. The gate runs only on that path; it does not reclassify a missing requested-language capture. Both exact origin and exact target fingerprints must occur in their respective captures; the reference `sourceId` must have exactly one distinct core fingerprint per language in those captures; and each exact fingerprint group must have exactly one source variant. If the **reference-origin** capture is absent while the requested-language capture is present, or if any gate check below fails, withhold the description (`cross_locale_association_unverified`, with a gate diagnostic subreason). This gate affects supplemental text only. It must not turn the unchanged v1 core result into a different record or invent a new captured pair. Same-language exact association can still work when unrelated core variants reuse the ID.

This extra gate addresses information that the frozen core collapse cannot see. It is a proposed conservative integration policy, not a change to v1 bilingual identity. Full supplied catalogs mean complete inputs for their capture, not a claim that the provider exposed every airport facility.

**Failure precedence (ordered; first match wins):**

1. **Core-reference failure** — no supplement; existing detail error (no description lookup).
2. **Absent companion** — `not_captured` (no shipped/selected companion artifact).
3. **Invalid companion version or schema** — `unsupported_version` or `invalid_artifact`.
4. **Target-core binding mismatch** — `artifact_mismatch`.
5. **Absent requested-language capture** — `captures.K` or `captures.E` for the **requested** detail language is `null` → `not_captured`. This includes the case where **both** language captures are `null`; the gate in step 6 does **not** run and must not emit `cross_locale_association_unverified` for missing requested-language data.
6. **Association / gate checks** (v1 `found`, companion valid, requested-language capture present):
   - **Same-language** (requested language equals reference origin language): zero observations for the exact fingerprint → `no_exact_observation`; more than one source variant in that fingerprint group → `source_variants_ambiguous`.
   - **Cross-locale** (requested language is the captured opposite-language record): run the additional gate. Any gate failure → `cross_locale_association_unverified` with a **gate** diagnostic subreason in quality reporting (§5). Traveler UI omits the section (§5).
7. **Text outcome** — single eligible variant for the **requested** language: `empty` (association succeeded, no usable paragraphs) or `available` (usable text).
8. **Labeled Korean fallback on English detail only** (human-approved REV3): run **only** when the active preview locale is English, step 7 for **E** is exactly `empty`, and every condition in §5 *KO fallback eligibility* passes. Success yields `available` with `fallbackUsed: true`, displayed `language: K`, Korean capture provenance, and a traveler-visible Korean-source label. **Never** run for step 5 `not_captured`, step 6 failures, or any non-`empty` English outcome. **No** reverse fallback on Korean detail.

**Section visibility (human-approved REV3):** After steps 1–8, if there is no `available` projection, **`sectionVisible: false`** — omit the entire goods/services block. Do not render an empty heading, `-` placeholder, disabled expand control, or generic “unavailable” paragraph. Core facility detail stays unchanged; omitting the block must not imply the facility offers no products or services. Record `unavailable` reasons and provenance in the **internal** supplement/quality projection for verification either way.

#### Capture prechecks (step 5; before the cross-locale gate)

These outcomes **stop before step 6**. Quality reporting may record finer subreasons; the consumer reason is always `not_captured` here.

| Precheck condition | Quality / diagnostic subreason (optional) | Consumer `unavailable.reason` | Cross-locale gate runs? |
| --- | --- | --- | --- |
| Requested-language capture is `null` (`captures.K` or `captures.E` for active detail locale) | `capture_absent_requested` | `not_captured` | No |
| Both `captures.K` and `captures.E` are `null` (companion artifact otherwise valid) | `capture_absent_both` (quality only; consumer still `not_captured`) | `not_captured` | No |

A missing **requested**-language capture is never relabeled `cross_locale_association_unverified`. That coarse reason is reserved for step 6 cross-locale **gate** failures when the requested-language capture **is** present.

#### Cross-locale gate outcomes (step 6 cross-locale path only)

Prerequisites: v1 `found`, companion valid and bound, **requested-language capture present** (step 5 passed). When the gate fails, **`cross_locale_association_unverified`** is recorded in the **internal** supplement (§5). The table below is **exhaustive for gate failures**; quality/acquisition reporting stores the subreason column. Traveler UI: **`sectionVisible: false`** (no diagnostic paragraph).

| Gate condition | Quality / diagnostic subreason | Consumer `unavailable.reason` | Traveler UI |
| --- | --- | --- | --- |
| Reference-**origin** language capture is `null` while requested-language capture is present | `capture_absent_origin` | `cross_locale_association_unverified` | Section omitted (§5); no diagnostic copy |
| No observation in origin capture lists the reference **origin** `contentFingerprint` | `origin_fingerprint_missing_in_capture` | `cross_locale_association_unverified` | Same |
| No observation in requested-language capture lists the resolved **target** `contentFingerprint` | `target_fingerprint_missing_in_capture` | `cross_locale_association_unverified` | Same |
| Reference `sourceId` has **more than one distinct** core fingerprint in origin-language capture | `source_id_multiple_cores_origin` | `cross_locale_association_unverified` | Same |
| Same `sourceId` has **more than one distinct** core fingerprint in requested-language capture | `source_id_multiple_cores_target` | `cross_locale_association_unverified` | Same |
| More than one source variant in the **origin** exact fingerprint group | `origin_description_variants_ambiguous` | `cross_locale_association_unverified` | Same |
| More than one source variant in the **target** exact fingerprint group | `target_description_variants_ambiguous` | `cross_locale_association_unverified` | Same |

Same-language `no_exact_observation` and `source_variants_ambiguous` (step 6 same-language branch) **do not** use the gate table and are never relabeled as cross-locale failures. Exposing subreason strings in UI requires a **separate human product decision**; until then, gate and precheck diagnostics remain in the enrichment quality addendum and review tooling only.

### Identity and compatibility decision table

| Situation | Existing v1/core result | Proposed description behavior |
| --- | --- | --- |
| Legacy core snapshots, no companion | Same as today | Internal `not_captured`; **`sectionVisible: false`** |
| Exact core match, one source variant | `found` | Requested-language `available` or `empty`; EN `empty` may use labeled KO fallback (§5) |
| Repeated identical core + identical field wrappers | Existing identical-row collapse | One source variant; multiplicity recorded, text shown once |
| Previously collapsed core-identical rows differ only in descriptions | Still one v1 core listing | Preserve all raw variants; `source_variants_ambiguous`; do not split cards or pick an ordinal |
| Same `sn`, distinct core content | Exact same-language v1 match can resolve; cross-locale pairing can be ambiguous | Same-language association uses exact content only; cross-locale guard rejects conflicts hidden by a filtered/older catalog |
| Core rows reordered or only `listingIndex` reassigned | Reference still resolves | Binding digest and exact association unchanged; companion observations may be reordered freely |
| Only description changes in a later reviewed companion | Same v1 reference/core | Show new observed description and its capture date; do not claim the old URL saved that text |
| New observation has changed hours/name/location under old ID | Old core may still resolve in unchanged target fixture; after a core refresh v1 can become missing | No exact observation for old fingerprint; `no_exact_observation`, no source-ID reassignment |
| Bound core content or metadata included in the binding changes without companion revalidation | Apply current v1 rules | Digest mismatch → companion unavailable; no “closest” association |
| Origin and captured opposite-language core still exact and unique, with unique complete source groups | Existing cross-locale `found` | Show target-language description after supplemental gate |
| Opposite-language content was uncaptured when reference was created, later becomes unique | Preserve `locale_not_captured` on locale switch | No enrichment/fallback rescue; require explicit new selection/reference |
| Origin missing; captured opposite-language listing survives | Preserve `reference_content_not_found` | No reassignment from surviving language |
| Captured opposite-language content changes/disappears | Preserve `locale_content_not_found` (or existing ambiguity precedence) | No replacement description by ID |
| v1 cross-locale `found`, but supplemental **gate** checks fail (step 6; requested-language capture already present) | Base detail remains `found` | Internal `cross_locale_association_unverified`; **`sectionVisible: false`**. Missing **requested**-language capture alone is step 5 `not_captured`, not this row — **no KO fallback** |
| EN detail, E association `empty`, paired ref, K `available` | `found` | **`sectionVisible: true`**, `fallbackUsed: true`, displayed `language: K`, Korean-source label |
| EN detail, E `empty`, K ambiguous or unavailable | `found` | **`sectionVisible: false`**; internal reasons preserved; **no fallback** |
| EN detail, `captures.E` null | `found` if core resolves | Step 5 **`not_captured`**; **`sectionVisible: false`**; **no fallback** |
| Future unsupported facility-reference version / invalid reference | Existing error | No description lookup |
| Unsupported or invalid companion, mixed target bindings | Base result unchanged | `unsupported_version`, `invalid_artifact` or `artifact_mismatch` for the supplement |

**Guarantees and deliberate limits:** A companion alone does not change old v1 URL bytes, transport, core resolution or future storage of serialized v1 references. **v1 `found` does not imply goods/services text is available**; supplement outcomes are independent unless a valid companion association succeeds. Old links can still go stale for the already documented core-content reasons. Future saved references using v1 retain **listing references, not historical description text**; saves that promise a pinned description require a separate product/storage/version decision. Identical normalized core content cannot detect real-world ID reuse with identical listing facts. Description-variant selection, automatic refresh reconciliation and permanent business identity are not provided.

## 5. Detail-consumer, locale and presentation contract

### Traveler-visible projection (human-approved REV3)

The detail client receives a **goods/services section** projection alongside a found core-detail view. Diagnostic `unavailable.reason` codes and gate subreasons stay in the **internal** supplement/quality layer unless a future product decision exposes them.

```text
goodsServices:
  sectionVisible: boolean
  // When sectionVisible is false, omit the entire block (no heading, no placeholder).

  available?: {
    paragraphs: [{ text, sourceFields: [exact contributing keys] }]
    fieldAgreement: single | equal | different
    language: K | E                    // source language of displayed text
    fallbackUsed: boolean
    sourceLabel?: string             // required when fallbackUsed; e.g. Korean-source label copy
    provenance: { datasetId, apiOperation, captureStartedAt, captureCompletedAt }
    longTextCollapsedByDefault?: boolean  // true when expand/collapse applies (§5)
  }

internal (server/tests/quality; not ordinary traveler UI):
  unavailable?: {
    reason: not_captured | no_exact_observation | empty |
            source_variants_ambiguous | cross_locale_association_unverified |
            artifact_mismatch | invalid_artifact | unsupported_version
    requestedLanguage: K | E
    gateOrPrecheckSubreason?: string
    provenance?: { ... }              // when a valid applicable capture establishes it
  }
  englishOutcome?: empty | available | unavailable   // supports fallback audit
  koreanFallbackAttempted?: boolean
  koreanFallbackEligible?: boolean
```

When `sectionVisible: true`, render the approved heading (“상품·서비스 설명 / Listed goods and services”) within the existing detail hierarchy — **no new navigation or layout redesign**. When `fallbackUsed: true`, show the **`sourceLabel`** (Korean-source information; not a translation claim) and **Korean capture provenance** (`language: K`). English-source text keeps `fallbackUsed: false` and E provenance. Preserve contributing `sourceFields`, same-row distinct paragraphs, and the provider-disagreement note when `fieldAgreement: different`. Do not auto-link source markup or use HTML rendering.

### KO fallback eligibility (human-approved; English detail only)

English captured descriptions **take priority**. Korean fallback is **optional** and **strict**:

| Requirement | Must hold |
| --- | --- |
| Same stored v1 reference | `resolveIcnFacilityRef` → **`found`** for **both** `E` and `K` on full catalogs (same serialized ref the detail page already uses) |
| Captured bilingual pair | Reference includes a valid **`pairedContentFingerprint`** consistent with v1 rules (no sourceId-only join; no new counterpart capture at display time) |
| English path | Requested-language **E** capture present (step 5 passed); English association completes step 6–7 with outcome **`empty` only** — not `not_captured`, `no_exact_observation`, ambiguity, artifact errors, or gate failure |
| Korean path | Korean association for the paired K record runs the **same** precedence and safeguards (including the **cross-locale gate** when English detail resolves the captured opposite-language record); outcome must be **`available`** with usable paragraphs |
| Exclusions | Fallback must **not** rescue core-reference failure, missing captures, missing exact observations, ambiguous variants, invalid/unsupported companion, binding mismatch, or English **`available`** text |

If fallback eligibility fails, treat as no displayable description: **`sectionVisible: false`**, with internal reasons preserved. **No** English fallback on Korean detail. **No** automatic translation. Korean text used in fallback is **not** indexed for English search; browse/search remain locale-local and unchanged.

### Long descriptions (human-approved REV3)

- **Ingestion:** §2 **16,384 Unicode code points per source field** caps stored capture size; do not truncate below that at association time.
- **Display:** When `available` text exceeds a **visual** threshold, default to a collapsed preview with an accessible **“Show more / Show less”** (or equivalent bilingual control) within the existing mobile detail hierarchy. The **full accepted text** remains in the projection and must be reachable when expanded; preserve meaningful line breaks and wrapping.
- **Threshold:** Choose and verify a reasonable line/character preview threshold during UI implementation at **360 / 390 / 430px** preview widths; this document does **not** fix a numeric threshold.

### Internal consumer reason summary (unchanged precedence)

`not_captured` includes absent companion and **missing requested-language capture** (step 5) — **not** an English-empty fallback case. `cross_locale_association_unverified` applies only to cross-locale **gate** failures (step 6) when requested-language capture is present. `no_exact_observation` and `source_variants_ambiguous` apply on the same-language branch. These reasons explain **`sectionVisible: false`** internally; they must not produce a traveler-facing unavailable paragraph under REV3.

### Locale policy record

| Topic | Status |
| --- | --- |
| English-primary descriptions on EN detail | **Human-approved (REV3)** |
| Labeled Korean-source fallback when E is safely `empty` and K is `available` | **Human-approved (REV3)** |
| Korean detail — no English fallback | **Required** |
| Relax cross-locale association gate | **Not selected** — keep conservative gate |
| Partial rows from rejected companion artifacts | **Not selected** — whole-candidate rejection policy unchanged |
| Search indexing of description or fallback text | **Unchanged** — not indexed |

An EN-native ref without a captured KO counterpart cannot borrow KO. A paragraph containing Korean inside a provider `lang=E` field remains **E-source** content with `fallbackUsed: false`. Free-text language is not certified beyond the source-field language label.

Description text never enters the browse projection or search index. English queries must not match Korean fallback paragraphs.

## 6. Concrete synthetic cases

**Everything in this section is synthetic.** `F_K`/`F_E` abbreviate complete, valid existing core fingerprints in the indicated language; they are explanatory symbols, not accepted wire values. `sn=TEST-7` is not an observed airport record.

| Synthetic input | Expected result |
| --- | --- |
| One `F_E` row: `facilityitem=" Coffee, tea "`, `goods="Coffee, tea"`, `GOODS` absent | Preserve both original strings and absence; available paragraph `Coffee, tea`, contributors `[facilityitem, goods]`, agreement `equal` |
| One `F_E` row: `facilityitem="Hot meals"`, `goods="Coffee"`, `GOODS="Tea"` | Three distinct paragraphs, agreement `different`; retain disagreement, no “brand” inference |
| One `F_E` row: `facilityitem=null`, `goods=" "`, `GOODS="-"` | Three distinct stored states; E supplement `empty`; **`sectionVisible: false`** on EN unless labeled KO fallback succeeds (§5) |
| Two rows share `F_E`: one says Coffee/Coffee, the other Tea/Tea | v1 still identifies one core listing; preserve both source variants; internal ambiguity; **`sectionVisible: false`** |
| Two rows share `F_E`: one says `"Coffee"`, the other `" Coffee "` | Distinct raw variants, so withhold despite equal trimmed display; deliberate conservative limit |
| Old target `F_E` has hours `08:00–20:00`; new row with the same ID has `09:00–20:00` and text Coffee | Different complete fingerprint; no description attached to old `F_E` |
| `F_K` has two description variants, captured `F_E` has one | KO same-language path: `source_variants_ambiguous`; KO-origin ref resolving EN: gate failure `cross_locale_association_unverified` (if EN capture present), not `not_captured` for EN unless `captures.E` is null |
| Unpaired EN-native v1 ref; later a unique KO observation appears | EN same-locale data may work; **`fallbackUsed: false`**; KO fallback forbidden without paired ref |
| E `empty`, paired ref, K text Coffee | **`sectionVisible: true`**, `fallbackUsed: true`, `language: K`, Korean-source label + K provenance |
| E text 20k code points (under ingestion cap) | **`longTextCollapsedByDefault: true`**; full text via Show more / Show less |
| Any path ending without `available` | Core **`found`** unchanged; **`sectionVisible: false`**; no unavailable paragraph |
| Later reviewed capture changes only Coffee → Tea for one exact `F_E` | Same v1 URL; show Tea with the newer capture date; saved text was not pinned |
| Source `goods` is an array or source introduces `Goods` | Candidate companion rejected; no stringification or case-insensitive alias; base listing remains usable |

## 7. Future verification and acquisition-quality requirements

These are **future acceptance expectations, not tests run in this documentation task**. Use independently constructed synthetic records and literal expected source states/outcomes; do not generate expected answers by calling the helper under test.

| Area | Meaningful future check |
| --- | --- |
| Preservation | Independently assert absent/null/empty/whitespace/`-`/text wrappers; exact raw strings and key spelling survive acquisition → companion serialization → validation |
| Case and disagreement | `GOODS` alone; lowercase alone; both equal/divergent; unknown `Goods`; no overwrite or source-data loss |
| Invalid input | Primitive/object/array type errors, extra schema keys, malformed fingerprint, wrong source/language, bad counts/timestamps, cap and cap+1 code-point strings; candidate invalid, accepted artifact not replaced |
| Display | Equal trimmed strings render once; distinct strings readable; **`sectionVisible: false`** when nothing displayable; expand/collapse exposes full long text without truncating stored association output |
| Hidden variants | Two raw rows identical under v1 core but different descriptions remain in acquisition and quality evidence; description blocked before browse projection/collapse can erase the distinction |
| Order and duplicates | Reverse raw/normalized order and reassign `listingIndex`; same associations/digests/results; changing identical-duplicate multiplicity changes target binding/count evidence, not v1 record identity |
| Exact association | Same ID with changed hours/name/location, reused ordinals and similarly named facilities never acquire the other observation; no-exact and unmatched groups are reported |
| Bilingual / fallback | REV3 labeled KO fallback only when E is `empty`, paired ref, K `available`, all gates pass; **`captures.E` null → not_captured, no fallback**; no core-failure rescue |
| Legacy compatibility | Existing KO/EN fixture bytes and v1 serialized refs unchanged by companion-only adoption; old reference parser/transport cases and independent expected browse counts/search results retained |
| Snapshot binding | Import-equivalent reordered fixtures produce the frozen digest; changed metadata/content/multiplicity fails binding; K/E mixed artifacts and unsupported schema disable only enrichment |
| Refresh and rollback | Description-only update is visible with new provenance; newer capture omission does not reuse previous text; previous artifact only activates against its valid binding; missing/invalid companion leaves core detail recoverable with section omitted |
| Consumer boundary | Server validates companion; client receives `goodsServices` with **`sectionVisible`**, fallback flags, expand/collapse; internal `unavailable` for tests/quality; no traveler diagnostic codes |
| Search boundary | Locale-local search unchanged; description and KO fallback text **not** indexed |

The separate enrichment quality addendum must report acquisition times and count integrity, all raw observations, exact-associated versus unassociated fingerprints, duplicate multiplicity, per-fingerprint variant counts, full-capture source-ID core conflicts, locale pairing limitations, field-state counts, field disagreement and description changes between captures. Track raw-data changes even when displayed text stays equal. Report `reviewNeeded` with reasons and an explicitly unassessed publication decision; do not treat schema-valid or equal totals as acceptance. Existing core `api_total_mismatch`, duplicate-ID and missing-field diagnostics remain intact.

Known shipped baselines remain 1,028 rows / 1,011 collapsed listings and 17 identical duplicate groups per locale, reported total 1,175. They are historical/core-fixture facts, not a newly acquired enrichment catalog. Complete source capture and its empirical variant coverage are still unavailable; future live acquisition must have an explicit request budget and secret-safe evidence handling.

## 8. Review decisions and bounded implementation handoff

### Human-approved (REV3 — product behavior)

1. **Labeled Korean-source fallback** on English detail when English association is safely **`empty`**, Korean is **`available`**, and all v1 pairing, binding, variant and cross-locale safeguards pass (§5).
2. **Long descriptions:** accessible Show more / Show less; full accepted text retained; ingestion cap separate from visual threshold (§5).
3. **Hide goods/services section** when nothing displayable; no empty heading or generic unavailable paragraph (§5).

### Still pending (coordinator / human)

| Decision | Recommendation |
| --- | --- |
| Accept companion enrichment **outside v1 identity** (unpinned description refreshes, blocked variant groups) | Required before implementation; alternative is versioned core+reference change (§1) |
| **Whole-candidate rejection** vs row-level salvage from invalid companions | Keep whole-candidate rejection (human did **not** select partial adoption) |
| **Conservative cross-locale gate** | Keep as drafted (human did **not** select relaxation) |
| **16,384 code-point ingestion cap** | Adopt as proposed unless acquisition finds longer verified fields |
| Exact **`sourceLabel`** / disagreement / observation-date copy | Implement in UI task; bilingual accessible labels |
| **Acquisition scope**, request budget, `api_total_mismatch` treatment, companion publication | Separate explicit authorization; research samples not production companions |
| **Full contract acceptance** and **implementation assignment** | Coordinator assessment + human sign-off after REV3 |

### Cursor technical review (complete)

**GW-ICN-015-ENRICH-CONTRACT-REVIEW**, **REV1** (bare fingerprint), **REV2** (precheck vs gate precedence), **REV3** (human product behavior) — Cursor self-checking, not independent re-review.

### Suggested implementation handoff — not dispatched

After coordinator acceptance and an explicit task assignment with permissions:

- Implement companion capture/schema/validation/association and **`goodsServices` projection** per §§4–5 (including fallback step 8, **`sectionVisible`**, expand/collapse).
- Keep v1 reference bytes, core fixtures, browse, and locale-local search unchanged.
- Server detail boundary: load/validate companion; resolve core first; never rescue core errors with descriptions.
- Offline synthetics + sanitized samples for dev evidence; full verification matrix §7 at module boundaries.
- Acquisition, quality review, artifact adoption, commit, push, PR, merge, deploy — **only** when separately authorized.

**Future document updates:** Supplemental addendum to [012 reference contract](icn-facility-reference-contract.md) (v1 excludes descriptions); companion boundary in [004](icn-facility-adapter-handoff.md) / [007](icn-snapshot-quality-gate.md); `PLAN.md` only if invariants change.

**Authorship disclosure:** Codex — original draft and prior ICN matching/reference work. Cursor — **REVIEW**, **REV1**, **REV2**, **REV3** (reviewer and revision author; self-checking).

## 9. Checks performed and stop record

Applied `verification-before-completion` to REV3: human-approved behavior wired through §§4–8; REV2 precedence and REV1 fingerprint wording preserved; fallback eligibility; **`sectionVisible`** consistency; single-file scope.

| Check actually performed | Result / evidence |
| --- | --- |
| Git status/branch/HEAD @ `2be6c132` | `codex/gw-icn-015-data`; untracked proposal + research preserved |
| Read full REV2 proposal before REV3 edit | Done |
| Document control-flow / product cases (§9 table in closeout) | Seven scenarios walked — not app tests |
| Changed-file scope | **Only** `docs/data/icn-facility-goods-services-contract-proposal.md` |
| API, sync, app tests, build/browser, Graphify | **NOT RUN** |

```text
GATEWISE STATUS — Cursor
Task ID / objective: GW-ICN-015-ENRICH-CONTRACT-REV3 / human-approved locale & presentation in contract
Plan revision: GW-PLAN-REV-2026-10-29
Execution permission: authorized (proposal Markdown edit only)
Work progress: complete
Review / acceptance: pending (ChatGPT coordinator; full human contract acceptance not complete)
Integration / release: n/a
Files changed: docs/data/icn-facility-goods-services-contract-proposal.md only (REV3)
Behavior delivered: implementation-ready contract text for approved REV3 product behavior; no application changes
Tests/commands: git status/HEAD; document consistency walk-through; no app campaign
Git: codex/gw-icn-015-data @ 2be6c132; untracked locally; no commit/push/PR/deploy
Dependencies: coordinator assessment; §8 pending contract/acquisition decisions
Handoff: docs/data/icn-facility-goods-services-contract-proposal.md
Recommended next: coordinator review → human accept contract → assign implementation + acquisition with permissions
Decision needed: companion-outside-v1 acceptance, acquisition scope, exact copy strings, full contract sign-off (REV3 product choices already approved)
```
