"use client";

import { useCallback, useMemo, useState } from "react";
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
  disabled?: boolean;
};

export type OverrideField = "queueMinutes" | "activityMinutes";

export type ParsePersonalizedMinutesResult =
  | { kind: "empty" }
  | { kind: "value"; value: number }
  | { kind: "error"; message: string };

/**
 * UI-only parsing for override text fields (not Codex `validateDurationOverrides`).
 * Blank → no override; explicit `0` is valid; rejects negative and fractional values.
 */
export function parsePersonalizedMinutesInput(
  raw: string,
): ParsePersonalizedMinutesResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { kind: "empty" };
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      kind: "error",
      message: "Enter a whole number of minutes (0 or greater), or leave blank.",
    };
  }
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(value) || value < 0) {
    return {
      kind: "error",
      message: "Enter a whole number of minutes (0 or greater), or leave blank.",
    };
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

export function PersonalizedTimeControls({
  facilities,
  overrides,
  onChange,
  disabled = false,
}: PersonalizedTimeControlsProps) {
  const [drafts, setDrafts] = useState<Partial<Record<FieldDraftKey, string>>>(
    {},
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldDraftKey, string>>
  >({});

  const overrideCount = useMemo(
    () => Object.keys(overrides).length,
    [overrides],
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
    <section
      className="gw-surface-card flex flex-col gap-4 p-4 sm:p-5"
      aria-labelledby="personalized-time-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="personalized-time-heading"
            className="text-base font-semibold text-card-foreground"
          >
            Your time estimates
          </h2>
          <p className="text-sm text-muted-foreground" role="note">
            Optional queue and activity minutes per place. These are{" "}
            <strong className="font-medium text-card-foreground">
              your personal estimates
            </strong>
            , not official SFO wait or service times. Blank fields use the
            app&apos;s normal sources (official record, demo mode, or unknown).
          </p>
        </div>
        <span className="gw-badge gw-badge-demo shrink-0 self-start">
          Personal estimate
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {overrideCount === 0
            ? "No overrides set"
            : `${overrideCount} ${overrideCount === 1 ? "place" : "places"} with overrides`}
        </p>
        <button
          type="button"
          className="gw-focus-ring min-h-11 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleResetAll}
          disabled={disabled || overrideCount === 0}
        >
          Reset all overrides
        </button>
      </div>

      <ul className="flex flex-col gap-3" role="list">
        {facilities.map((facility) => {
          const queueKey = draftKey(facility.id, "queueMinutes");
          const activityKey = draftKey(facility.id, "activityMinutes");
          const hasOverride = Boolean(overrides[facility.id]);

          return (
            <li
              key={facility.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-card-foreground">
                    {facility.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[facility.category]}
                  </p>
                </div>
                <button
                  type="button"
                  className="gw-focus-ring min-h-11 shrink-0 rounded-md px-2 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => handleClearFacility(facility.id)}
                  disabled={disabled || !hasOverride}
                >
                  Clear this place
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground"
                  htmlFor={`${facility.id}-queue`}
                >
                  Queue / wait (min)
                  <input
                    id={`${facility.id}-queue`}
                    name={`${facility.id}-queue`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    className="gw-input gw-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
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
                        : undefined
                    }
                    placeholder="No override"
                  />
                  {fieldErrors[queueKey] ? (
                    <span
                      id={`${facility.id}-queue-error`}
                      className="text-xs font-normal text-destructive"
                      role="alert"
                    >
                      {fieldErrors[queueKey]}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-muted-foreground">
                      Blank = no override. 0 is allowed.
                    </span>
                  )}
                </label>

                <label
                  className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground"
                  htmlFor={`${facility.id}-activity`}
                >
                  Activity (min)
                  <input
                    id={`${facility.id}-activity`}
                    name={`${facility.id}-activity`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    className="gw-input gw-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
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
                        : undefined
                    }
                    placeholder="No override"
                  />
                  {fieldErrors[activityKey] ? (
                    <span
                      id={`${facility.id}-activity-error`}
                      className="text-xs font-normal text-destructive"
                      role="alert"
                    >
                      {fieldErrors[activityKey]}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-muted-foreground">
                      Blank = no override. 0 is allowed.
                    </span>
                  )}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
