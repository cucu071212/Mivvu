"use client";

import { useEffect, useRef } from "react";
import type { Facility } from "@/types/airport";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { FacilityInformation } from "@/components/FacilityInformation";
import {
  facilityTerminalBoardingLabel,
  recommendEligibilityLabel,
} from "@/lib/facility-present";

export type FacilityDetailDialogProps = {
  facility: Facility | null;
  open: boolean;
  onClose: () => void;
};

function timingConfidenceNote(facility: Facility): string {
  if (facility.timeConfidence === "demo_estimate") {
    return "Wait and activity durations use demo estimates in the recommendation model when enabled — not live queue data.";
  }
  return "Queue and activity times are unknown unless you enter overrides on Recommendations; GateWise does not ingest live waits.";
}

export function FacilityDetailDialog({
  facility,
  open,
  onClose,
}: FacilityDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && facility) {
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      return;
    }
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }, [open, facility]);

  const requestClose = () => {
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.close === "function") {
      dialog.close();
      return;
    }
    onClose();
  };

  if (!facility) return null;

  const titleId = `facility-detail-${facility.id}-title`;

  return (
    <dialog
      ref={dialogRef}
      className="gw-facility-detail-dialog gw-surface-card backdrop:bg-black/50"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      <div className="flex max-h-[min(85vh,40rem)] flex-col gap-4 overflow-hidden p-4 sm:p-5">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border pb-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {facilityTerminalBoardingLabel(facility)}
            </p>
            <h2
              id={titleId}
              className="text-xl font-semibold text-card-foreground"
            >
              {facility.name}
            </h2>
            <span
              className={
                facility.recommendEligible
                  ? "gw-status-chip gw-status-feasible w-fit text-xs"
                  : "gw-status-chip gw-status-ineligible w-fit text-xs"
              }
            >
              {recommendEligibilityLabel(facility)}
            </span>
          </div>
          <button
            type="button"
            className="gw-focus-ring gw-btn-secondary min-h-11 shrink-0 px-3"
            onClick={requestClose}
          >
            Close facility details
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {!facility.recommendEligible ? (
            <p
              className="mb-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
              role="note"
            >
              This listing is for airport-wide discovery only. GateWise does not
              model walking time, queues, or feasibility from your gate to this
              facility in another terminal or boarding area.
            </p>
          ) : null}

          <FacilityInformation
            facility={facility}
            idPrefix={`detail-${facility.id}`}
          />

          <section
            className="mt-4 flex flex-col gap-2 border-t border-border pt-3"
            aria-labelledby={`detail-${facility.id}-timing-heading`}
          >
            <h3
              id={`detail-${facility.id}-timing-heading`}
              className="text-sm font-semibold text-card-foreground"
            >
              Timing model
            </h3>
            <p className="text-sm text-muted-foreground" role="note">
              {timingConfidenceNote(facility)}
            </p>
            <div className="flex flex-wrap gap-2">
              <ConfidenceBadge confidence={facility.locationConfidence} />
              {facility.timeConfidence !== "unknown" ? (
                <ConfidenceBadge confidence={facility.timeConfidence} />
              ) : (
                <span className="gw-status-chip gw-status-unknown text-xs">
                  Activity/wait: unknown (official)
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </dialog>
  );
}
