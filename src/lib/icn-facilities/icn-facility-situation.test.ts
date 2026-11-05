/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  buildIcnFacilitySituationContent,
  icnSituationTextViolatesPolicy,
} from "./icn-facility-situation";
import type { IcnFacilityDetailFoundView } from "./icn-facility-detail-present";
import { buildIcnFacilityDetailView } from "./icn-facility-detail-present";
import { buildIcnFacilityReferenceCatalogs } from "./icn-browse-detail-refs";
import { resolveIcnFacilityRef, serializeIcnFacilityRef, createIcnFacilityRef } from "./icn-facility-reference";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "./load-icn-facilities-fixture";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

function foundViewFromSourceId(sourceId: string, locale: "ko" | "en") {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const fixture = locale === "ko" ? koFixture : enFixture;
  const record = fixture.facilities.find((row) => row.sourceId === sourceId)!;
  const serialized = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
  const resolution = resolveIcnFacilityRef(serialized, catalogs, locale === "ko" ? "K" : "E");
  const view = buildIcnFacilityDetailView(resolution, locale, null);
  if (view.kind !== "found") throw new Error(`expected found for ${sourceId}`);
  return view;
}

function situationPolicyBlob(
  locale: "ko" | "en",
  detail: IcnFacilityDetailFoundView,
): string {
  const messages = mivvuPreviewMessages(locale);
  const content = buildIcnFacilitySituationContent(detail, messages);
  return [
    messages.icnSituationTitle,
    messages.icnSituationLead,
    ...content.known,
    ...content.unknown,
  ].join("\n");
}

const sparseDetail: IcnFacilityDetailFoundView = {
  kind: "found",
  displayName: "Sparse row",
  nameFromKoreanFallback: false,
  placeLine: null,
  displayLocation: null,
  locationFromKoreanFallback: false,
  categoryLabel: null,
  hoursText: null,
  hoursAmbiguousEqual: false,
  arrivalOrDeparture: null,
  dutyFreeFlag: null,
  record: {
    ...foundViewFromSourceId("3289", "ko").record,
    terminalId: null,
    floor: null,
    locationDescription: null,
    hoursText: null,
    arrivalOrDeparture: null,
    dutyFreeFlag: null,
    categories: { large: null, medium: null, small: null },
  },
};

describe("buildIcnFacilitySituationContent", () => {
  it("lists known snapshot fields for a complete listing row (KO)", () => {
    const view = foundViewFromSourceId("3289", "ko");
    const messages = mivvuPreviewMessages("ko");
    const content = buildIcnFacilitySituationContent(view, messages);
    expect(content.known.length).toBeGreaterThan(3);
    expect(content.known).toContain(messages.icnSituationKnownPlaceLine);
    expect(content.known).toContain(messages.icnSituationKnownLocation);
    expect(content.unknown).not.toContain(messages.icnSituationUnknownHours);
    expect(content.notClaimed).toEqual(messages.icnSituationNotClaimedItems);
  });

  it("lists unknown lines for missing primary fields (KO)", () => {
    const messages = mivvuPreviewMessages("ko");
    const content = buildIcnFacilitySituationContent(sparseDetail, messages);
    expect(content.known).toHaveLength(0);
    expect(content.unknown).toContain(messages.icnSituationUnknownPlaceLine);
    expect(content.unknown).toContain(messages.icnSituationUnknownHours);
  });

  it("does not treat partial terminal/floor as known when placeLine is non-null", () => {
    const base = foundViewFromSourceId("3289", "ko");
    const partial: IcnFacilityDetailFoundView = {
      ...base,
      placeLine: "T2",
      record: {
        ...base.record,
        terminalId: "P03",
        floor: null,
      },
    };
    const messages = mivvuPreviewMessages("ko");
    const content = buildIcnFacilitySituationContent(partial, messages);
    expect(content.known).not.toContain(messages.icnSituationKnownPlaceLine);
    expect(content.unknown).toContain(messages.icnSituationUnknownPlaceLine);
  });

  it("does not treat KO fallback location as known on EN listing", () => {
    const base = foundViewFromSourceId("3289", "en");
    const enFallbackLocation: IcnFacilityDetailFoundView = {
      ...base,
      displayLocation: "제2여객터미널 3층",
      locationFromKoreanFallback: true,
      record: {
        ...base.record,
        locationDescription: null,
      },
    };
    const messages = mivvuPreviewMessages("en");
    const content = buildIcnFacilitySituationContent(enFallbackLocation, messages);
    expect(content.known).not.toContain(messages.icnSituationKnownLocation);
    expect(content.unknown).toContain(messages.icnSituationUnknownLocation);
  });

  it("treats ambiguous equal hours as unknown, not known (EN)", () => {
    const view = foundViewFromSourceId("3289", "en");
    const ambiguous: IcnFacilityDetailFoundView = {
      ...view,
      hoursText: "00:00 ~ 00:00",
      hoursAmbiguousEqual: true,
    };
    const messages = mivvuPreviewMessages("en");
    const content = buildIcnFacilitySituationContent(ambiguous, messages);
    expect(content.known).not.toContain(messages.icnSituationKnownHours);
    expect(content.unknown).toContain(messages.icnSituationUnknownHoursAmbiguous);
  });

  it("does not emit policy-violating phrases in KO/EN situation strings", () => {
    const koCases: IcnFacilityDetailFoundView[] = [
      foundViewFromSourceId("3289", "ko"),
      sparseDetail,
    ];
    const partialTerminal = foundViewFromSourceId("3289", "ko");
    koCases.push({
      ...partialTerminal,
      placeLine: "T2",
      record: { ...partialTerminal.record, terminalId: "P03", floor: null },
    });

    for (const detail of koCases) {
      const blob = situationPolicyBlob("ko", detail);
      expect(icnSituationTextViolatesPolicy(blob)).toBe(false);
    }
    expect(situationPolicyBlob("ko", sparseDetail)).toContain(
      mivvuPreviewMessages("ko").icnSituationUnknownHours,
    );

    const enComplete = foundViewFromSourceId("3289", "en");
    const enAmbiguous: IcnFacilityDetailFoundView = {
      ...enComplete,
      hoursText: "00:00 ~ 00:00",
      hoursAmbiguousEqual: true,
    };
    expect(icnSituationTextViolatesPolicy(situationPolicyBlob("en", enComplete))).toBe(false);
    const ambiguousBlob = situationPolicyBlob("en", enAmbiguous);
    expect(icnSituationTextViolatesPolicy(ambiguousBlob)).toBe(false);
    expect(ambiguousBlob).toContain(mivvuPreviewMessages("en").icnSituationUnknownHoursAmbiguous);
  });
});
