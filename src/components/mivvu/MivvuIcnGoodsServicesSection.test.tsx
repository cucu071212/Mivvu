/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import {
  formatIcnGoodsServicesObservationDate,
  MivvuIcnGoodsServicesSection,
} from "./MivvuIcnGoodsServicesSection";
import { mivvuPreviewMessages } from "@/lib/mivvu-preview-messages";
import type { IcnGoodsServicesDetailProjection } from "@/types/icn-goods-services-companion";

describe("MivvuIcnGoodsServicesSection", () => {
  const messages = mivvuPreviewMessages("en");

  it("renders nothing when sectionVisible is false", () => {
    const { container } = render(
      <MivvuIcnGoodsServicesSection
        projection={{ sectionVisible: false }}
        locale="en"
        messages={messages}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("toggles accessible show more / show less for long text", () => {
    render(
      <MivvuIcnGoodsServicesSection
        projection={{
          sectionVisible: true,
          available: {
            paragraphs: [{ text: "Long body", sourceFields: ["goods"] }],
            fieldAgreement: "single",
            language: "E",
            fallbackUsed: false,
            provenance: {
              datasetId: "15095064",
              apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo",
              captureStartedAt: "2026-10-01T00:00:00+09:00",
              captureCompletedAt: "2026-10-01T01:00:00+09:00",
            },
            longTextCollapsedByDefault: true,
          },
        }}
        locale="en"
        messages={messages}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Show more" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Show less" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("formats observation date in Asia/Seoul consistently for SSR and hydration", async () => {
    const iso = "2026-10-01T01:00:00+09:00";
    const messages = mivvuPreviewMessages("ko");
    const projection: IcnGoodsServicesDetailProjection = {
      sectionVisible: true,
      available: {
        paragraphs: [{ text: "Synthetic review text", sourceFields: ["goods"] }],
        fieldAgreement: "single" as const,
        language: "K" as const,
        fallbackUsed: false,
        provenance: {
          datasetId: "15095064",
          apiOperation: "B551177/FacilitiesInformation/getFacilitesInfo",
          captureStartedAt: "2026-10-01T00:00:00+09:00",
          captureCompletedAt: iso,
        },
        longTextCollapsedByDefault: false,
      },
    };
    const props = { projection, locale: "ko" as const, messages };
    const expected = formatIcnGoodsServicesObservationDate(iso, "ko");
    expect(expected).toBe("2026년 10월 1일");

    const previousTz = process.env.TZ;
    process.env.TZ = "UTC";
    const serverHtml = renderToString(<MivvuIcnGoodsServicesSection {...props} />);
    expect(serverHtml).toContain(expected);

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    process.env.TZ = "Asia/Seoul";
    const errors: string[] = [];
    await act(async () => {
      hydrateRoot(container, <MivvuIcnGoodsServicesSection {...props} />, {
        onRecoverableError: (error) => {
          errors.push(error instanceof Error ? error.message : String(error));
        },
      });
    });
    expect(errors).toEqual([]);
    expect(container.querySelector(".mivvu-icn-goods-meta")?.textContent).toContain(expected);
    process.env.TZ = previousTz;
  });
});
