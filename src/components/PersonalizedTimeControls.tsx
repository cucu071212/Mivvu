"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MAX_BOARDING_WINDOW_MINUTES } from "@/lib/strict-integer";
import type {
  Facility,
  FacilityCategory,
  FacilityDurationOverride,
  FacilityDurationOverrideMap,
} from "@/types/airport";

export type { FacilityDurationOverride, FacilityDurationOverrideMap };

/** Facility rows shown in the editor (subset of {@link Facility}). */
export type PersonalizedFacilityRow = Pick<
  Facility,
  "id" | "name" | "category"
>;

export type PersonalizedTimeControlsProps = {
  facilities: readonly PersonalizedFacilityRow[];
  overrides: FacilityDurationOverrideMap;
  onChange: (next: FacilityDurationOverrideMap) => void;
  /** False while any field has a validation error (draft not committed). */
  onDraftValidityChange?: (draftsValid: boolean) => void;
  disabled?: boolean;
};

export function personalizationDraftsAreValid(
  fieldErrors: Partial<Record<string, string>>,
): boolean {
  return Object.keys(fieldErrors).length === 0;
}

export type OverrideField = "queueMinutes" | "activityMinutes";

export type ParsePersonalizedMinutesResult =
  | { kind: "empty" }
  | { kind: "value"; value: number }
  | { kind: "error"; message: string };

const PERSONALIZED_MINUTES_MESSAGE = `Enter a whole number from 0 to ${MAX_BOARDING_WINDOW_MINUTES} minutes, or leave blank.`;

/**
 * UI-only parsing for override text fields; the accepted range must match
 * `validateDurationOverrides` so a value shown as valid is never dropped on commit.
 * Blank → no override; explicit `0` is valid.
 */
export function parsePersonalizedMinutesInput(
  raw: string,
): ParsePersonalizedMinutesResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { kind: "empty" };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { kind: "error", message: PERSONALIZED_MINUTES_MESSAGE };
  }
  const value = Number.parseInt(trimmed, 10);
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > MAX_BOARDING_WINDOW_MINUTES
  ) {
    return { kind: "error", message: PERSONALIZED_MINUTES_MESSAGE };
  }
  return { kind: "value", value };
}

/** Format stored override minutes back into the input (empty when unset). */
export function formatPersonalizedMinutesValue(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "";
  }
  return String(value);
}

/** Merge one parsed field into the override map (omit field when empty). */
export function applyOverrideField(
  map: FacilityDurationOverrideMap,
  facilityId: string,
  field: OverrideField,
  parsed: ParsePersonalizedMinutesResult,
): FacilityDurationOverrideMap {
  if (parsed.kind === "error") {
    return map;
  }
  const existing = map[facilityId];
  const nextEntry: FacilityDurationOverride = {
    facilityId,
    ...(existing?.queueMinutes !== undefined
      ? { queueMinutes: existing.queueMinutes }
      : {}),
    ...(existing?.activityMinutes !== undefined
      ? { activityMinutes: existing.activityMinutes }
      : {}),
  };

  if (parsed.kind === "empty") {
    delete nextEntry[field];
  } else {
    nextEntry[field] = parsed.value;
  }

  const hasQueue = nextEntry.queueMinutes !== undefined;
  const hasActivity = nextEntry.activityMinutes !== undefined;
  if (!hasQueue && !hasActivity) {
    const rest = { ...map };
    delete rest[facilityId];
    return rest;
  }

  return { ...map, [facilityId]: nextEntry };
}

const CATEGORY_LABELS: Record<FacilityCategory, string> = {
  food: "Food",
  coffee: "Coffee",
  shop: "Shop",
  restroom: "Restroom",
  charging: "Charging",
};

type FieldDraftKey = `${string}:queue` | `${string}:activity`;

function draftKey(
  facilityId: string,
  field: OverrideField,
): FieldDraftKey {
  return field === "queueMinutes"
    ? `${facilityId}:queue`
    : `${facilityId}:activity`;
}

/** Facilities visible in the compact editor (search + overrides + errors). */
export function filterPersonalizationFacilities(
  facilities: readonly PersonalizedFacilityRow[],
  options: {
    search: string;
    overrides: FacilityDurationOverrideMap;
    fieldErrors: Partial<Record<FieldDraftKey, string>>;
    drafts: Partial<Record<FieldDraftKey, string>>;
    showAll: boolean;
  },
): PersonalizedFacilityRow[] {
  const q = options.search.trim().toLowerCase();
  const hasFacilitySignal = (id: string) => {
    const queueKey = draftKey(id, "queueMinutes");
    const activityKey = draftKey(id, "activityMinutes");
    return (
      Boolean(options.overrides[id]) ||
      options.drafts[queueKey] !== undefined ||
      options.drafts[activityKey] !== undefined ||
      Boolean(options.fieldErrors[queueKey]) ||
      Boolean(options.fieldErrors[activityKey])
    );
  };

  if (options.showAll && q === "") {
    return [...facilities];
  }

  return facilities.filter((facility) => {
    if (hasFacilitySignal(facility.id)) {
      return true;
    }
    if (q === "") {
      return false;
    }
    return (
      facility.name.toLowerCase().includes(q) ||
      CATEGORY_LABELS[facility.category].toLowerCase().includes(q)
    );
  });
}

export function PersonalizedTimeControls({
  facilities,
  overrides,
  onChange,
  onDraftValidityChange,
  disabled = false,
}: PersonalizedTimeControlsProps) {
  const [drafts, setDrafts] = useState<Partial<Record<FieldDraftKey, string>>>(
    {},
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldDraftKey, string>>
  >({});
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const overrideCount = useMemo(
    () => Object.keys(overrides).length,
    [overrides],
  );

  const hasDraftEdits = useMemo(
    () => Object.keys(drafts).length > 0,
    [drafts],
  );

  const draftsValid = personalizationDraftsAreValid(fieldErrors);

  useEffect(() => {
    onDraftValidityChange?.(draftsValid);
  }, [draftsValid, onDraftValidityChange]);

  const visibleFacilities = useMemo(
    () =>
      filterPersonalizationFacilities(facilities, {
        search,
        overrides,
        fieldErrors,
        drafts,
        showAll,
      }),
    [facilities, search, overrides, fieldErrors, drafts, showAll],
  );

  const clearFieldError = useCallback((key: FieldDraftKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(
    (
      facilityId: string,
      field: OverrideField,
      raw: string,
    ) => {
      const key = draftKey(facilityId, field);
      setDrafts((prev) => ({ ...prev, [key]: raw }));
      const parsed = parsePersonalizedMinutesInput(raw);
      if (parsed.kind === "error") {
        setFieldErrors((prev) => ({ ...prev, [key]: parsed.message }));
        return;
      }
      clearFieldError(key);
      onChange(applyOverrideField(overrides, facilityId, field, parsed));
    },
    [clearFieldError, onChange, overrides],
  );

  const handleClearFacility = useCallback(
    (facilityId: string) => {
      const rest = { ...overrides };
      delete rest[facilityId];
      onChange(rest);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[draftKey(facilityId, "queueMinutes")];
        delete next[draftKey(facilityId, "activityMinutes")];
        return next;
      });
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[draftKey(facilityId, "queueMinutes")];
        delete next[draftKey(facilityId, "activityMinutes")];
        return next;
      });
    },
    [onChange, overrides],
  );

  const handleResetAll = useCallback(() => {
    onChange({});
    setDrafts({});
    setFieldErrors({});
    setSearch("");
    setShowAll(false);
  }, [onChange]);

  const displayValue = useCallback(
    (facilityId: string, field: OverrideField): string => {
      const key = draftKey(facilityId, field);
      if (drafts[key] !== undefined) {
        return drafts[key] ?? "";
      }
      const entry = overrides[facilityId];
      const stored =
        field === "queueMinutes"
          ? entry?.queueMinutes
          : entry?.activityMinutes;
      return formatPersonalizedMinutesValue(stored);
    },
    [drafts, overrides],
  );

  return (
    <details
      id="gw-section-estimates"
      className="gw-surface-card gw-premium-card group scroll-mt-24"
      open
    >
      <summary
        className="gw-focus-ring cursor-pointer list-none px-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden"
      >
        <div className="flex min-h-11 items-start justify-between gap-3">
          <div>
            <h2
              id="personalized-time-heading"
              className="text-base font-semibold text-card-foreground"
            >
              Your time estimates
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional personal queue &amp; activity minutes — search or expand to
              edit a place.
            </p>
          </div>
          <span className="gw-badge gw-badge-demo shrink-0">Personal estimate</span>
        </div>
      </summary>

      <div className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-3">
        <p className="text-sm text-muted-foreground" role="note">
          These are{" "}
          <strong className="font-medium text-card-foreground">
            your personal estimates
          </strong>
          , not official SFO wait or service times. Blank fields use the
          app&apos;s normal sources (official record, demo mode, or unknown).
        </p>

        {!draftsValid ? (
          <p className="text-sm text-destructive" role="alert">
            Fix invalid personal estimates below. Recommendations and What-if are
            paused until every field is blank or a valid whole number — saved
            overrides are not updated while an error is shown.
          </p>
        ) : null}

        <div className="gw-personalization-toolbar">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Find a place to edit
            <input
              type="search"
              className="gw-input gw-focus-ring"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or category"
              disabled={disabled}
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {overrideCount === 0
                ? "No overrides set"
                : `${overrideCount} ${overrideCount === 1 ? "place" : "places"} with overrides`}
            </p>
            <button
              type="button"
              className="gw-focus-ring min-h-11 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setShowAll((value) => !value)}
              disabled={disabled}
            >
              {showAll ? "Show focused list" : `Browse all ${facilities.length} places`}
            </button>
            <button
              type="button"
              className="gw-focus-ring min-h-11 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleResetAll}
              disabled={
                disabled || (overrideCount === 0 && draftsValid && !hasDraftEdits)
              }
            >
              Reset all overrides
            </button>
          </div>
        </div>

        {visibleFacilities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No places match. Try another search or browse all places.
          </p>
        ) : null}

        <ul className="flex flex-col" role="list">
          {visibleFacilities.map((facility) => {
            const queueKey = draftKey(facility.id, "queueMinutes");
            const activityKey = draftKey(facility.id, "activityMinutes");
            const hasOverride = Boolean(overrides[facility.id]);
            const hasFacilityDraft =
              drafts[queueKey] !== undefined ||
              drafts[activityKey] !== undefined;
            const hasFacilityError = Boolean(
              fieldErrors[queueKey] || fieldErrors[activityKey],
            );
            const canClearFacility =
              hasOverride || hasFacilityDraft || hasFacilityError;

            return (
              <li key={facility.id} className="gw-personalization-row">
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">
                    {facility.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[facility.category]}
                    {hasOverride ? (
                      <span className="ml-2 gw-badge gw-badge-demo text-[0.65rem]">
                        Override
                      </span>
                    ) : null}
                  </p>
                </div>

                <label
                  className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground sm:contents"
                  htmlFor={`${facility.id}-queue`}
                >
                  <span className="sm:hidden">Queue / wait (min)</span>
                  <input
                    id={`${facility.id}-queue`}
                    name={`${facility.id}-queue`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    className="gw-input gw-focus-ring text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    value={displayValue(facility.id, "queueMinutes")}
                    onChange={(event) =>
                      handleFieldChange(
                        facility.id,
                        "queueMinutes",
                        event.target.value,
                      )
                    }
                    disabled={disabled}
                    aria-invalid={Boolean(fieldErrors[queueKey])}
                    aria-describedby={
                      fieldErrors[queueKey]
                        ? `${facility.id}-queue-error`
                        : `${facility.id}-queue-hint`
                    }
                    placeholder="—"
                  />
                  {fieldErrors[queueKey] ? (
                    <span
                      id={`${facility.id}-queue-error`}
                      className="col-span-full text-xs font-normal text-destructive sm:col-span-4"
                      role="alert"
                    >
                      {fieldErrors[queueKey]}
                    </span>
                  ) : (
                    <span
                      id={`${facility.id}-queue-hint`}
                      className="sr-only sm:not-sr-only sm:col-span-4 sm:text-[0.65rem] sm:font-normal"
                    >
                      Queue minutes
                    </span>
                  )}
                </label>

                <label
                  className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground sm:contents"
                  htmlFor={`${facility.id}-activity`}
                >
                  <span className="sm:hidden">Activity (min)</span>
                  <input
                    id={`${facility.id}-activity`}
                    name={`${facility.id}-activity`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    className="gw-input gw-focus-ring text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    value={displayValue(facility.id, "activityMinutes")}
                    onChange={(event) =>
                      handleFieldChange(
                        facility.id,
                        "activityMinutes",
                        event.target.value,
                      )
                    }
                    disabled={disabled}
                    aria-invalid={Boolean(fieldErrors[activityKey])}
                    aria-describedby={
                      fieldErrors[activityKey]
                        ? `${facility.id}-activity-error`
                        : `${facility.id}-activity-hint`
                    }
                    placeholder="—"
                  />
                  {fieldErrors[activityKey] ? (
                    <span
                      id={`${facility.id}-activity-error`}
                      className="col-span-full text-xs font-normal text-destructive sm:col-span-4"
                      role="alert"
                    >
                      {fieldErrors[activityKey]}
                    </span>
                  ) : (
                    <span
                      id={`${facility.id}-activity-hint`}
                      className="sr-only sm:not-sr-only sm:col-span-4 sm:text-[0.65rem] sm:font-normal"
                    >
                      Activity minutes
                    </span>
                  )}
                </label>

                <button
                  type="button"
                  className="gw-focus-ring min-h-11 self-end rounded-md px-2 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                  onClick={() => handleClearFacility(facility.id)}
                  disabled={disabled || !canClearFacility}
                >
                  Clear
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
