/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MivvuIcnSituationSection } from "./MivvuIcnSituationSection";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";
import { buildIcnFacilityDetailView } from "@/lib/icn-facilities/icn-facility-detail-present";
import { buildIcnFacilityReferenceCatalogs } from "@/lib/icn-facilities/icn-browse-detail-refs";
import {
  createIcnFacilityRef,
  resolveIcnFacilityRef,
  serializeIcnFacilityRef,
} from "@/lib/icn-facilities/icn-facility-reference";
import { loadIcnFacilitiesEnFixture, loadIcnFacilitiesKoFixture } from "@/lib/icn-facilities/load-icn-facilities-fixture";

function renderSituation(locale: "ko" | "en", sourceId = "3289") {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const catalogs = buildIcnFacilityReferenceCatalogs(koFixture, enFixture);
  const fixture = locale === "ko" ? koFixture : enFixture;
  const record = fixture.facilities.find((row) => row.sourceId === sourceId)!;
  const serialized = serializeIcnFacilityRef(createIcnFacilityRef(record, catalogs));
  const resolution = resolveIcnFacilityRef(serialized, catalogs, locale === "ko" ? "K" : "E");
  const detail = buildIcnFacilityDetailView(resolution, locale, null);
  if (detail.kind !== "found") throw new Error("expected found");
  const messages = mivvuPreviewMessages(locale);
  render(<MivvuIcnSituationSection detail={detail} messages={messages} />);
  return { messages, detail };
}

describe("MivvuIcnSituationSection", () => {
  it("renders KO headings and not-claimed list without open-now verdict copy", () => {
    const { messages } = renderSituation("ko");
    expect(screen.getByRole("heading", { level: 2, name: messages.icnSituationTitle })).toBeTruthy();
    expect(screen.getByText(messages.icnSituationKnownHeading)).toBeTruthy();
    expect(screen.getByText(messages.icnSituationNotClaimedHeading)).toBeTruthy();
    expect(screen.getByText(/시계와 비교하지 않음/)).toBeTruthy();
    expect(screen.queryByText(/지금 영업 중입니다/)).toBeNull();
  });

  it("renders EN section for the same facility", () => {
    const { messages } = renderSituation("en");
    expect(screen.getByRole("heading", { level: 2, name: messages.icnSituationTitle })).toBeTruthy();
    expect(screen.getByText(/do not compare hours to the clock/i)).toBeTruthy();
  });

  it("shows unknown bullets when primary fields are absent", () => {
    const messages = mivvuPreviewMessages("ko");
    const { detail } = renderSituation("ko");
    render(
      <MivvuIcnSituationSection
        detail={{
          ...detail,
          placeLine: null,
          displayLocation: null,
          hoursText: null,
          categoryLabel: null,
          arrivalOrDeparture: null,
          dutyFreeFlag: null,
          record: {
            ...detail.record,
            terminalId: null,
            floor: null,
            locationDescription: null,
            hoursText: null,
            arrivalOrDeparture: null,
            dutyFreeFlag: null,
            categories: { large: null, medium: null, small: null },
          },
        }}
        messages={messages}
      />,
    );
    expect(screen.getAllByText(messages.icnSituationUnknownPlaceLine).length).toBeGreaterThan(0);
  });
});
