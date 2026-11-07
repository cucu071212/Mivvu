"use client";

import { useId, useState } from "react";
import type { IcnGoodsServicesDetailProjection } from "@/types/icn-goods-services-companion";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { MivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

export type MivvuIcnGoodsServicesSectionProps = {
  projection: IcnGoodsServicesDetailProjection;
  locale: MivvuPreviewLocale;
  messages: MivvuPreviewMessages;
};

export const ICN_GOODS_SERVICES_OBSERVATION_TIME_ZONE = "Asia/Seoul";

export function formatIcnGoodsServicesObservationDate(
  iso: string,
  locale: MivvuPreviewLocale,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    timeZone: ICN_GOODS_SERVICES_OBSERVATION_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function GoodsParagraph({ text, collapsed }: { text: string; collapsed: boolean }) {
  const className = collapsed
    ? "mivvu-icn-goods-text mivvu-icn-goods-text-collapsed"
    : "mivvu-icn-goods-text";
  return (
    <p className={className} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
      {text}
    </p>
  );
}

export function MivvuIcnGoodsServicesSection({
  projection,
  locale,
  messages,
}: MivvuIcnGoodsServicesSectionProps) {
  const sectionId = useId();
  const [expanded, setExpanded] = useState(false);

  const available = projection.available;
  const needsCollapse = available?.longTextCollapsedByDefault ?? false;

  if (!projection.sectionVisible || !available) {
    return null;
  }

  const observationLabel = formatIcnGoodsServicesObservationDate(
    available.provenance.captureCompletedAt,
    locale,
  );
  const showCollapsed = needsCollapse && !expanded;

  return (
    <section className="mivvu-icn-goods-services" aria-labelledby={sectionId}>
      <h2 id={sectionId} className="mivvu-icn-detail-subhead">
        {messages.icnGoodsServicesHeading}
      </h2>
      {available.fallbackUsed && available.sourceLabel ? (
        <p className="mivvu-icn-ko-fallback">{available.sourceLabel}</p>
      ) : null}
      {available.fieldAgreement === "different" ? (
        <p className="mivvu-icn-goods-field-note">{messages.icnGoodsServicesDifferentFieldsNote}</p>
      ) : null}
      {available.paragraphs.length === 1 ? (
        <GoodsParagraph text={available.paragraphs[0].text} collapsed={showCollapsed} />
      ) : (
        available.paragraphs.map((paragraph, index) => (
          <GoodsParagraph key={index} text={paragraph.text} collapsed={showCollapsed} />
        ))
      )}
      {needsCollapse ? (
        <button
          type="button"
          className="mivvu-icn-goods-toggle gw-focus-ring"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? messages.icnGoodsServicesShowLess : messages.icnGoodsServicesShowMore}
        </button>
      ) : null}
      <p className="mivvu-icn-goods-meta">
        <span className="mivvu-icn-goods-meta-label">{messages.icnGoodsServicesObservedOn}</span>
        <span>{observationLabel}</span>
      </p>
      <p className="mivvu-icn-goods-provenance">{messages.icnGoodsServicesProvenanceNote}</p>
    </section>
  );
}
