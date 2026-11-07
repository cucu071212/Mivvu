"use client";

import { useId, useMemo } from "react";
import type { IcnFacilityDetailFoundView } from "@/lib/icn-facilities/icn-facility-detail-present";
import { buildIcnFacilitySituationContent } from "@/lib/icn-facilities/icn-facility-situation";
import type { MivvuPreviewMessages } from "@/lib/mivvu-preview-messages";

export type MivvuIcnSituationSectionProps = {
  detail: IcnFacilityDetailFoundView;
  messages: MivvuPreviewMessages;
};

function SituationList({ heading, items }: { heading: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mivvu-icn-situation-group">
      <h3 className="mivvu-icn-situation-group-title">{heading}</h3>
      <ul className="mivvu-icn-situation-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function MivvuIcnSituationSection({ detail, messages }: MivvuIcnSituationSectionProps) {
  const sectionId = useId();
  const content = useMemo(
    () => buildIcnFacilitySituationContent(detail, messages),
    [detail, messages],
  );

  return (
    <section className="mivvu-icn-situation" aria-labelledby={sectionId}>
      <h2 id={sectionId} className="mivvu-icn-detail-subhead">
        {messages.icnSituationTitle}
      </h2>
      <p className="mivvu-icn-situation-lead">{messages.icnSituationLead}</p>
      <SituationList heading={messages.icnSituationKnownHeading} items={content.known} />
      <SituationList heading={messages.icnSituationUnknownHeading} items={content.unknown} />
      <SituationList heading={messages.icnSituationNotClaimedHeading} items={content.notClaimed} />
    </section>
  );
}
